package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/rs/cors"
)

// LocalBackend represents our local backend server
type LocalBackend struct {
	port      string
	router    *mux.Router
	dockerAPI *DockerAPI
	k8sAPI    *KubernetesAPI
	metrics   *MetricsCollector
	mu        sync.RWMutex
}

// DockerAPI handles Docker operations
type DockerAPI struct {
	socketPath string
	isConnected bool
}

// KubernetesAPI handles Kubernetes operations
type KubernetesAPI struct {
	configPath string
	isConnected bool
}

// MetricsCollector collects system metrics
type MetricsCollector struct {
	interval time.Duration
	data     map[string]interface{}
	mu       sync.RWMutex
}

// Container represents a Docker container
type Container struct {
	ID       string                 `json:"id"`
	Name     string                 `json:"name"`
	Image    string                 `json:"image"`
	Status   string                 `json:"status"`
	State    string                 `json:"state"`
	Ports    []string               `json:"ports"`
	Created  time.Time              `json:"created"`
	Stats    map[string]interface{} `json:"stats"`
}

// SystemInfo represents system information
type SystemInfo struct {
	OS             string  `json:"os"`
	Arch           string  `json:"arch"`
	CPUCores       int     `json:"cpuCores"`
	MemoryGB       float64 `json:"memoryGB"`
	DockerVersion  string  `json:"dockerVersion"`
	DockerRunning  bool    `json:"dockerRunning"`
	K8sVersion     string  `json:"k8sVersion"`
	K8sConnected   bool    `json:"k8sConnected"`
}

// NewLocalBackend creates a new local backend server
func NewLocalBackend() *LocalBackend {
	return &LocalBackend{
		port:      "9090", // Different from usual ports to avoid conflicts
		router:    mux.NewRouter(),
		dockerAPI: &DockerAPI{},
		k8sAPI:    &KubernetesAPI{},
		metrics:   &MetricsCollector{
			interval: 5 * time.Second,
			data:     make(map[string]interface{}),
		},
	}
}

// Start initializes and starts the local backend server
func (lb *LocalBackend) Start() error {
	// Setup routes
	lb.setupRoutes()

	// Initialize Docker connection
	lb.initDocker()

	// Initialize Kubernetes connection
	lb.initKubernetes()

	// Start metrics collector
	go lb.metrics.Start()

	// Setup CORS for local development
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:*", "tauri://localhost", "https://tauri.localhost"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	handler := c.Handler(lb.router)

	// Start server
	addr := fmt.Sprintf("127.0.0.1:%s", lb.port)
	log.Printf("🚀 DevOps Unity IDE Backend starting on %s", addr)
	
	return http.ListenAndServe(addr, handler)
}

// setupRoutes configures all API routes
func (lb *LocalBackend) setupRoutes() {
	// Health check
	lb.router.HandleFunc("/api/health", lb.healthCheck).Methods("GET")
	
	// System info
	lb.router.HandleFunc("/api/system", lb.getSystemInfo).Methods("GET")
	
	// Docker endpoints
	lb.router.HandleFunc("/api/docker/containers", lb.getContainers).Methods("GET")
	lb.router.HandleFunc("/api/docker/containers/{id}/start", lb.startContainer).Methods("POST")
	lb.router.HandleFunc("/api/docker/containers/{id}/stop", lb.stopContainer).Methods("POST")
	lb.router.HandleFunc("/api/docker/containers/{id}/stats", lb.getContainerStats).Methods("GET")
	lb.router.HandleFunc("/api/docker/images", lb.getImages).Methods("GET")
	
	// Kubernetes endpoints
	lb.router.HandleFunc("/api/k8s/pods", lb.getPods).Methods("GET")
	lb.router.HandleFunc("/api/k8s/services", lb.getServices).Methods("GET")
	lb.router.HandleFunc("/api/k8s/deployments", lb.getDeployments).Methods("GET")
	lb.router.HandleFunc("/api/k8s/nodes", lb.getNodes).Methods("GET")
	
	// Metrics endpoints
	lb.router.HandleFunc("/api/metrics/system", lb.getSystemMetrics).Methods("GET")
	lb.router.HandleFunc("/api/metrics/containers", lb.getContainerMetrics).Methods("GET")

	// Proxy (Nginx) endpoints
	pm := NewProxyManager()
	pm.registerRoutes(lb)
	
	// WebSocket for real-time updates
	lb.router.HandleFunc("/ws", lb.handleWebSocket)
}

// initDocker initializes Docker connection
func (lb *LocalBackend) initDocker() {
	// Detect Docker socket based on OS
	switch runtime.GOOS {
	case "darwin", "linux":
		lb.dockerAPI.socketPath = "/var/run/docker.sock"
	case "windows":
		lb.dockerAPI.socketPath = "npipe:////./pipe/docker_engine"
	}

	// Check if Docker is running
	if _, err := os.Stat(lb.dockerAPI.socketPath); err == nil {
		lb.dockerAPI.isConnected = true
		log.Println("✅ Docker connected")
	} else {
		log.Println("⚠️ Docker not available")
	}
}

// initKubernetes initializes Kubernetes connection
func (lb *LocalBackend) initKubernetes() {
	// Check for kubeconfig
	homeDir, _ := os.UserHomeDir()
	lb.k8sAPI.configPath = fmt.Sprintf("%s/.kube/config", homeDir)
	
	if _, err := os.Stat(lb.k8sAPI.configPath); err == nil {
		lb.k8sAPI.isConnected = true
		log.Println("✅ Kubernetes config found")
	} else {
		log.Println("⚠️ Kubernetes config not found")
	}
}

// API Handlers

func (lb *LocalBackend) healthCheck(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "healthy",
		"timestamp": time.Now(),
		"backend": "DevOps Unity IDE Local Backend",
		"version": "1.0.0",
	})
}

func (lb *LocalBackend) getSystemInfo(w http.ResponseWriter, r *http.Request) {
	info := SystemInfo{
		OS:       runtime.GOOS,
		Arch:     runtime.GOARCH,
		CPUCores: runtime.NumCPU(),
		DockerRunning: lb.dockerAPI.isConnected,
		K8sConnected: lb.k8sAPI.isConnected,
	}

	// Get Docker version if available
	if lb.dockerAPI.isConnected {
		if out, err := exec.Command("docker", "version", "--format", "{{.Server.Version}}").Output(); err == nil {
			info.DockerVersion = strings.TrimSpace(string(out))
		}
	}

	// Get kubectl version if available  
	if lb.k8sAPI.isConnected {
		if out, err := exec.Command("kubectl", "version", "--client", "--short").Output(); err == nil {
			info.K8sVersion = strings.TrimSpace(string(out))
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(info)
}

func (lb *LocalBackend) getContainers(w http.ResponseWriter, r *http.Request) {
	if !lb.dockerAPI.isConnected {
		http.Error(w, "Docker not connected", http.StatusServiceUnavailable)
		return
	}

	// Execute docker ps command
	cmd := exec.Command("docker", "ps", "-a", "--format", "json")
	output, err := cmd.Output()
	if err != nil {
		http.Error(w, "Failed to get containers", http.StatusInternalServerError)
		return
	}

	// Parse and return containers
	containers := []Container{}
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if line != "" {
			var container map[string]interface{}
			if err := json.Unmarshal([]byte(line), &container); err == nil {
				containers = append(containers, Container{
					ID:     container["ID"].(string),
					Name:   container["Names"].(string),
					Image:  container["Image"].(string),
					Status: container["Status"].(string),
					State:  container["State"].(string),
				})
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(containers)
}

func (lb *LocalBackend) startContainer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	containerID := vars["id"]

	cmd := exec.Command("docker", "start", containerID)
	if err := cmd.Run(); err != nil {
		http.Error(w, "Failed to start container", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"status": "started",
		"container": containerID,
	})
}

func (lb *LocalBackend) stopContainer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	containerID := vars["id"]

	cmd := exec.Command("docker", "stop", containerID)
	if err := cmd.Run(); err != nil {
		http.Error(w, "Failed to stop container", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"status": "stopped",
		"container": containerID,
	})
}

func (lb *LocalBackend) getContainerStats(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	containerID := vars["id"]

	cmd := exec.Command("docker", "stats", containerID, "--no-stream", "--format", "json")
	output, err := cmd.Output()
	if err != nil {
		http.Error(w, "Failed to get container stats", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
}

func (lb *LocalBackend) getImages(w http.ResponseWriter, r *http.Request) {
	if !lb.dockerAPI.isConnected {
		http.Error(w, "Docker not connected", http.StatusServiceUnavailable)
		return
	}

	cmd := exec.Command("docker", "images", "--format", "json")
	output, err := cmd.Output()
	if err != nil {
		http.Error(w, "Failed to get images", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
}

func (lb *LocalBackend) getPods(w http.ResponseWriter, r *http.Request) {
	if !lb.k8sAPI.isConnected {
		http.Error(w, "Kubernetes not connected", http.StatusServiceUnavailable)
		return
	}

	cmd := exec.Command("kubectl", "get", "pods", "-A", "-o", "json")
	output, err := cmd.Output()
	if err != nil {
		http.Error(w, "Failed to get pods", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
}

func (lb *LocalBackend) getServices(w http.ResponseWriter, r *http.Request) {
	if !lb.k8sAPI.isConnected {
		http.Error(w, "Kubernetes not connected", http.StatusServiceUnavailable)
		return
	}

	cmd := exec.Command("kubectl", "get", "services", "-A", "-o", "json")
	output, err := cmd.Output()
	if err != nil {
		http.Error(w, "Failed to get services", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
}

func (lb *LocalBackend) getDeployments(w http.ResponseWriter, r *http.Request) {
	if !lb.k8sAPI.isConnected {
		http.Error(w, "Kubernetes not connected", http.StatusServiceUnavailable)
		return
	}

	cmd := exec.Command("kubectl", "get", "deployments", "-A", "-o", "json")
	output, err := cmd.Output()
	if err != nil {
		http.Error(w, "Failed to get deployments", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
}

func (lb *LocalBackend) getNodes(w http.ResponseWriter, r *http.Request) {
	if !lb.k8sAPI.isConnected {
		http.Error(w, "Kubernetes not connected", http.StatusServiceUnavailable)
		return
	}

	cmd := exec.Command("kubectl", "get", "nodes", "-o", "json")
	output, err := cmd.Output()
	if err != nil {
		http.Error(w, "Failed to get nodes", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
}

func (lb *LocalBackend) getSystemMetrics(w http.ResponseWriter, r *http.Request) {
	lb.metrics.mu.RLock()
	defer lb.metrics.mu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(lb.metrics.data)
}

func (lb *LocalBackend) getContainerMetrics(w http.ResponseWriter, r *http.Request) {
	if !lb.dockerAPI.isConnected {
		http.Error(w, "Docker not connected", http.StatusServiceUnavailable)
		return
	}

	cmd := exec.Command("docker", "stats", "--no-stream", "--format", "json")
	output, err := cmd.Output()
	if err != nil {
		http.Error(w, "Failed to get container metrics", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
}

// WebSocket handler for real-time updates
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow connections from any origin in development
	},
}

func (lb *LocalBackend) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}
	defer conn.Close()

	// Send updates every second
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			// Send current metrics
			lb.metrics.mu.RLock()
			data := lb.metrics.data
			lb.metrics.mu.RUnlock()

			if err := conn.WriteJSON(map[string]interface{}{
				"type": "metrics",
				"data": data,
				"timestamp": time.Now(),
			}); err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}
		}
	}
}

// MetricsCollector methods
func (mc *MetricsCollector) Start() {
	ticker := time.NewTicker(mc.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			mc.collect()
		}
	}
}

func (mc *MetricsCollector) collect() {
	mc.mu.Lock()
	defer mc.mu.Unlock()

	// Collect basic system metrics
	mc.data["timestamp"] = time.Now()
	mc.data["cpuCores"] = runtime.NumCPU()
	mc.data["goroutines"] = runtime.NumGoroutine()
	
	// Memory stats
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	mc.data["memoryMB"] = m.Alloc / 1024 / 1024
	mc.data["memorySystemMB"] = m.Sys / 1024 / 1024
}

func main() {
	backend := NewLocalBackend()
	
	log.Println("===============================================")
	log.Println("    DevOps Unity IDE - Local Backend Server")
	log.Println("===============================================")
	
	if err := backend.Start(); err != nil {
		log.Fatalf("Failed to start backend: %v", err)
	}
}
