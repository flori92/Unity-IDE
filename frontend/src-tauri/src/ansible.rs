use std::process::Command;
use std::path::Path;
use anyhow::Result;
use serde::{Serialize, Deserialize};
use std::fs;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybookInfo {
    pub name: String,
    pub path: String,
    pub hosts: Vec<String>,
    pub tasks: Vec<TaskInfo>,
    pub variables: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskInfo {
    pub name: String,
    pub module: String,
    pub parameters: HashMap<String, serde_json::Value>,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InventoryHost {
    pub name: String,
    pub group: String,
    pub variables: HashMap<String, String>,
    pub ansible_host: Option<String>,
    pub ansible_user: Option<String>,
    pub ansible_port: Option<u16>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionResult {
    pub playbook: String,
    pub status: String,
    pub output: String,
    pub changed: usize,
    pub unreachable: usize,
    pub failed: usize,
    pub skipped: usize,
    pub ok: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Role {
    pub name: String,
    pub path: String,
    pub tasks: Vec<String>,
    pub handlers: Vec<String>,
    pub defaults: HashMap<String, serde_json::Value>,
}

pub struct AnsibleManager {
    inventory_path: Option<String>,
    vault_password: Option<String>,
    ansible_config: HashMap<String, String>,
}

impl AnsibleManager {
    pub fn new() -> Self {
        AnsibleManager {
            inventory_path: None,
            vault_password: None,
            ansible_config: HashMap::new(),
        }
    }

    pub fn set_inventory(&mut self, inventory_path: &str) {
        self.inventory_path = Some(inventory_path.to_string());
    }

    pub fn set_vault_password(&mut self, password: &str) {
        self.vault_password = Some(password.to_string());
    }

    pub async fn run_playbook(&self, playbook_path: &str, inventory: &str) -> Result<String> {
        let mut cmd = Command::new("ansible-playbook");
        
        cmd.arg(playbook_path)
           .arg("-i").arg(inventory);

        if let Some(vault_pass) = &self.vault_password {
            cmd.arg("--vault-password-file").arg(vault_pass);
        }

        // Add extra vars if needed
        for (key, value) in &self.ansible_config {
            cmd.arg("-e").arg(format!("{}={}", key, value));
        }

        let output = cmd.output()?;
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);

        if output.status.success() {
            Ok(stdout.to_string())
        } else {
            Err(anyhow::anyhow!("Playbook failed: {}", stderr))
        }
    }

    pub async fn run_adhoc_command(&self, hosts: &str, module: &str, args: &str) -> Result<String> {
        let mut cmd = Command::new("ansible");
        
        cmd.arg(hosts)
           .arg("-m").arg(module);

        if !args.is_empty() {
            cmd.arg("-a").arg(args);
        }

        if let Some(inventory) = &self.inventory_path {
            cmd.arg("-i").arg(inventory);
        }

        let output = cmd.output()?;
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);

        if output.status.success() {
            Ok(stdout.to_string())
        } else {
            Err(anyhow::anyhow!("Command failed: {}", stderr))
        }
    }

    pub async fn check_playbook(&self, playbook_path: &str, inventory: &str) -> Result<String> {
        let mut cmd = Command::new("ansible-playbook");
        
        cmd.arg(playbook_path)
           .arg("-i").arg(inventory)
           .arg("--check")  // Dry run
           .arg("--diff");  // Show differences

        let output = cmd.output()?;
        
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }

    pub async fn list_hosts(&self, pattern: Option<&str>) -> Result<Vec<String>> {
        let mut cmd = Command::new("ansible");
        
        cmd.arg(pattern.unwrap_or("all"))
           .arg("--list-hosts");

        if let Some(inventory) = &self.inventory_path {
            cmd.arg("-i").arg(inventory);
        }

        let output = cmd.output()?;
        
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let hosts: Vec<String> = stdout
                .lines()
                .skip(1) // Skip header line
                .map(|line| line.trim().to_string())
                .filter(|line| !line.is_empty())
                .collect();
            Ok(hosts)
        } else {
            Err(anyhow::anyhow!("Failed to list hosts"))
        }
    }

    pub async fn parse_inventory(&self, inventory_path: &str) -> Result<Vec<InventoryHost>> {
        // Parse Ansible inventory file (INI or YAML format)
        // This is a simplified implementation
        let content = fs::read_to_string(inventory_path)?;
        let mut hosts = Vec::new();
        let mut current_group = "ungrouped".to_string();

        for line in content.lines() {
            let line = line.trim();
            
            if line.starts_with('[') && line.ends_with(']') {
                current_group = line[1..line.len()-1].to_string();
            } else if !line.is_empty() && !line.starts_with('#') {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if !parts.is_empty() {
                    let mut host = InventoryHost {
                        name: parts[0].to_string(),
                        group: current_group.clone(),
                        variables: HashMap::new(),
                        ansible_host: None,
                        ansible_user: None,
                        ansible_port: None,
                    };

                    // Parse host variables
                    for part in parts.iter().skip(1) {
                        if let Some((key, value)) = part.split_once('=') {
                            match key {
                                "ansible_host" => host.ansible_host = Some(value.to_string()),
                                "ansible_user" => host.ansible_user = Some(value.to_string()),
                                "ansible_port" => host.ansible_port = value.parse().ok(),
                                _ => { host.variables.insert(key.to_string(), value.to_string()); }
                            }
                        }
                    }

                    hosts.push(host);
                }
            }
        }

        Ok(hosts)
    }

    pub async fn create_playbook(&self, playbook: &PlaybookInfo) -> Result<()> {
        // Generate YAML playbook from PlaybookInfo
        let yaml_content = self.generate_playbook_yaml(playbook)?;
        fs::write(&playbook.path, yaml_content)?;
        Ok(())
    }

    pub async fn create_role(&self, role_name: &str, role_path: &str) -> Result<()> {
        let mut cmd = Command::new("ansible-galaxy");
        
        cmd.arg("role")
           .arg("init")
           .arg(role_name)
           .arg("--init-path").arg(role_path);

        let output = cmd.output()?;
        
        if output.status.success() {
            Ok(())
        } else {
            Err(anyhow::anyhow!("Failed to create role"))
        }
    }

    pub async fn lint_playbook(&self, playbook_path: &str) -> Result<Vec<String>> {
        let mut cmd = Command::new("ansible-lint");
        
        cmd.arg(playbook_path);

        let output = cmd.output()?;
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        let issues: Vec<String> = stdout
            .lines()
            .map(|line| line.to_string())
            .collect();
        
        Ok(issues)
    }

    pub async fn encrypt_file(&self, file_path: &str) -> Result<()> {
        let mut cmd = Command::new("ansible-vault");
        
        cmd.arg("encrypt")
           .arg(file_path);

        if let Some(vault_pass) = &self.vault_password {
            cmd.arg("--vault-password-file").arg(vault_pass);
        }

        let output = cmd.output()?;
        
        if output.status.success() {
            Ok(())
        } else {
            Err(anyhow::anyhow!("Failed to encrypt file"))
        }
    }

    pub async fn decrypt_file(&self, file_path: &str) -> Result<()> {
        let mut cmd = Command::new("ansible-vault");
        
        cmd.arg("decrypt")
           .arg(file_path);

        if let Some(vault_pass) = &self.vault_password {
            cmd.arg("--vault-password-file").arg(vault_pass);
        }

        let output = cmd.output()?;
        
        if output.status.success() {
            Ok(())
        } else {
            Err(anyhow::anyhow!("Failed to decrypt file"))
        }
    }

    fn generate_playbook_yaml(&self, playbook: &PlaybookInfo) -> Result<String> {
        // Generate YAML content from PlaybookInfo
        let mut yaml = String::new();
        yaml.push_str("---\n");
        yaml.push_str(&format!("- name: {}\n", playbook.name));
        yaml.push_str(&format!("  hosts: {}\n", playbook.hosts.join(",")));
        
        if !playbook.variables.is_empty() {
            yaml.push_str("  vars:\n");
            for (key, value) in &playbook.variables {
                yaml.push_str(&format!("    {}: {}\n", key, value));
            }
        }

        yaml.push_str("  tasks:\n");
        for task in &playbook.tasks {
            yaml.push_str(&format!("    - name: {}\n", task.name));
            yaml.push_str(&format!("      {}: \n", task.module));
            for (key, value) in &task.parameters {
                yaml.push_str(&format!("        {}: {}\n", key, value));
            }
            if !task.tags.is_empty() {
                yaml.push_str(&format!("      tags: {}\n", task.tags.join(", ")));
            }
        }

        Ok(yaml)
    }
}
