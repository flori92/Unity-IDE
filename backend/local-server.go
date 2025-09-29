package main

import (
	"encoding/json"
	"log"
	"net/http"

	"/Users/floriace/Unity Devops/Unity-IDE/backend/pkg/ansible"

	"/Users/floriace/Unity Devops/Unity-IDE/backend/pkg/kubernetes"

	"/Users/floriace/Unity Devops/Unity-IDE/backend/pkg/docker"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type LocalBackend struct {
	port   string
	router *mux.Router
	// Terminal/exec endpoints
	lb.router.HandleFunc("/api/host/exec", lb.execHostCommand).Methods("POST")
	lb.router.HandleFunc("/api/docker/container/exec", lb.execContainerCommand).Methods("POST")
}

func NewLocalBackend() *LocalBackend {
	return &LocalBackend{
		port:   "9090",
		router: mux.NewRouter(),
	}
}

func (lb *LocalBackend) setupRoutes() {
	lb.router.HandleFunc("/api/health", lb.healthCheck).Methods("GET")
	
	// Monitoring endpoints
	lb.router.HandleFunc("/api/metrics/system", lb.getSystemMetrics).Methods("GET")
	lb.router.HandleFunc("/api/metrics/containers", lb.getContainerMetrics).Methods("GET")
	lb.router.HandleFunc("/api/monitoring/start", lb.startMonitoring).Methods("POST")
	lb.router.HandleFunc("/api/monitoring/stop", lb.stopMonitoring).Methods("POST")
	lb.router.HandleFunc("/api/monitoring/metrics/history", lb.getMetricsHistory).Methods("GET")
	lb.router.HandleFunc("/api/monitoring/alert/create", lb.createAlert).Methods("POST")
	lb.router.HandleFunc("/api/monitoring/alert/acknowledge", lb.acknowledgeAlert).Methods("POST")
	lb.router.HandleFunc("/api/monitoring/log/add", lb.addLog).Methods("POST")
	lb.router.HandleFunc("/api/monitoring/log/search", lb.searchLogs).Methods("POST")

	// Ansible endpoints
	lb.router.HandleFunc("/api/ansible/run-adhoc", lb.runAdhoc).Methods("POST")
	lb.router.HandleFunc("/api/ansible/run-playbook", lb.runPlaybook).Methods("POST")
	lb.router.HandleFunc("/api/ansible/hosts", lb.listHosts).Methods("GET")
	lb.router.HandleFunc("/api/ansible/inventory/parse", lb.parseInventory).Methods("POST")
	lb.router.HandleFunc("/api/ansible/playbook/create", lb.createPlaybook).Methods("POST")
	lb.router.HandleFunc("/api/ansible/playbook/lint", lb.lintPlaybook).Methods("POST")
	lb.router.HandleFunc("/api/ansible/playbook/encrypt", lb.encryptPlaybook).Methods("POST")
	lb.router.HandleFunc("/api/ansible/playbook/decrypt", lb.decryptPlaybook).Methods("POST")

	// Playbooks listing performant endpoint
	lb.router.HandleFunc("/api/ansible/playbooks", lb.listPlaybooks).Methods("GET")

	// Extensions endpoints
	lb.router.HandleFunc("/api/extensions/marketplace/load", lb.loadMarketplace).Methods("GET")
	lb.router.HandleFunc("/api/extensions/marketplace/search", lb.searchMarketplace).Methods("POST")
	lb.router.HandleFunc("/api/extensions/install", lb.installExtension).Methods("POST")
	lb.router.HandleFunc("/api/extensions/uninstall", lb.uninstallExtension).Methods("POST")
	lb.router.HandleFunc("/api/extensions/enable", lb.enableExtension).Methods("POST")
	lb.router.HandleFunc("/api/extensions/disable", lb.disableExtension).Methods("POST")
	lb.router.HandleFunc("/api/extensions/update", lb.updateExtension).Methods("POST")
	lb.router.HandleFunc("/api/extensions/settings/get", lb.getSettings).Methods("GET")
	lb.router.HandleFunc("/api/extensions/settings/save", lb.saveSettings).Methods("POST")

	// Docker endpoints
	lb.router.HandleFunc("/api/docker/containers", lb.listContainers).Methods("GET")
	lb.router.HandleFunc("/api/docker/container/start", lb.startContainer).Methods("POST")
	lb.router.HandleFunc("/api/docker/container/stop", lb.stopContainer).Methods("POST")
	lb.router.HandleFunc("/api/docker/container/restart", lb.restartContainer).Methods("POST")
	lb.router.HandleFunc("/api/docker/container/remove", lb.removeContainer).Methods("POST")
	lb.router.HandleFunc("/api/docker/images", lb.listImages).Methods("GET")
	lb.router.HandleFunc("/api/docker/image/pull", lb.pullImage).Methods("POST")
	lb.router.HandleFunc("/api/docker/image/remove", lb.removeImage).Methods("POST")
	lb.router.HandleFunc("/api/docker/container/logs", lb.getContainerLogs).Methods("POST")

	// Kubernetes endpoints
	lb.router.HandleFunc("/api/k8s/clusters", lb.listClusters).Methods("GET")
	lb.router.HandleFunc("/api/k8s/namespaces", lb.listNamespaces).Methods("GET")
	lb.router.HandleFunc("/api/k8s/pods", lb.listPods).Methods("GET")
	lb.router.HandleFunc("/api/k8s/pod/logs", lb.getPodLogs).Methods("POST")
	lb.router.HandleFunc("/api/k8s/pod/exec", lb.execPodCommand).Methods("POST")
	lb.router.HandleFunc("/api/k8s/deployments", lb.listDeployments).Methods("GET")
	lb.router.HandleFunc("/api/k8s/services", lb.listServices).Methods("GET")
	lb.router.HandleFunc("/api/k8s/events", lb.listEvents).Methods("GET")
	lb.router.HandleFunc("/api/k8s/apply", lb.applyManifest).Methods("POST")
	lb.router.HandleFunc("/api/k8s/delete", lb.deleteResource).Methods("POST")
}


func (lb *LocalBackend) healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "healthy",
		"backend": "DevOps Unity IDE Local Backend",
		"version": "1.0.0",
	})
}

// Monitoring handlers
func (lb *LocalBackend) getSystemMetrics(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	// Exemple simple, à remplacer par une vraie collecte système
	metrics := map[string]interface{}{
		"cpu":    map[string]interface{}{"usage": 42.5, "cores": 8},
		"memory": map[string]interface{}{"usage": 65.2, "total": 16384},
		"disk":   map[string]interface{}{"usage": 70.0, "total": 512000},
		"uptime": 123456,
	}
	json.NewEncoder(w).Encode(metrics)
}
func (lb *LocalBackend) getContainerMetrics(w http.ResponseWriter, r *http.Request)   { w.WriteHeader(http.StatusOK); w.Write([]byte("getContainerMetrics")) }
func (lb *LocalBackend) startMonitoring(w http.ResponseWriter, r *http.Request)       { w.WriteHeader(http.StatusOK); w.Write([]byte("startMonitoring")) }
func (lb *LocalBackend) stopMonitoring(w http.ResponseWriter, r *http.Request)        { w.WriteHeader(http.StatusOK); w.Write([]byte("stopMonitoring")) }
func (lb *LocalBackend) getMetricsHistory(w http.ResponseWriter, r *http.Request)     { w.WriteHeader(http.StatusOK); w.Write([]byte("getMetricsHistory")) }
func (lb *LocalBackend) createAlert(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct {
		Message string `json:"message"`
		Severity string `json:"severity"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)
	// Stub : à remplacer par une vraie création d’alerte
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "alert_created",
		"message": req.Message,
		"severity": req.Severity,
	})
}
func (lb *LocalBackend) acknowledgeAlert(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct {
		AlertID string `json:"alertId"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)
	// Stub : à remplacer par une vraie gestion d’alerte
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "acknowledged",
		"alertId": req.AlertID,
	})
}
func (lb *LocalBackend) addLog(w http.ResponseWriter, r *http.Request)                { w.WriteHeader(http.StatusOK); w.Write([]byte("addLog")) }
func (lb *LocalBackend) searchLogs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct {
		Query string `json:"query"`
		Limit int    `json:"limit"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)
	if req.Limit <= 0 {
		req.Limit = 100
	}
	// Stub : à remplacer par une vraie recherche dans les logs
	logs := []string{"log1: ...", "log2: ...", "log3: ..."}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"logs": logs,
		"count": len(logs),
		"query": req.Query,
	})
}

// Ansible handlers
func (lb *LocalBackend) runAdhoc(w http.ResponseWriter, r *http.Request)              { w.WriteHeader(http.StatusOK); w.Write([]byte("runAdhoc")) }
func (lb *LocalBackend) runPlaybook(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct {
		Playbook  string                 `json:"playbook"`
		Inventory string                 `json:"inventory"`
		ExtraVars map[string]interface{} `json:"extraVars"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Playbook == "" {
		http.Error(w, "Paramètres playbook invalides", http.StatusBadRequest)
		return
	}
	ansibleManager := ansible.NewAnsibleManager()
	exec, err := ansibleManager.RunPlaybook(req.Playbook, req.Inventory, req.ExtraVars)
	if err != nil {
		http.Error(w, "Erreur d'exécution playbook: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(exec)
}
func (lb *LocalBackend) listHosts(w http.ResponseWriter, r *http.Request)             { w.WriteHeader(http.StatusOK); w.Write([]byte("listHosts")) }
// Handler performant pour la liste des playbooks Ansible
func (lb *LocalBackend) listPlaybooks(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	ansibleManager := ansible.NewAnsibleManager()
	playbooks, err := ansibleManager.ListPlaybooks()
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des playbooks: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"playbooks": playbooks,
		"count": len(playbooks),
	})
}
func (lb *LocalBackend) parseInventory(w http.ResponseWriter, r *http.Request)        { w.WriteHeader(http.StatusOK); w.Write([]byte("parseInventory")) }
func (lb *LocalBackend) createPlaybook(w http.ResponseWriter, r *http.Request)        { w.WriteHeader(http.StatusOK); w.Write([]byte("createPlaybook")) }
func (lb *LocalBackend) lintPlaybook(w http.ResponseWriter, r *http.Request)          { w.WriteHeader(http.StatusOK); w.Write([]byte("lintPlaybook")) }
func (lb *LocalBackend) encryptPlaybook(w http.ResponseWriter, r *http.Request)       { w.WriteHeader(http.StatusOK); w.Write([]byte("encryptPlaybook")) }
func (lb *LocalBackend) decryptPlaybook(w http.ResponseWriter, r *http.Request)       { w.WriteHeader(http.StatusOK); w.Write([]byte("decryptPlaybook")) }

// Extension handlers
func (lb *LocalBackend) loadMarketplace(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	// Stub : à remplacer par une vraie récupération du marketplace
	marketplace := []map[string]interface{}{
		{"id": "ext1", "name": "K8s Tools", "description": "Outils avancés Kubernetes"},
		{"id": "ext2", "name": "Docker Helper", "description": "Gestion simplifiée Docker"},
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"marketplace": marketplace,
		"count": len(marketplace),
	})
}
func (lb *LocalBackend) searchMarketplace(w http.ResponseWriter, r *http.Request)     { w.WriteHeader(http.StatusOK); w.Write([]byte("searchMarketplace")) }
func (lb *LocalBackend) installExtension(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct {
		ExtensionID string `json:"extensionId"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)
	// Stub : à remplacer par une vraie installation
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "installed",
		"extensionId": req.ExtensionID,
	})
}
func (lb *LocalBackend) uninstallExtension(w http.ResponseWriter, r *http.Request)    { w.WriteHeader(http.StatusOK); w.Write([]byte("uninstallExtension")) }
func (lb *LocalBackend) enableExtension(w http.ResponseWriter, r *http.Request)       { w.WriteHeader(http.StatusOK); w.Write([]byte("enableExtension")) }
func (lb *LocalBackend) disableExtension(w http.ResponseWriter, r *http.Request)      { w.WriteHeader(http.StatusOK); w.Write([]byte("disableExtension")) }
func (lb *LocalBackend) updateExtension(w http.ResponseWriter, r *http.Request)       { w.WriteHeader(http.StatusOK); w.Write([]byte("updateExtension")) }
func (lb *LocalBackend) getSettings(w http.ResponseWriter, r *http.Request)           { w.WriteHeader(http.StatusOK); w.Write([]byte("getSettings")) }
func (lb *LocalBackend) saveSettings(w http.ResponseWriter, r *http.Request)          { w.WriteHeader(http.StatusOK); w.Write([]byte("saveSettings")) }

// Docker handlers
func (lb *LocalBackend) listContainers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	// TODO: factoriser l'init ailleurs si besoin
	dockerManager, err := docker.NewDockerManager()
	if err != nil {
		http.Error(w, "Docker non disponible: "+err.Error(), http.StatusServiceUnavailable)
		return
	}
	containers, err := dockerManager.ListContainers()
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des conteneurs: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"containers": containers,
		"count": len(containers),
	})
}
func (lb *LocalBackend) startContainer(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct{ ID string `json:"id"` }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.ID == "" {
		http.Error(w, "ID de conteneur manquant ou invalide", http.StatusBadRequest)
		return
	}
	dockerManager, err := docker.NewDockerManager()
	if err != nil {
		http.Error(w, "Docker non disponible: "+err.Error(), http.StatusServiceUnavailable)
		return
	}
	if err := dockerManager.StartContainer(req.ID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"status": "started", "id": req.ID})
}
func (lb *LocalBackend) stopContainer(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct{ ID string `json:"id"` }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.ID == "" {
		http.Error(w, "ID de conteneur manquant ou invalide", http.StatusBadRequest)
		return
	}
	dockerManager, err := docker.NewDockerManager()
	if err != nil {
		http.Error(w, "Docker non disponible: "+err.Error(), http.StatusServiceUnavailable)
		return
	}
	if err := dockerManager.StopContainer(req.ID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"status": "stopped", "id": req.ID})
}
func (lb *LocalBackend) restartContainer(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct{ ID string `json:"id"` }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.ID == "" {
		http.Error(w, "ID de conteneur manquant ou invalide", http.StatusBadRequest)
		return
	}
	dockerManager, err := docker.NewDockerManager()
	if err != nil {
		http.Error(w, "Docker non disponible: "+err.Error(), http.StatusServiceUnavailable)
		return
	}
	if err := dockerManager.StopContainer(req.ID); err != nil {
		http.Error(w, "Erreur lors de l'arrêt: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if err := dockerManager.StartContainer(req.ID); err != nil {
		http.Error(w, "Erreur lors du redémarrage: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"status": "restarted", "id": req.ID})
}
func (lb *LocalBackend) removeContainer(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct{ ID string `json:"id"` }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.ID == "" {
		http.Error(w, "ID de conteneur manquant ou invalide", http.StatusBadRequest)
		return
	}
	dockerManager, err := docker.NewDockerManager()
	if err != nil {
		http.Error(w, "Docker non disponible: "+err.Error(), http.StatusServiceUnavailable)
		return
	}
	if err := dockerManager.RemoveContainer(req.ID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"status": "removed", "id": req.ID})
}
func (lb *LocalBackend) listImages(w http.ResponseWriter, r *http.Request) {
// Handler performant pour récupérer les logs d’un conteneur Docker
func (lb *LocalBackend) getContainerLogs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct {
		ID   string `json:"id"`
		Tail int    `json:"tail"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.ID == "" {
		http.Error(w, "ID de conteneur manquant ou invalide", http.StatusBadRequest)
		return
	}
	if req.Tail <= 0 {
		req.Tail = 100
	}
	dockerManager, err := docker.NewDockerManager()
	if err != nil {
		http.Error(w, "Docker non disponible: "+err.Error(), http.StatusServiceUnavailable)
		return
	}
	logs, err := dockerManager.GetContainerLogs(req.ID, req.Tail)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"logs": logs,
		"id": req.ID,
	})
}
	w.Header().Set("Content-Type", "application/json")
	dockerManager, err := docker.NewDockerManager()
	if err != nil {
		http.Error(w, "Docker non disponible: "+err.Error(), http.StatusServiceUnavailable)
		return
	}
	images, err := dockerManager.ListImages()
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des images: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"images": images,
		"count": len(images),
	})
}
func (lb *LocalBackend) pullImage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct{ Image string `json:"image"` }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Image == "" {
		http.Error(w, "Image manquante ou invalide", http.StatusBadRequest)
		return
	}
	dockerManager, err := docker.NewDockerManager()
	if err != nil {
		http.Error(w, "Docker non disponible: "+err.Error(), http.StatusServiceUnavailable)
		return
	}
	if err := dockerManager.PullImage(req.Image); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"status": "pulled", "image": req.Image})
}
func (lb *LocalBackend) removeImage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct{ Image string `json:"image"` }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Image == "" {
		http.Error(w, "Image manquante ou invalide", http.StatusBadRequest)
		return
	}
	dockerManager, err := docker.NewDockerManager()
	if err != nil {
		http.Error(w, "Docker non disponible: "+err.Error(), http.StatusServiceUnavailable)
		return
	}
	if err := dockerManager.RemoveImage(req.Image); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"status": "removed", "image": req.Image})
}

// Kubernetes handlers
func (lb *LocalBackend) listClusters(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	k8sManager, err := kubernetes.NewK8sManager()
	if err != nil {
		http.Error(w, "Kubernetes non disponible: "+err.Error(), http.StatusServiceUnavailable)
		return
	}
	nodes, err := k8sManager.ListNodes()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"nodes": nodes,
		"count": len(nodes),
	})
}
func (lb *LocalBackend) listNamespaces(w http.ResponseWriter, r *http.Request)   { w.WriteHeader(http.StatusOK); w.Write([]byte("listNamespaces")) }
func (lb *LocalBackend) listPods(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	namespace := r.URL.Query().Get("namespace")
	if namespace == "" {
		namespace = "default"
	}
	k8sManager, err := kubernetes.NewK8sManager()
	if err != nil {
		http.Error(w, "Kubernetes non disponible: "+err.Error(), http.StatusServiceUnavailable)
		return
	}
	pods, err := k8sManager.ListPods(namespace)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"pods": pods,
		"count": len(pods),
		"namespace": namespace,
	})
}
func (lb *LocalBackend) getPodLogs(w http.ResponseWriter, r *http.Request)       { w.WriteHeader(http.StatusOK); w.Write([]byte("getPodLogs")) }
// Exécution d'une commande shell locale (host)
func (lb *LocalBackend) execHostCommand(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct {
		Command string   `json:"command"`
		Args    []string `json:"args"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Command == "" {
		http.Error(w, "Commande manquante ou invalide", http.StatusBadRequest)
		return
	}
	// Sécurité : à restreindre en prod !
	out, err := exec.Command(req.Command, req.Args...).CombinedOutput()
	result := map[string]interface{}{
		"output": string(out),
		"success": err == nil,
	}
	if err != nil {
		result["error"] = err.Error()
	}
	json.NewEncoder(w).Encode(result)
}

// Exécution d'une commande dans un conteneur Docker
func (lb *LocalBackend) execContainerCommand(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct {
		ContainerID string   `json:"containerId"`
		Command     []string `json:"command"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.ContainerID == "" || len(req.Command) == 0 {
		http.Error(w, "Paramètres manquants ou invalides", http.StatusBadRequest)
		return
	}
	dockerManager, err := docker.NewDockerManager()
	if err != nil {
		http.Error(w, "Docker non disponible: "+err.Error(), http.StatusServiceUnavailable)
		return
	}
	output, err := dockerManager.ExecInContainer(req.ContainerID, req.Command)
	result := map[string]interface{}{
		"output": output,
		"success": err == nil,
	}
	if err != nil {
		result["error"] = err.Error()
	}
	json.NewEncoder(w).Encode(result)
}

// Exécution d'une commande dans un pod Kubernetes
func (lb *LocalBackend) execPodCommand(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct {
		Namespace string   `json:"namespace"`
		Pod       string   `json:"pod"`
		Container string   `json:"container"`
		Command   []string `json:"command"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Pod == "" || len(req.Command) == 0 {
		http.Error(w, "Paramètres manquants ou invalides", http.StatusBadRequest)
		return
	}
	k8sManager, err := kubernetes.NewK8sManager()
	if err != nil {
		http.Error(w, "Kubernetes non disponible: "+err.Error(), http.StatusServiceUnavailable)
		return
	}
	output, err := k8sManager.ExecInPod(req.Namespace, req.Pod, req.Container, req.Command)
	result := map[string]interface{}{
		"output": output,
		"success": err == nil,
	}
	if err != nil {
		result["error"] = err.Error()
	}
	json.NewEncoder(w).Encode(result)
}
func (lb *LocalBackend) listDeployments(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	namespace := r.URL.Query().Get("namespace")
	if namespace == "" {
		namespace = "default"
	}
	k8sManager, err := kubernetes.NewK8sManager()
	if err != nil {
		http.Error(w, "Kubernetes non disponible: "+err.Error(), http.StatusServiceUnavailable)
		return
	}
	deployments, err := k8sManager.ListDeployments(namespace)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"deployments": deployments,
		"count": len(deployments),
		"namespace": namespace,
	})
}
func (lb *LocalBackend) listServices(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	namespace := r.URL.Query().Get("namespace")
	if namespace == "" {
		namespace = "default"
	}
	k8sManager, err := kubernetes.NewK8sManager()
	if err != nil {
		http.Error(w, "Kubernetes non disponible: "+err.Error(), http.StatusServiceUnavailable)
		return
	}
	services, err := k8sManager.ListServices(namespace)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"services": services,
		"count": len(services),
		"namespace": namespace,
	})
}
func (lb *LocalBackend) listEvents(w http.ResponseWriter, r *http.Request)       { w.WriteHeader(http.StatusOK); w.Write([]byte("listEvents")) }
func (lb *LocalBackend) applyManifest(w http.ResponseWriter, r *http.Request)    { w.WriteHeader(http.StatusOK); w.Write([]byte("applyManifest")) }
func (lb *LocalBackend) deleteResource(w http.ResponseWriter, r *http.Request)   { w.WriteHeader(http.StatusOK); w.Write([]byte("deleteResource")) }

func main() {
	// Diffusion automatique des événements Kubernetes sur le WebSocket
	go func() {
		k8sManager, err := kubernetes.NewK8sManager()
		if err != nil {
			return // K8s non dispo
		}
		for {
			events, err := k8sManager.ListEvents("")
			if err == nil && len(events) > 0 {
				msg := map[string]interface{}{
					"type": "k8s-event",
					"payload": events,
				}
				data, _ := json.Marshal(msg)
				wsHub.broadcast <- data
			}
			time.Sleep(5 * time.Second)
		}
	}()

	// Diffusion automatique des exécutions Ansible sur le WebSocket (exemple)
	go func() {
		ansibleManager := ansible.NewAnsibleManager()
		for {
			// Stub : on simule une exécution récente
			exec := map[string]interface{}{
				"id": "exec_demo",
				"playbook": "deploy.yml",
				"status": "success",
				"output": "Déploiement terminé avec succès.",
				"timestamp": time.Now().Format(time.RFC3339),
			}
			msg := map[string]interface{}{
				"type": "ansible-exec",
				"payload": exec,
			}
			data, _ := json.Marshal(msg)
			wsHub.broadcast <- data
			time.Sleep(10 * time.Second)
		}
	}()
	// Diffusion automatique des logs Docker sur le WebSocket (exemple multiplexage)
	go func() {
		dockerManager, err := docker.NewDockerManager()
		if err != nil {
			return // Docker non dispo
		}
		for {
			containers, err := dockerManager.ListContainers()
			if err == nil && len(containers) > 0 {
				for _, c := range containers {
					logs, err := dockerManager.GetContainerLogs(c.ID, 5)
					if err == nil && len(logs) > 0 {
						msg := map[string]interface{}{
							"type": "docker-log",
							"payload": map[string]interface{}{
								"container": c.Name,
								"id": c.ID,
								"logs": logs,
							},
						}
						data, _ := json.Marshal(msg)
						wsHub.broadcast <- data
					}
				}
			}
			time.Sleep(3 * time.Second)
		}
	}()
	// Diffusion automatique de métriques système sur le WebSocket (exemple multiplexage)
	go func() {
		for {
			metrics := map[string]interface{}{
				"type": "metrics",
				"payload": map[string]interface{}{
					"cpu":    map[string]interface{}{"usage": 42.5, "cores": 8},
					"memory": map[string]interface{}{"usage": 65.2, "total": 16384},
					"disk":   map[string]interface{}{"usage": 70.0, "total": 512000},
					"uptime": 123456,
				},
			}
			data, _ := json.Marshal(metrics)
			wsHub.broadcast <- data
			// Fréquence d’envoi (1s)
			time.Sleep(1 * time.Second)
		}
	}()
	backend := NewLocalBackend()
	backend.setupRoutes()

	// WebSocket hub pour le temps réel
	wsHub := newWebSocketHub()
	go wsHub.run()
	backend.router.HandleFunc("/ws", wsHub.handleWebSocket)

	handler := cors.Default().Handler(backend.router)
	log.Printf("Backend running on port %s", backend.port)
	log.Fatal(http.ListenAndServe(":"+backend.port, handler))
// WebSocket temps réel (logs, events, metrics, alertes)
type wsClient struct {
	hub  *wsHub
	conn *websocket.Conn
	send chan []byte
}

type wsHub struct {
	clients    map[*wsClient]bool
	broadcast  chan []byte
	register   chan *wsClient
	unregister chan *wsClient
}

func newWebSocketHub() *wsHub {
	return &wsHub{
		clients:    make(map[*wsClient]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *wsClient),
		unregister: make(chan *wsClient),
	}
}

func (h *wsHub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

func (c *wsClient) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
		// Ici, traiter les messages entrants si besoin (ex: souscriptions)
		// c.hub.broadcast <- message // echo pour debug
	}
}

func (c *wsClient) writePump() {
	defer c.conn.Close()
	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			c.conn.WriteMessage(websocket.TextMessage, message)
		}
	}
}

func (h *wsHub) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	client := &wsClient{hub: h, conn: conn, send: make(chan []byte, 256)}
	h.register <- client
	go client.writePump()
	go client.readPump()
}
}
