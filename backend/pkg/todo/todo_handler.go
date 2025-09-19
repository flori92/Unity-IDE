package todo

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

// TodoHandler gère les requêtes HTTP pour les tâches
type TodoHandler struct {
	manager *TodoManager
}

// NewTodoHandler crée une nouvelle instance de TodoHandler
func NewTodoHandler(manager *TodoManager) *TodoHandler {
	return &TodoHandler{
		manager: manager,
	}
}

// RegisterRoutes enregistre les routes pour la gestion des tâches
func (h *TodoHandler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/api/todos", h.GetAllTasks).Methods("GET")
	router.HandleFunc("/api/todos/{id}", h.GetTask).Methods("GET")
	router.HandleFunc("/api/todos", h.CreateTask).Methods("POST")
	router.HandleFunc("/api/todos/{id}", h.UpdateTask).Methods("PUT")
	router.HandleFunc("/api/todos/{id}", h.DeleteTask).Methods("DELETE")
	router.HandleFunc("/api/todos/status/{status}", h.GetTasksByStatus).Methods("GET")
	router.HandleFunc("/api/todos/priority/{priority}", h.GetTasksByPriority).Methods("GET")
}

// GetAllTasks retourne toutes les tâches
func (h *TodoHandler) GetAllTasks(w http.ResponseWriter, r *http.Request) {
	tasks := h.manager.GetAllTasks()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

// GetTask retourne une tâche par son ID
func (h *TodoHandler) GetTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	task, err := h.manager.GetTaskByID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)
}

// CreateTask crée une nouvelle tâche
func (h *TodoHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
	var task Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Générer un ID unique si non fourni
	if task.ID == "" {
		task.ID = uuid.New().String()
	}

	// Définir les valeurs par défaut si non fournies
	if task.Status == "" {
		task.Status = "pending"
	}
	if task.Priority == "" {
		task.Priority = "medium"
	}

	createdTask, err := h.manager.AddTask(task)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdTask)
}

// UpdateTask met à jour une tâche existante
func (h *TodoHandler) UpdateTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var task Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// S'assurer que l'ID dans l'URL correspond à l'ID dans le corps
	task.ID = id
	task.UpdatedAt = time.Now()

	updatedTask, err := h.manager.UpdateTask(task)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedTask)
}

// DeleteTask supprime une tâche
func (h *TodoHandler) DeleteTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if err := h.manager.DeleteTask(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetTasksByStatus retourne les tâches filtrées par statut
func (h *TodoHandler) GetTasksByStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	status := vars["status"]

	tasks := h.manager.GetTasksByStatus(status)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

// GetTasksByPriority retourne les tâches filtrées par priorité
func (h *TodoHandler) GetTasksByPriority(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	priority := vars["priority"]

	tasks := h.manager.GetTasksByPriority(priority)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}