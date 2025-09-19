package main

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/gorilla/mux"
)

type ProxyStatus struct {
	DockerAvailable bool   `json:"dockerAvailable"`
	ContainerExists bool   `json:"containerExists"`
	ContainerRunning bool  `json:"containerRunning"`
	ContainerName   string `json:"containerName"`
	Image           string `json:"image"`
	LastReload      string `json:"lastReload"`
	HostsCount      int    `json:"hostsCount"`
}

type ProxyHost struct {
	ID         string `json:"id"`
	ServerName string `json:"serverName"`
	TargetURL  string `json:"targetUrl"`
	SSLMode    string `json:"sslMode"` // none | letsencrypt | custom
	Enabled    bool   `json:"enabled"`
}

type ProxyManager struct {
	containerName string
	configDir     string
	dataFile      string
}

func NewProxyManager() *ProxyManager {
	base := filepath.Join("backend", "data", "proxy")
	_ = os.MkdirAll(filepath.Join(base, "nginx", "conf.d"), 0o755)
	return &ProxyManager{
		containerName: "nginx-proxy",
		configDir:     filepath.Join(base, "nginx", "conf.d"),
		dataFile:      filepath.Join(base, "hosts.json"),
	}
}

func (pm *ProxyManager) registerRoutes(lb *LocalBackend) {
	lb.router.HandleFunc("/api/proxy/status", pm.handleStatus).Methods("GET")
	lb.router.HandleFunc("/api/proxy/hosts", pm.handleGetHosts).Methods("GET")
	lb.router.HandleFunc("/api/proxy/hosts", pm.handleCreateHost).Methods("POST")
	lb.router.HandleFunc("/api/proxy/hosts/{id}", pm.handleUpdateHost).Methods("PUT")
	lb.router.HandleFunc("/api/proxy/hosts/{id}", pm.handleDeleteHost).Methods("DELETE")
	lb.router.HandleFunc("/api/proxy/apply", pm.handleApply).Methods("POST")
	lb.router.HandleFunc("/api/proxy/reload", pm.handleReload).Methods("POST")
	lb.router.HandleFunc("/api/proxy/logs", pm.handleLogs).Methods("GET")
}

// Handlers
func (pm *ProxyManager) handleStatus(w http.ResponseWriter, r *http.Request) {
	status := ProxyStatus{ContainerName: pm.containerName, Image: "jwilder/nginx-proxy:latest"}
	// Docker available?
	if _, err := os.Stat("/var/run/docker.sock"); err == nil {
		status.DockerAvailable = true
	}
	// Container exists and running?
	if status.DockerAvailable {
		if out, err := exec.Command("docker", "ps", "-a", "--filter", fmt.Sprintf("name=%s", pm.containerName), "--format", "{{.Names}} {{.Status}} {{.Image}}").Output(); err == nil {
			line := strings.TrimSpace(string(out))
			if line != "" {
				status.ContainerExists = true
				parts := strings.SplitN(line, " ", 3)
				if len(parts) >= 2 && strings.Contains(strings.ToLower(parts[1]), "up") {
					status.ContainerRunning = true
				}
				if len(parts) == 3 {
					status.Image = parts[2]
				}
			}
		}
	}
	// Hosts count
	hosts, _ := pm.readHosts()
	status.HostsCount = len(hosts)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(status)
}

func (pm *ProxyManager) handleGetHosts(w http.ResponseWriter, r *http.Request) {
	hosts, _ := pm.readHosts()
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(hosts)
}

func (pm *ProxyManager) handleCreateHost(w http.ResponseWriter, r *http.Request) {
	var host ProxyHost
	if err := json.NewDecoder(r.Body).Decode(&host); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	if host.ID == "" {
		host.ID = fmt.Sprintf("host-%d", time.Now().UnixNano())
	}
	hosts, _ := pm.readHosts()
	hosts = append(hosts, host)
	if err := pm.writeHosts(hosts); err != nil {
		http.Error(w, "failed to save host", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(host)
}

func (pm *ProxyManager) handleUpdateHost(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var update ProxyHost
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	hosts, _ := pm.readHosts()
	for i := range hosts {
		if hosts[i].ID == id {
			update.ID = id
			hosts[i] = update
			break
		}
	}
	if err := pm.writeHosts(hosts); err != nil {
		http.Error(w, "failed to save host", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (pm *ProxyManager) handleDeleteHost(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	hosts, _ := pm.readHosts()
	out := make([]ProxyHost, 0, len(hosts))
	for _, h := range hosts {
		if h.ID != id { out = append(out, h) }
	}
	if err := pm.writeHosts(out); err != nil {
		http.Error(w, "failed to save host", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (pm *ProxyManager) handleApply(w http.ResponseWriter, r *http.Request) {
	// generate nginx configs and reload
	hosts, _ := pm.readHosts()
	if err := pm.generateNginxConfigs(hosts); err != nil {
		http.Error(w, "failed to generate nginx config", http.StatusInternalServerError)
		return
	}
	_ = pm.reloadNginx()
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"status":"applied"})
}

func (pm *ProxyManager) handleReload(w http.ResponseWriter, r *http.Request) {
	if err := pm.reloadNginx(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"status":"reloaded"})
}

func (pm *ProxyManager) handleLogs(w http.ResponseWriter, r *http.Request) {
	if _, err := os.Stat("/var/run/docker.sock"); err != nil {
		http.Error(w, "docker not available", http.StatusServiceUnavailable)
		return
	}
	out, err := exec.Command("docker", "logs", "--tail", "200", pm.containerName).CombinedOutput()
	if err != nil {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(""))
		return
	}
	w.Header().Set("Content-Type", "text/plain")
	_, _ = w.Write(out)
}

// Helpers
func (pm *ProxyManager) readHosts() ([]ProxyHost, error) {
	b, err := os.ReadFile(pm.dataFile)
	if err != nil {
		if errorsIs(err, os.ErrNotExist) {
			_ = os.MkdirAll(filepath.Dir(pm.dataFile), 0o755)
			_ = os.WriteFile(pm.dataFile, []byte("[]"), 0o644)
			return []ProxyHost{}, nil
		}
		return nil, err
	}
	var hosts []ProxyHost
	_ = json.Unmarshal(b, &hosts)
	return hosts, nil
}

func errorsIs(err error, target error) bool { return err != nil && os.IsNotExist(err) }

func (pm *ProxyManager) writeHosts(hosts []ProxyHost) error {
	b, _ := json.MarshalIndent(hosts, "", "  ")
	_ = os.MkdirAll(filepath.Dir(pm.dataFile), 0o755)
	return os.WriteFile(pm.dataFile, b, 0o644)
}

func (pm *ProxyManager) generateNginxConfigs(hosts []ProxyHost) error {
	_ = os.MkdirAll(pm.configDir, 0o755)
	// clean existing .conf files
	_ = filepath.WalkDir(pm.configDir, func(path string, d fs.DirEntry, err error) error {
		if err == nil && !d.IsDir() && strings.HasSuffix(d.Name(), ".conf") {
			_ = os.Remove(path)
		}
		return nil
	})
	for _, h := range hosts {
		if !h.Enabled { continue }
		conf := fmt.Sprintf(`server {\n  listen 80;\n  server_name %s;\n  location / {\n    proxy_pass %s;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n    proxy_set_header X-Forwarded-Proto $scheme;\n  }\n}\n`, h.ServerName, h.TargetURL)
		fname := filepath.Join(pm.configDir, fmt.Sprintf("%s.conf", h.ID))
		if err := os.WriteFile(fname, []byte(conf), 0o644); err != nil { return err }
	}
	return nil
}

func (pm *ProxyManager) reloadNginx() error {
	if _, err := os.Stat("/var/run/docker.sock"); err != nil { return fmt.Errorf("docker not available") }
	// try hot reload, else restart container
	if err := exec.Command("docker", "exec", pm.containerName, "nginx", "-s", "reload").Run(); err == nil {
		return nil
	}
	// fallback: restart
	return exec.Command("docker", "restart", pm.containerName).Run()
}
