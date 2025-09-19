package docker

import (
 "context"
 "encoding/json"
 "fmt"
 "io"
 "time"
 containerTypes "github.com/docker/docker/api/types/container"
 imageTypes "github.com/docker/docker/api/types/image"
 dockerclient "github.com/docker/docker/client"
 "github.com/sirupsen/logrus"
)

type DockerManager struct {
	client *dockerclient.Client
}

type ContainerInfo struct {
	ID      string            `json:"id"`
	Name    string            `json:"name"`
	Image   string            `json:"image"`
	Status  string            `json:"status"`
	State   string            `json:"state"`
	Ports   []PortInfo        `json:"ports"`
	Created time.Time         `json:"created"`
	Labels  map[string]string `json:"labels"`
}

type PortInfo struct {
	PrivatePort int    `json:"private_port"`
	PublicPort  int    `json:"public_port"`
	Type        string `json:"type"`
}

type ImageInfo struct {
	ID          string    `json:"id"`
	RepoTags    []string  `json:"repo_tags"`
	Size        int64     `json:"size"`
	Created     time.Time `json:"created"`
	VirtualSize int64     `json:"virtual_size"`
}

type ContainerStats struct {
	CPUUsage    float64 `json:"cpu_usage"`
	MemoryUsage int64   `json:"memory_usage"`
	MemoryLimit int64   `json:"memory_limit"`
	NetworkRx   int64   `json:"network_rx"`
	NetworkTx   int64   `json:"network_tx"`
	BlockRead   int64   `json:"block_read"`
	BlockWrite  int64   `json:"block_write"`
}

func NewDockerManager() (*DockerManager, error) {
	client, err := dockerclient.NewClientWithOpts(dockerclient.FromEnv, dockerclient.WithAPIVersionNegotiation())
	if err != nil {
		return nil, fmt.Errorf("failed to create Docker client: %w", err)
	}

	return &DockerManager{
		client: client,
	}, nil
}

func (dm *DockerManager) ListContainers() ([]ContainerInfo, error) {
	 containers, err := dm.client.ContainerList(context.Background(), containerTypes.ListOptions{
	 	All: true,
	 })
	if err != nil {
		return nil, fmt.Errorf("failed to list containers: %w", err)
	}

	var result []ContainerInfo
	for _, c := range containers {
		ports := make([]PortInfo, len(c.Ports))
		for i, port := range c.Ports {
			ports[i] = PortInfo{
				PrivatePort: int(port.PrivatePort),
				PublicPort:  int(port.PublicPort),
				Type:        string(port.Type),
			}
		}

		containerInfo := ContainerInfo{
			ID:      c.ID[:12],
			Name:    c.Names[0][1:], // Remove leading slash
			Image:   c.Image,
			Status:  c.Status,
			State:   c.State,
			Ports:   ports,
			Created: time.Unix(c.Created, 0),
			Labels:  c.Labels,
		}
		result = append(result, containerInfo)
	}

	return result, nil
}

func (dm *DockerManager) StartContainer(containerID string) error {
	 err := dm.client.ContainerStart(context.Background(), containerID, containerTypes.StartOptions{})
	if err != nil {
		return fmt.Errorf("failed to start container %s: %w", containerID, err)
	}
	return nil
}

func (dm *DockerManager) StopContainer(containerID string) error {
	timeout := int(30)
	 err := dm.client.ContainerStop(context.Background(), containerID, containerTypes.StopOptions{
	 	Timeout: &timeout,
	 })
	if err != nil {
		return fmt.Errorf("failed to stop container %s: %w", containerID, err)
	}
	return nil
}

func (dm *DockerManager) RemoveContainer(containerID string) error {
	 err := dm.client.ContainerRemove(context.Background(), containerID, containerTypes.RemoveOptions{
	 	Force: true,
	 })
	if err != nil {
		return fmt.Errorf("failed to remove container %s: %w", containerID, err)
	}
	return nil
}

func (dm *DockerManager) ListImages() ([]ImageInfo, error) {
	 images, err := dm.client.ImageList(context.Background(), imageTypes.ListOptions{All: true})
	if err != nil {
		return nil, fmt.Errorf("failed to list images: %w", err)
	}

	var result []ImageInfo
	for _, img := range images {
		imageInfo := ImageInfo{
			ID:          img.ID[7:19], // Short ID
			RepoTags:    img.RepoTags,
			Size:        img.Size,
			Created:     time.Unix(img.Created, 0),
			VirtualSize: img.VirtualSize,
		}
		result = append(result, imageInfo)
	}

	return result, nil
}

func (dm *DockerManager) PullImage(imageName string) error {
	 reader, err := dm.client.ImagePull(context.Background(), imageName, imageTypes.PullOptions{})
	if err != nil {
		return fmt.Errorf("failed to pull image %s: %w", imageName, err)
	}
	defer reader.Close()

	// Read the response to completion
	_, err = io.Copy(io.Discard, reader)
	if err != nil {
		return fmt.Errorf("failed to read pull response: %w", err)
	}

	logrus.Infof("Successfully pulled image: %s", imageName)
	return nil
}

func (dm *DockerManager) GetContainerStats(containerID string) (*ContainerStats, error) {
	stats, err := dm.client.ContainerStats(context.Background(), containerID, false)
	if err != nil {
		return nil, fmt.Errorf("failed to get container stats: %w", err)
	}
	defer stats.Body.Close()

	 var v containerTypes.StatsResponse
	 if err := json.NewDecoder(stats.Body).Decode(&v); err != nil {
		 return nil, fmt.Errorf("failed to decode stats: %w", err)
	 }

	// Calculate CPU usage percentage
	var cpuPercent float64
	if v.CPUStats.CPUUsage.TotalUsage > 0 && v.PreCPUStats.CPUUsage.TotalUsage > 0 {
		cpuDelta := float64(v.CPUStats.CPUUsage.TotalUsage - v.PreCPUStats.CPUUsage.TotalUsage)
		systemDelta := float64(v.CPUStats.SystemUsage - v.PreCPUStats.SystemUsage)
		if systemDelta > 0 {
			cpuPercent = (cpuDelta / systemDelta) * float64(len(v.CPUStats.CPUUsage.PercpuUsage)) * 100.0
		}
	}

	 return &ContainerStats{
	 CPUUsage:    cpuPercent,
	 MemoryUsage: int64(v.MemoryStats.Usage),
	 MemoryLimit: int64(v.MemoryStats.Limit),
	 NetworkRx:   int64(v.Networks["eth0"].RxBytes),
	 NetworkTx:   int64(v.Networks["eth0"].TxBytes),
	 BlockRead:   int64(v.BlkioStats.IoServiceBytesRecursive[0].Value),
	 BlockWrite:  int64(v.BlkioStats.IoServiceBytesRecursive[1].Value),
	 }, nil
}

func (dm *DockerManager) GetContainerLogs(containerID string, tail int) ([]string, error) {
	reader, err := dm.client.ContainerLogs(context.Background(), containerID, containerTypes.LogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Tail:       fmt.Sprintf("%d", tail),
		Timestamps: true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get container logs: %w", err)
	}
	defer reader.Close()

		var logs []string
		buf := make([]byte, 1024)
		for {
			n, err := reader.Read(buf)
			if err == io.EOF {
				break
			}
			if err != nil {
				return nil, fmt.Errorf("failed to read logs: %w", err)
			}
			logs = append(logs, string(buf[:n]))
		}
		return logs, nil
}

func (dm *DockerManager) IsConnected() bool {
	_, err := dm.client.Ping(context.Background())
	return err == nil
}
