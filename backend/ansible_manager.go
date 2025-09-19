package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

// AnsibleManager handles all Ansible operations
type AnsibleManager struct {
	WorkDir        string
	InventoryPath  string
	PlaybooksPath  string
	RolesPath      string
	VaultPassword  string
}

// Playbook represents an Ansible playbook
type Playbook struct {
	Name        string                 `json:"name"`
	Path        string                 `json:"path"`
	Description string                 `json:"description"`
	Tags        []string               `json:"tags"`
	Variables   map[string]interface{} `json:"variables"`
	Hosts       string                 `json:"hosts"`
}

// Inventory represents Ansible inventory
type Inventory struct {
	Name   string              `json:"name"`
	Groups map[string][]string `json:"groups"`
	Vars   map[string]interface{} `json:"vars"`
}

// PlaybookExecution represents a playbook run
type PlaybookExecution struct {
	ID         string   `json:"id"`
	Playbook   string   `json:"playbook"`
	Status     string   `json:"status"` // running, success, failed
	StartTime  string   `json:"startTime"`
	EndTime    string   `json:"endTime"`
	Output     string   `json:"output"`
	ExitCode   int      `json:"exitCode"`
	Hosts      []string `json:"hosts"`
	ExtraVars  map[string]interface{} `json:"extraVars"`
}

// NewAnsibleManager creates a new Ansible manager
func NewAnsibleManager() *AnsibleManager {
	homeDir, _ := os.UserHomeDir()
	
	return &AnsibleManager{
		WorkDir:       filepath.Join(homeDir, ".devops-unity", "ansible"),
		InventoryPath: filepath.Join(homeDir, ".devops-unity", "ansible", "inventory"),
		PlaybooksPath: filepath.Join(homeDir, ".devops-unity", "ansible", "playbooks"),
		RolesPath:     filepath.Join(homeDir, ".devops-unity", "ansible", "roles"),
	}
}

// Initialize sets up the Ansible working directory
func (am *AnsibleManager) Initialize() error {
	// Create directories
	dirs := []string{am.WorkDir, am.InventoryPath, am.PlaybooksPath, am.RolesPath}
	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return fmt.Errorf("failed to create directory %s: %v", dir, err)
		}
	}

	// Create default inventory if it doesn't exist
	defaultInventory := filepath.Join(am.InventoryPath, "hosts.ini")
	if _, err := os.Stat(defaultInventory); os.IsNotExist(err) {
		content := `[local]
localhost ansible_connection=local

[servers]
# Add your servers here

[all:vars]
ansible_python_interpreter=/usr/bin/python3
`
		ioutil.WriteFile(defaultInventory, []byte(content), 0644)
	}

	return nil
}

// ListPlaybooks returns all available playbooks
func (am *AnsibleManager) ListPlaybooks() ([]Playbook, error) {
	var playbooks []Playbook

	// Read playbooks directory
	files, err := ioutil.ReadDir(am.PlaybooksPath)
	if err != nil {
		return playbooks, err
	}

	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".yml") || strings.HasSuffix(file.Name(), ".yaml") {
			playbook := Playbook{
				Name: file.Name(),
				Path: filepath.Join(am.PlaybooksPath, file.Name()),
			}
			
			// Read playbook content to extract metadata (ignored for now)
            _, _ = ioutil.ReadFile(playbook.Path)
			// Parse YAML to extract description, tags, etc.
			// For now, we'll use the filename as description
			playbook.Description = fmt.Sprintf("Playbook: %s", file.Name())
			
			playbooks = append(playbooks, playbook)
		}
	}

	return playbooks, nil
}

// RunPlaybook executes an Ansible playbook
func (am *AnsibleManager) RunPlaybook(playbookPath string, inventory string, extraVars map[string]interface{}) (*PlaybookExecution, error) {
	execution := &PlaybookExecution{
		ID:        fmt.Sprintf("exec-%d", time.Now().Unix()),
		Playbook:  playbookPath,
		Status:    "running",
		StartTime: time.Now().Format(time.RFC3339),
		ExtraVars: extraVars,
	}

	// Build ansible-playbook command
	args := []string{
		"-i", inventory,
		playbookPath,
	}

	// Add extra variables
	for key, value := range extraVars {
		args = append(args, "-e", fmt.Sprintf("%s=%v", key, value))
	}

	// Add verbosity
	args = append(args, "-vv")

	// Execute the command
	cmd := exec.Command("ansible-playbook", args...)
	cmd.Dir = am.WorkDir
	
	// Capture output
	output, err := cmd.CombinedOutput()
	execution.Output = string(output)
	execution.EndTime = time.Now().Format(time.RFC3339)
	
	if err != nil {
		execution.Status = "failed"
		if exitError, ok := err.(*exec.ExitError); ok {
			execution.ExitCode = exitError.ExitCode()
		}
	} else {
		execution.Status = "success"
		execution.ExitCode = 0
	}

	return execution, nil
}

// GetInventory returns the current inventory
func (am *AnsibleManager) GetInventory() (*Inventory, error) {
	inventory := &Inventory{
		Name:   "default",
		Groups: make(map[string][]string),
		Vars:   make(map[string]interface{}),
	}

	// Parse inventory file
	inventoryFile := filepath.Join(am.InventoryPath, "hosts.ini")
	content, err := ioutil.ReadFile(inventoryFile)
	if err != nil {
		return nil, err
	}

	// Simple INI parser (basic implementation)
	lines := strings.Split(string(content), "\n")
	currentGroup := ""
	
	for _, line := range lines {
		line = strings.TrimSpace(line)
		
		// Skip comments and empty lines
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		
		// Group header
		if strings.HasPrefix(line, "[") && strings.HasSuffix(line, "]") {
			currentGroup = strings.Trim(line, "[]")
			if !strings.Contains(currentGroup, ":") {
				inventory.Groups[currentGroup] = []string{}
			}
			continue
		}
		
		// Host entry
		if currentGroup != "" && !strings.Contains(currentGroup, ":") {
			parts := strings.Fields(line)
			if len(parts) > 0 {
				inventory.Groups[currentGroup] = append(inventory.Groups[currentGroup], parts[0])
			}
		}
	}

	return inventory, nil
}

// UpdateInventory updates the inventory file
func (am *AnsibleManager) UpdateInventory(inventory *Inventory) error {
	var content strings.Builder
	
	// Write groups and hosts
	for group, hosts := range inventory.Groups {
		content.WriteString(fmt.Sprintf("[%s]\n", group))
		for _, host := range hosts {
			content.WriteString(fmt.Sprintf("%s\n", host))
		}
		content.WriteString("\n")
	}
	
	// Write variables
	if len(inventory.Vars) > 0 {
		content.WriteString("[all:vars]\n")
		for key, value := range inventory.Vars {
			content.WriteString(fmt.Sprintf("%s=%v\n", key, value))
		}
	}
	
	inventoryFile := filepath.Join(am.InventoryPath, "hosts.ini")
	return ioutil.WriteFile(inventoryFile, []byte(content.String()), 0644)
}

// CreatePlaybook creates a new playbook
func (am *AnsibleManager) CreatePlaybook(playbook *Playbook) error {
	// Generate YAML content
	var content strings.Builder
	content.WriteString("---\n")
	content.WriteString(fmt.Sprintf("- name: %s\n", playbook.Name))
	content.WriteString(fmt.Sprintf("  hosts: %s\n", playbook.Hosts))
	content.WriteString("  become: yes\n")
	content.WriteString("  tasks:\n")
	
	// Add a sample task
	content.WriteString("    - name: Ensure system is up to date\n")
	content.WriteString("      apt:\n")
	content.WriteString("        update_cache: yes\n")
	content.WriteString("        upgrade: yes\n")
	content.WriteString("      when: ansible_os_family == 'Debian'\n")
	
	playbookPath := filepath.Join(am.PlaybooksPath, playbook.Name)
	if !strings.HasSuffix(playbookPath, ".yml") {
		playbookPath += ".yml"
	}
	
	return ioutil.WriteFile(playbookPath, []byte(content.String()), 0644)
}

// ValidatePlaybook validates a playbook syntax
func (am *AnsibleManager) ValidatePlaybook(playbookPath string) error {
	cmd := exec.Command("ansible-playbook", "--syntax-check", playbookPath)
	cmd.Dir = am.WorkDir
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("playbook validation failed: %s", string(output))
	}
	
	return nil
}

// InstallRole installs an Ansible Galaxy role
func (am *AnsibleManager) InstallRole(roleName string) error {
	cmd := exec.Command("ansible-galaxy", "role", "install", roleName, "-p", am.RolesPath)
	cmd.Dir = am.WorkDir
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to install role: %s", string(output))
	}
	
	return nil
}

// GetAnsibleVersion returns the installed Ansible version
func (am *AnsibleManager) GetAnsibleVersion() (string, error) {
	cmd := exec.Command("ansible", "--version")
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	
	lines := strings.Split(string(output), "\n")
	if len(lines) > 0 {
		return lines[0], nil
	}
	
	return "unknown", nil
}

// HTTP Handlers for Ansible endpoints

func (lb *LocalBackend) setupAnsibleRoutes() {
	ansible := NewAnsibleManager()
	ansible.Initialize()
	
	// Ansible routes
	lb.router.HandleFunc("/api/ansible/playbooks", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "GET":
			playbooks, err := ansible.ListPlaybooks()
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			json.NewEncoder(w).Encode(playbooks)
		case "POST":
			var playbook Playbook
			if err := json.NewDecoder(r.Body).Decode(&playbook); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			if err := ansible.CreatePlaybook(&playbook); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			json.NewEncoder(w).Encode(map[string]string{"status": "created"})
		}
	}).Methods("GET", "POST")
	
	lb.router.HandleFunc("/api/ansible/playbooks/run", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Playbook  string                 `json:"playbook"`
			Inventory string                 `json:"inventory"`
			ExtraVars map[string]interface{} `json:"extraVars"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		
		execution, err := ansible.RunPlaybook(req.Playbook, req.Inventory, req.ExtraVars)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		json.NewEncoder(w).Encode(execution)
	}).Methods("POST")
	
	lb.router.HandleFunc("/api/ansible/inventory", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "GET":
			inventory, err := ansible.GetInventory()
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			json.NewEncoder(w).Encode(inventory)
		case "PUT":
			var inventory Inventory
			if err := json.NewDecoder(r.Body).Decode(&inventory); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			if err := ansible.UpdateInventory(&inventory); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
		}
	}).Methods("GET", "PUT")
	
	lb.router.HandleFunc("/api/ansible/roles/install", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			RoleName string `json:"roleName"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		
		if err := ansible.InstallRole(req.RoleName); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		
		json.NewEncoder(w).Encode(map[string]string{"status": "installed"})
	}).Methods("POST")
	
	lb.router.HandleFunc("/api/ansible/version", func(w http.ResponseWriter, r *http.Request) {
		version, err := ansible.GetAnsibleVersion()
		if err != nil {
			http.Error(w, "Ansible not installed", http.StatusServiceUnavailable)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"version": version})
	}).Methods("GET")
}
