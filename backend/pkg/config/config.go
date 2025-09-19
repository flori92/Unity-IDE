package config

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type Config struct {
	Server struct {
		Port     string `json:"port"`
		Host     string `json:"host"`
		DevMode  bool   `json:"devMode"`
	} `json:"server"`
	Docker struct {
		SocketPath string `json:"socketPath"`
		APIVersion string `json:"apiVersion"`
	} `json:"docker"`
	Kubernetes struct {
		ConfigPath string `json:"configPath"`
		Context    string `json:"context"`
	} `json:"kubernetes"`
	Ansible struct {
		PlaybooksPath string `json:"playbooksPath"`
		InventoryPath string `json:"inventoryPath"`
	} `json:"ansible"`
}

var GlobalConfig Config

func LoadConfig(configPath string) error {
	if configPath == "" {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return err
		}
		configPath = filepath.Join(homeDir, ".config", "devops-unity", "config.json")
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return err
	}

	err = json.Unmarshal(data, &GlobalConfig)
	if err != nil {
		return err
	}

	// Set defaults if not specified
	if GlobalConfig.Server.Port == "" {
		GlobalConfig.Server.Port = "8080"
	}
	if GlobalConfig.Server.Host == "" {
		GlobalConfig.Server.Host = "localhost"
	}
	if GlobalConfig.Docker.SocketPath == "" {
		GlobalConfig.Docker.SocketPath = "/var/run/docker.sock"
	}
	if GlobalConfig.Kubernetes.ConfigPath == "" {
		homeDir, _ := os.UserHomeDir()
		GlobalConfig.Kubernetes.ConfigPath = filepath.Join(homeDir, ".kube", "config")
	}

	return nil
}