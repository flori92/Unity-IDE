package ansible

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/sirupsen/logrus"
)

type AnsibleManager struct {
	WorkDir       string
	InventoryPath string
	PlaybooksPath string
	RolesPath     string
	VaultPassword string
	AnsiblePath   string
}

type Playbook struct {
	Name        string                 `json:"name"`
	Path        string                 `json:"path"`
	Description string                 `json:"description"`
	Tags        []string               `json:"tags"`
	Variables   map[string]interface{} `json:"variables"`
	Hosts       string                 `json:"hosts"`
	Created     time.Time              `json:"created"`
	Modified    time.Time              `json:"modified"`
}

type Inventory struct {
	Name   string                 `json:"name"`
	Groups map[string][]string    `json:"groups"`
	Vars   map[string]interface{} `json:"vars"`
	Path   string                 `json:"path"`
}

type PlaybookExecution struct {
	ID        string                 `json:"id"`
	Playbook  string                 `json:"playbook"`
	Status    string                 `json:"status"` // running, success, failed
	StartTime time.Time              `json:"start_time"`
	EndTime   *time.Time             `json:"end_time,omitempty"`
	Output    string                 `json:"output"`
	ExitCode  int                    `json:"exit_code"`
	Hosts     []string               `json:"hosts"`
	ExtraVars map[string]interface{} `json:"extra_vars"`
	Duration  time.Duration          `json:"duration,omitempty"`
}

type InventoryHost struct {
	Name    string                 `json:"name"`
	Groups  []string               `json:"groups"`
	Vars    map[string]interface{} `json:"vars"`
	Address string                 `json:"address"`
}

func NewAnsibleManager() *AnsibleManager {
	homeDir, _ := os.UserHomeDir()

	// Find ansible executable
	ansiblePath := "ansible-playbook"
	if path, err := exec.LookPath("ansible-playbook"); err == nil {
		ansiblePath = path
	}

	return &AnsibleManager{
		WorkDir:       filepath.Join(homeDir, ".devops-unity", "ansible"),
		InventoryPath: filepath.Join(homeDir, ".devops-unity", "ansible", "inventory"),
		PlaybooksPath: filepath.Join(homeDir, ".devops-unity", "ansible", "playbooks"),
		RolesPath:     filepath.Join(homeDir, ".devops-unity", "ansible", "roles"),
		AnsiblePath:   ansiblePath,
	}
}

func (am *AnsibleManager) Initialize() error {
	// Create directories
	dirs := []string{am.WorkDir, am.InventoryPath, am.PlaybooksPath, am.RolesPath}
	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return fmt.Errorf("failed to create directory %s: %w", dir, err)
		}
	}

	// Create default inventory
	defaultInventory := `[local]
localhost ansible_connection=local

[webservers]
# Add your web servers here

[databases]
# Add your database servers here
`

	inventoryFile := filepath.Join(am.InventoryPath, "default")
	if err := ioutil.WriteFile(inventoryFile, []byte(defaultInventory), 0644); err != nil {
		return fmt.Errorf("failed to create default inventory: %w", err)
	}

	// Create sample playbook
	samplePlaybook := `---
- name: Sample Playbook
  hosts: localhost
  gather_facts: yes
  tasks:
    - name: Display system information
      debug:
        msg: "Hello from DevOps Unity IDE!"
    - name: Check system uptime
      command: uptime
      register: uptime_result
    - name: Display uptime
      debug:
        var: uptime_result.stdout
`

	playbookFile := filepath.Join(am.PlaybooksPath, "sample.yml")
	if err := ioutil.WriteFile(playbookFile, []byte(samplePlaybook), 0644); err != nil {
		return fmt.Errorf("failed to create sample playbook: %w", err)
	}

	logrus.Info("Ansible manager initialized successfully")
	return nil
}

func (am *AnsibleManager) ListPlaybooks() ([]Playbook, error) {
	var playbooks []Playbook

	err := filepath.Walk(am.PlaybooksPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if strings.HasSuffix(path, ".yml") || strings.HasSuffix(path, ".yaml") {
			playbook := Playbook{
				Name:     strings.TrimSuffix(info.Name(), filepath.Ext(info.Name())),
				Path:     path,
				Created:  info.ModTime(),
				Modified: info.ModTime(),
			}

			// Try to parse playbook for more info
			content, err := ioutil.ReadFile(path)
			if err == nil {
				lines := strings.Split(string(content), "\n")
				for _, line := range lines {
					line = strings.TrimSpace(line)
					if strings.HasPrefix(line, "- name:") {
						playbook.Description = strings.TrimSpace(strings.TrimPrefix(line, "- name:"))
						break
					}
				}
			}

			playbooks = append(playbooks, playbook)
		}

		return nil
	})

	return playbooks, err
}

func (am *AnsibleManager) CreatePlaybook(playbook *Playbook) error {
	playbookPath := filepath.Join(am.PlaybooksPath, playbook.Name+".yml")

	// Generate playbook content
	content := fmt.Sprintf(`---
- name: %s
  hosts: %s
  gather_facts: yes
  vars:
    # Add your variables here
  tasks:
    - name: Sample task
      debug:
        msg: "Hello from %s"
`, playbook.Name, playbook.Hosts, playbook.Name)

	if err := ioutil.WriteFile(playbookPath, []byte(content), 0644); err != nil {
		return fmt.Errorf("failed to create playbook: %w", err)
	}

	playbook.Path = playbookPath
	playbook.Created = time.Now()
	playbook.Modified = time.Now()

	return nil
}

func (am *AnsibleManager) RunPlaybook(playbookPath, inventoryPath string, extraVars map[string]interface{}) (*PlaybookExecution, error) {
	execution := &PlaybookExecution{
		ID:        fmt.Sprintf("exec_%d", time.Now().Unix()),
		Playbook:  playbookPath,
		Status:    "running",
		StartTime: time.Now(),
		Hosts:     []string{"localhost"},
		ExtraVars: extraVars,
	}

	// Build ansible-playbook command
	args := []string{playbookPath}

	if inventoryPath != "" {
		args = append(args, "-i", inventoryPath)
	} else {
		args = append(args, "-i", filepath.Join(am.InventoryPath, "default"))
	}

	// Add extra vars
	if len(extraVars) > 0 {
		extraVarsJSON, err := json.Marshal(extraVars)
		if err == nil {
			args = append(args, "-e", string(extraVarsJSON))
		}
	}

	// Add verbose output
	args = append(args, "-v")

	logrus.Infof("Running ansible-playbook with args: %v", args)

	// Execute playbook
	cmd := exec.Command(am.AnsiblePath, args...)
	cmd.Dir = am.WorkDir

	output, err := cmd.CombinedOutput()
	execution.Output = string(output)

	if err != nil {
		execution.Status = "failed"
		execution.ExitCode = 1
		if exitError, ok := err.(*exec.ExitError); ok {
			execution.ExitCode = exitError.ExitCode()
		}
	} else {
		execution.Status = "success"
		execution.ExitCode = 0
	}

	endTime := time.Now()
	execution.EndTime = &endTime
	execution.Duration = endTime.Sub(execution.StartTime)

	logrus.Infof("Playbook execution completed with status: %s", execution.Status)
	return execution, nil
}

func (am *AnsibleManager) ListInventories() ([]Inventory, error) {
	var inventories []Inventory

	err := filepath.Walk(am.InventoryPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() {
			inventory := Inventory{
				Name: strings.TrimSuffix(info.Name(), filepath.Ext(info.Name())),
				Path: path,
			}

			// Parse inventory file
			content, err := ioutil.ReadFile(path)
			if err == nil {
				groups := make(map[string][]string)
				var currentGroup string

				lines := strings.Split(string(content), "\n")
				for _, line := range lines {
					line = strings.TrimSpace(line)
					if strings.HasPrefix(line, "[") && strings.HasSuffix(line, "]") {
						currentGroup = strings.Trim(line, "[]")
						groups[currentGroup] = []string{}
					} else if line != "" && !strings.HasPrefix(line, "#") && currentGroup != "" {
						hostname := strings.Fields(line)[0]
						groups[currentGroup] = append(groups[currentGroup], hostname)
					}
				}
				inventory.Groups = groups
			}

			inventories = append(inventories, inventory)
		}

		return nil
	})

	return inventories, err
}

func (am *AnsibleManager) CreateInventory(inventory *Inventory) error {
	inventoryPath := filepath.Join(am.InventoryPath, inventory.Name)

	var content strings.Builder
	for group, hosts := range inventory.Groups {
		content.WriteString(fmt.Sprintf("[%s]\n", group))
		for _, host := range hosts {
			content.WriteString(fmt.Sprintf("%s\n", host))
		}
		content.WriteString("\n")
	}

	if err := ioutil.WriteFile(inventoryPath, []byte(content.String()), 0644); err != nil {
		return fmt.Errorf("failed to create inventory: %w", err)
	}

	inventory.Path = inventoryPath
	return nil
}

func (am *AnsibleManager) ValidatePlaybook(playbookPath string) ([]string, error) {
	var issues []string

	// Check if file exists
	if _, err := os.Stat(playbookPath); os.IsNotExist(err) {
		issues = append(issues, "Playbook file does not exist")
		return issues, nil
	}

	// Check if ansible-playbook can parse it
	cmd := exec.Command(am.AnsiblePath, "--syntax-check", playbookPath)
	output, err := cmd.CombinedOutput()

	if err != nil {
		issues = append(issues, fmt.Sprintf("Syntax error: %s", string(output)))
	}

	return issues, nil
}

func (am *AnsibleManager) GetPlaybookInfo(playbookPath string) (*Playbook, error) {
	info, err := os.Stat(playbookPath)
	if err != nil {
		return nil, fmt.Errorf("failed to get playbook info: %w", err)
	}

	playbook := &Playbook{
		Name:     strings.TrimSuffix(info.Name(), filepath.Ext(info.Name())),
		Path:     playbookPath,
		Created:  info.ModTime(),
		Modified: info.ModTime(),
	}

	// Parse playbook content
	content, err := ioutil.ReadFile(playbookPath)
	if err != nil {
		return playbook, nil // Return basic info even if parsing fails
	}

	lines := strings.Split(string(content), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "- name:") {
			playbook.Description = strings.TrimSpace(strings.TrimPrefix(line, "- name:"))
		} else if strings.HasPrefix(line, "hosts:") {
			playbook.Hosts = strings.TrimSpace(strings.TrimPrefix(line, "hosts:"))
		}
	}

	return playbook, nil
}
