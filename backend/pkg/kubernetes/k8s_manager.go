import (
	// ...existing imports...
	"bytes"
	"io"
	"k8s.io/client-go/tools/remotecommand"
	"k8s.io/client-go/rest"
)
// ExecInPod exécute une commande dans un pod Kubernetes et retourne la sortie
func (km *K8sManager) ExecInPod(namespace, pod, container string, command []string) (string, error) {
	if !km.IsConnected() {
		return "", fmt.Errorf("not connected to Kubernetes cluster")
	}
	req := km.clientset.CoreV1().RESTClient().Post().
		Resource("pods").
		Name(pod).
		Namespace(namespace).
		SubResource("exec")
	req.VersionedParams(&corev1.PodExecOptions{
		Container: container,
		Command:   command,
		Stdin:     false,
		Stdout:    true,
		Stderr:    true,
		TTY:       false,
	}, metav1.ParameterCodec)

	exec, err := remotecommand.NewSPDYExecutor(km.config, "POST", req.URL())
	if err != nil {
		return "", err
	}
	var stdout, stderr bytes.Buffer
	err = exec.Stream(remotecommand.StreamOptions{
		Stdin:  nil,
		Stdout: &stdout,
		Stderr: &stderr,
		Tty:    false,
	})
	if err != nil {
		return stderr.String(), err
	}
	return stdout.String(), nil
}
package kubernetes

import (
	"context"
	"fmt"
	"path/filepath"
	"time"

	"github.com/sirupsen/logrus"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

type K8sManager struct {
	clientset     *kubernetes.Clientset
	dynamicClient dynamic.Interface
	config        *rest.Config
	connected     bool
}

type PodInfo struct {
	Name      string            `json:"name"`
	Namespace string            `json:"namespace"`
	Status    string            `json:"status"`
	Ready     string            `json:"ready"`
	Restarts  int32             `json:"restarts"`
	Age       string            `json:"age"`
	Node      string            `json:"node"`
	Labels    map[string]string `json:"labels"`
	IP        string            `json:"ip"`
}

type ServiceInfo struct {
	Name      string            `json:"name"`
	Namespace string            `json:"namespace"`
	Type      string            `json:"type"`
	ClusterIP string            `json:"cluster_ip"`
	Ports     []string          `json:"ports"`
	Labels    map[string]string `json:"labels"`
	Age       string            `json:"age"`
}

type DeploymentInfo struct {
	Name      string            `json:"name"`
	Namespace string            `json:"namespace"`
	Replicas  int32             `json:"replicas"`
	Ready     int32             `json:"ready"`
	Available int32             `json:"available"`
	Age       string            `json:"age"`
	Labels    map[string]string `json:"labels"`
}

type NodeInfo struct {
	Name     string            `json:"name"`
	Status   string            `json:"status"`
	Roles    []string          `json:"roles"`
	Age      string            `json:"age"`
	Version  string            `json:"version"`
	Labels   map[string]string `json:"labels"`
	Capacity map[string]string `json:"capacity"`
}

func NewK8sManager() (*K8sManager, error) {
	manager := &K8sManager{
		connected: false,
	}

	// Try to connect using in-cluster config first, then kubeconfig
	config, err := rest.InClusterConfig()
	if err != nil {
		// Not in cluster, try kubeconfig
		var kubeconfig string
		if home := homedir.HomeDir(); home != "" {
			kubeconfig = filepath.Join(home, ".kube", "config")
		}

		config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			return manager, fmt.Errorf("failed to get kubeconfig: %w", err)
		}
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return manager, fmt.Errorf("failed to create clientset: %w", err)
	}

	dynamicClient, err := dynamic.NewForConfig(config)
	if err != nil {
		return manager, fmt.Errorf("failed to create dynamic client: %w", err)
	}

	manager.clientset = clientset
	manager.dynamicClient = dynamicClient
	manager.config = config
	manager.connected = true

	logrus.Info("Successfully connected to Kubernetes cluster")
	return manager, nil
}

func (km *K8sManager) IsConnected() bool {
	if !km.connected {
		return false
	}

	_, err := km.clientset.CoreV1().Nodes().List(context.TODO(), metav1.ListOptions{Limit: 1})
	return err == nil
}

func (km *K8sManager) ListPods(namespace string) ([]PodInfo, error) {
	if !km.IsConnected() {
		return nil, fmt.Errorf("not connected to Kubernetes cluster")
	}

	pods, err := km.clientset.CoreV1().Pods(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list pods: %w", err)
	}

	var result []PodInfo
	for _, pod := range pods.Items {
		ready := 0
		total := len(pod.Status.ContainerStatuses)
		for _, status := range pod.Status.ContainerStatuses {
			if status.Ready {
				ready++
			}
		}

		age := time.Since(pod.CreationTimestamp.Time).Round(time.Second).String()

		podInfo := PodInfo{
			Name:      pod.Name,
			Namespace: pod.Namespace,
			Status:    string(pod.Status.Phase),
			Ready:     fmt.Sprintf("%d/%d", ready, total),
			Restarts:  pod.Status.ContainerStatuses[0].RestartCount,
			Age:       age,
			Node:      pod.Spec.NodeName,
			Labels:    pod.Labels,
			IP:        pod.Status.PodIP,
		}
		result = append(result, podInfo)
	}

	return result, nil
}

func (km *K8sManager) ListServices(namespace string) ([]ServiceInfo, error) {
	if !km.IsConnected() {
		return nil, fmt.Errorf("not connected to Kubernetes cluster")
	}

	services, err := km.clientset.CoreV1().Services(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list services: %w", err)
	}

	var result []ServiceInfo
	for _, service := range services.Items {
		var ports []string
		for _, port := range service.Spec.Ports {
			ports = append(ports, fmt.Sprintf("%d:%d/%s", port.Port, port.TargetPort.IntVal, port.Protocol))
		}

		age := time.Since(service.CreationTimestamp.Time).Round(time.Second).String()

		serviceInfo := ServiceInfo{
			Name:      service.Name,
			Namespace: service.Namespace,
			Type:      string(service.Spec.Type),
			ClusterIP: service.Spec.ClusterIP,
			Ports:     ports,
			Labels:    service.Labels,
			Age:       age,
		}
		result = append(result, serviceInfo)
	}

	return result, nil
}

func (km *K8sManager) ListDeployments(namespace string) ([]DeploymentInfo, error) {
	if !km.IsConnected() {
		return nil, fmt.Errorf("not connected to Kubernetes cluster")
	}

	deployments, err := km.clientset.AppsV1().Deployments(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list deployments: %w", err)
	}

	var result []DeploymentInfo
	for _, deployment := range deployments.Items {
		age := time.Since(deployment.CreationTimestamp.Time).Round(time.Second).String()

		deploymentInfo := DeploymentInfo{
			Name:      deployment.Name,
			Namespace: deployment.Namespace,
			Replicas:  *deployment.Spec.Replicas,
			Ready:     deployment.Status.ReadyReplicas,
			Available: deployment.Status.AvailableReplicas,
			Age:       age,
			Labels:    deployment.Labels,
		}
		result = append(result, deploymentInfo)
	}

	return result, nil
}

func (km *K8sManager) ListNodes() ([]NodeInfo, error) {
	if !km.IsConnected() {
		return nil, fmt.Errorf("not connected to Kubernetes cluster")
	}

	nodes, err := km.clientset.CoreV1().Nodes().List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list nodes: %w", err)
	}

	var result []NodeInfo
	for _, node := range nodes.Items {
		var roles []string
		for key := range node.Labels {
			if key == "node-role.kubernetes.io/master" || key == "node-role.kubernetes.io/control-plane" {
				roles = append(roles, "master")
			} else if key == "node-role.kubernetes.io/worker" {
				roles = append(roles, "worker")
			}
		}

		status := "Unknown"
		for _, condition := range node.Status.Conditions {
			if condition.Type == corev1.NodeReady {
				if condition.Status == corev1.ConditionTrue {
					status = "Ready"
				} else {
					status = "NotReady"
				}
				break
			}
		}

		age := time.Since(node.CreationTimestamp.Time).Round(time.Second).String()

		capacity := make(map[string]string)
		for key, value := range node.Status.Capacity {
			capacity[string(key)] = value.String()
		}

		nodeInfo := NodeInfo{
			Name:     node.Name,
			Status:   status,
			Roles:    roles,
			Age:      age,
			Version:  node.Status.NodeInfo.KubeletVersion,
			Labels:   node.Labels,
			Capacity: capacity,
		}
		result = append(result, nodeInfo)
	}

	return result, nil
}

func (km *K8sManager) ApplyManifest(manifest string) error {
	if !km.IsConnected() {
		return fmt.Errorf("not connected to Kubernetes cluster")
	}

	// This is a simplified implementation
	// In a real implementation, you would parse the YAML and apply it
	// For now, we'll just log that we received a manifest
	logrus.Infof("Received manifest to apply: %s", manifest)
	return nil
}

func (km *K8sManager) DeleteResource(resourceType, name, namespace string) error {
	if !km.IsConnected() {
		return fmt.Errorf("not connected to Kubernetes cluster")
	}

	// This is a simplified implementation
	// In a real implementation, you would use the appropriate client to delete the resource
	logrus.Infof("Deleting %s/%s in namespace %s", resourceType, name, namespace)
	return nil
}

func (km *K8sManager) GetClusterInfo() (map[string]interface{}, error) {
	if !km.IsConnected() {
		return nil, fmt.Errorf("not connected to Kubernetes cluster")
	}

	version, err := km.clientset.Discovery().ServerVersion()
	if err != nil {
		return nil, fmt.Errorf("failed to get server version: %w", err)
	}

	nodes, err := km.ListNodes()
	if err != nil {
		return nil, fmt.Errorf("failed to list nodes: %w", err)
	}

	return map[string]interface{}{
		"version":    version.String(),
		"node_count": len(nodes),
		"connected":  true,
	}, nil
}
