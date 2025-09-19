package todo

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// Task représente une tâche dans la todo list
type Task struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"` // "pending", "in_progress", "completed"
	Priority    string    `json:"priority"` // "low", "medium", "high"
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	ProjectID   string    `json:"project_id,omitempty"`
}

// TodoManager gère les opérations sur les tâches
type TodoManager struct {
	tasks     []Task
	filePath  string
	mutex     sync.RWMutex
	dataDir   string
}

// NewTodoManager crée une nouvelle instance de TodoManager
func NewTodoManager(dataDir string) (*TodoManager, error) {
	if dataDir == "" {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return nil, fmt.Errorf("impossible de déterminer le répertoire utilisateur: %v", err)
		}
		dataDir = filepath.Join(homeDir, ".unity-ide", "data")
	}

	todoDir := filepath.Join(dataDir, "todo")
	if err := os.MkdirAll(todoDir, 0755); err != nil {
		return nil, fmt.Errorf("impossible de créer le répertoire de données: %v", err)
	}

	filePath := filepath.Join(todoDir, "tasks.json")

	manager := &TodoManager{
		tasks:    []Task{},
		filePath: filePath,
		dataDir:  todoDir,
	}

	// Charger les tâches existantes
	if _, err := os.Stat(filePath); err == nil {
		if err := manager.loadTasks(); err != nil {
			return nil, fmt.Errorf("impossible de charger les tâches: %v", err)
		}
	}

	return manager, nil
}

// loadTasks charge les tâches depuis le fichier
func (tm *TodoManager) loadTasks() error {
	tm.mutex.Lock()
	defer tm.mutex.Unlock()

	data, err := ioutil.ReadFile(tm.filePath)
	if err != nil {
		return err
	}

	return json.Unmarshal(data, &tm.tasks)
}

// saveTasks sauvegarde les tâches dans le fichier
func (tm *TodoManager) saveTasks() error {
	tm.mutex.Lock()
	defer tm.mutex.Unlock()

	data, err := json.MarshalIndent(tm.tasks, "", "  ")
	if err != nil {
		return err
	}

	return ioutil.WriteFile(tm.filePath, data, 0644)
}

// GetAllTasks retourne toutes les tâches
func (tm *TodoManager) GetAllTasks() []Task {
	tm.mutex.RLock()
	defer tm.mutex.RUnlock()

	tasks := make([]Task, len(tm.tasks))
	copy(tasks, tm.tasks)
	return tasks
}

// GetTaskByID retourne une tâche par son ID
func (tm *TodoManager) GetTaskByID(id string) (Task, error) {
	tm.mutex.RLock()
	defer tm.mutex.RUnlock()

	for _, task := range tm.tasks {
		if task.ID == id {
			return task, nil
		}
	}

	return Task{}, fmt.Errorf("tâche non trouvée avec l'ID: %s", id)
}

// AddTask ajoute une nouvelle tâche
func (tm *TodoManager) AddTask(task Task) (Task, error) {
	tm.mutex.Lock()
	defer tm.mutex.Unlock()

	// Vérifier si l'ID existe déjà
	for _, t := range tm.tasks {
		if t.ID == task.ID {
			return Task{}, fmt.Errorf("une tâche avec l'ID %s existe déjà", task.ID)
		}
	}

	// Définir les timestamps
	now := time.Now()
	task.CreatedAt = now
	task.UpdatedAt = now

	tm.tasks = append(tm.tasks, task)
	
	if err := tm.saveTasks(); err != nil {
		return Task{}, err
	}

	return task, nil
}

// UpdateTask met à jour une tâche existante
func (tm *TodoManager) UpdateTask(task Task) (Task, error) {
	tm.mutex.Lock()
	defer tm.mutex.Unlock()

	for i, t := range tm.tasks {
		if t.ID == task.ID {
			// Préserver la date de création
			task.CreatedAt = t.CreatedAt
			task.UpdatedAt = time.Now()
			
			tm.tasks[i] = task
			
			if err := tm.saveTasks(); err != nil {
				return Task{}, err
			}
			
			return task, nil
		}
	}

	return Task{}, fmt.Errorf("tâche non trouvée avec l'ID: %s", task.ID)
}

// DeleteTask supprime une tâche par son ID
func (tm *TodoManager) DeleteTask(id string) error {
	tm.mutex.Lock()
	defer tm.mutex.Unlock()

	for i, task := range tm.tasks {
		if task.ID == id {
			// Supprimer la tâche
			tm.tasks = append(tm.tasks[:i], tm.tasks[i+1:]...)
			
			return tm.saveTasks()
		}
	}

	return fmt.Errorf("tâche non trouvée avec l'ID: %s", id)
}

// GetTasksByStatus retourne les tâches filtrées par statut
func (tm *TodoManager) GetTasksByStatus(status string) []Task {
	tm.mutex.RLock()
	defer tm.mutex.RUnlock()

	var filteredTasks []Task
	for _, task := range tm.tasks {
		if task.Status == status {
			filteredTasks = append(filteredTasks, task)
		}
	}

	return filteredTasks
}

// GetTasksByPriority retourne les tâches filtrées par priorité
func (tm *TodoManager) GetTasksByPriority(priority string) []Task {
	tm.mutex.RLock()
	defer tm.mutex.RUnlock()

	var filteredTasks []Task
	for _, task := range tm.tasks {
		if task.Priority == priority {
			filteredTasks = append(filteredTasks, task)
		}
	}

	return filteredTasks
}