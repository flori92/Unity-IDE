// Variables globales
let API_BASE_URL = 'http://127.0.0.1:9090/api/v1';
let WS_URL = 'ws://127.0.0.1:9090/ws';

// Fonction pour charger la configuration
export const loadConfig = async () => {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    API_BASE_URL = config.apiUrl || API_BASE_URL;
    WS_URL = config.wsUrl || WS_URL;
    console.log('Configuration chargée:', { API_BASE_URL, WS_URL });
  } catch (error) {
    console.warn('Impossible de charger la configuration, utilisation des valeurs par défaut');
  }
};

// Types
export interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  state?: string;
  ports?: string[];
  created?: string;
}

export interface Pod {
  name: string;
  namespace: string;
  status: string;
  ip?: string;
  node?: string;
}

export interface Service {
  name: string;
  namespace: string;
  type: string;
  clusterIP?: string;
  ports?: string[];
}

export interface SystemInfo {
  hostname: string;
  platform: string;
  arch: string;
  cpuCores?: number;
  memoryGB?: number;
  dockerRunning?: boolean;
  dockerVersion?: string;
  kubernetesRunning?: boolean;
  k8sConnected?: boolean;
  k8sVersion?: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk?: number;
  network?: {
    rx: number;
    tx: number;
  };
}

export interface CommandResult {
  output: string;
  success: boolean;
  error?: string;
}

export interface LogsResult {
  logs: string[];
}

// Service LocalBackend
class LocalBackendService {
  private ws: WebSocket | null = null;
  private metricsCallbacks: Array<(data: any) => void> = [];
  private k8sEventCallbacks: Array<(data: any) => void> = [];
  private dockerLogCallbacks: Array<(data: any) => void> = [];
  private ansibleExecCallbacks: Array<(data: any) => void> = [];

  // WebSocket
  connectWebSocket(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }
    
    try {
      this.ws = new WebSocket(WS_URL);
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Dispatcher selon le type de message
          if (data.type === 'metrics') {
            this.metricsCallbacks.forEach(cb => cb(data.payload));
          } else if (data.type === 'k8s_event') {
            this.k8sEventCallbacks.forEach(cb => cb(data.payload));
          } else if (data.type === 'docker_log') {
            this.dockerLogCallbacks.forEach(cb => cb(data.payload));
          } else if (data.type === 'ansible_exec') {
            this.ansibleExecCallbacks.forEach(cb => cb(data.payload));
          }
        } catch (error) {
          console.error('Erreur parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribeToMetrics(callback: (data: any) => void): () => void {
    this.metricsCallbacks.push(callback);
    return () => {
      this.metricsCallbacks = this.metricsCallbacks.filter(cb => cb !== callback);
    };
  }

  subscribeToK8sEvents(callback: (data: any) => void): () => void {
    this.k8sEventCallbacks.push(callback);
    return () => {
      this.k8sEventCallbacks = this.k8sEventCallbacks.filter(cb => cb !== callback);
    };
  }

  subscribeToDockerLogs(callback: (data: any) => void): () => void {
    this.dockerLogCallbacks.push(callback);
    return () => {
      this.dockerLogCallbacks = this.dockerLogCallbacks.filter(cb => cb !== callback);
    };
  }

  subscribeToAnsibleExec(callback: (data: any) => void): () => void {
    this.ansibleExecCallbacks.push(callback);
    return () => {
      this.ansibleExecCallbacks = this.ansibleExecCallbacks.filter(cb => cb !== callback);
    };
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // System Info
  async getSystemInfo(): Promise<SystemInfo> {
    const response = await fetch(`${API_BASE_URL}/system/info`);
    if (!response.ok) {
      throw new Error('Failed to fetch system info');
    }
    return response.json();
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await fetch(`${API_BASE_URL}/system/metrics`);
    if (!response.ok) {
      throw new Error('Failed to fetch system metrics');
    }
    return response.json();
  }

  async getAlerts(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/system/alerts`);
    if (!response.ok) {
      throw new Error('Failed to fetch alerts');
    }
    const data = await response.json();
    return data.alerts || [];
  }

  // Docker
  async getContainers(): Promise<Container[]> {
    const response = await fetch(`${API_BASE_URL}/docker/containers`);
    if (!response.ok) {
      throw new Error('Failed to fetch containers');
    }
    const data = await response.json();
    return data.containers || [];
  }

  async getImages(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/docker/images`);
    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }
    const data = await response.json();
    return data.images || [];
  }

  async startContainer(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/docker/containers/${id}/start`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to start container');
    }
  }

  async stopContainer(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/docker/containers/${id}/stop`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to stop container');
    }
  }

  async restartContainer(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/docker/containers/${id}/restart`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to restart container');
    }
  }

  async removeContainer(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/docker/containers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to remove container');
    }
  }

  async getContainerLogs(id: string, lines: number): Promise<LogsResult> {
    const response = await fetch(`${API_BASE_URL}/docker/containers/${id}/logs?lines=${lines}`);
    if (!response.ok) {
      throw new Error('Failed to fetch container logs');
    }
    return response.json();
  }

  async execDockerCommand(containerId: string, command: string[]): Promise<CommandResult> {
    const response = await fetch(`${API_BASE_URL}/docker/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ container_id: containerId, command }),
    });
    if (!response.ok) {
      throw new Error('Failed to execute docker command');
    }
    return response.json();
  }

  // Kubernetes
  async getPods(namespace: string = 'default'): Promise<Pod[]> {
    const response = await fetch(`${API_BASE_URL}/k8s/pods?namespace=${namespace}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pods');
    }
    const data = await response.json();
    return data.pods || [];
  }

  async getServices(namespace: string = 'default'): Promise<Service[]> {
    const response = await fetch(`${API_BASE_URL}/k8s/services?namespace=${namespace}`);
    if (!response.ok) {
      throw new Error('Failed to fetch services');
    }
    const data = await response.json();
    return data.services || [];
  }

  async deletePod(name: string, namespace: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/k8s/pods/${namespace}/${name}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete pod');
    }
  }

  async scaleDeployment(name: string, namespace: string, replicas: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/k8s/deployments/${namespace}/${name}/scale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replicas }),
    });
    if (!response.ok) {
      throw new Error('Failed to scale deployment');
    }
  }

  async rollingRestartDeployment(name: string, namespace: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/k8s/deployments/${namespace}/${name}/restart`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to rolling restart deployment');
    }
  }

  async getPodLogs(namespace: string, pod: string, container: string, lines: number): Promise<LogsResult> {
    const response = await fetch(`${API_BASE_URL}/k8s/pods/${namespace}/${pod}/logs?container=${container}&lines=${lines}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pod logs');
    }
    return response.json();
  }

  async execK8sCommand(namespace: string, pod: string, container: string, command: string[]): Promise<CommandResult> {
    const response = await fetch(`${API_BASE_URL}/k8s/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ namespace, pod, container, command }),
    });
    if (!response.ok) {
      throw new Error('Failed to execute k8s command');
    }
    return response.json();
  }

  // Host commands
  async execHostCommand(binary: string, args: string[]): Promise<CommandResult> {
    const response = await fetch(`${API_BASE_URL}/host/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ binary, args }),
    });
    if (!response.ok) {
      throw new Error('Failed to execute host command');
    }
    return response.json();
  }

  // Ansible
  async execAnsibleAdhoc(module: string, args: string, hosts: string): Promise<CommandResult> {
    const response = await fetch(`${API_BASE_URL}/ansible/adhoc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module, args, hosts }),
    });
    if (!response.ok) {
      throw new Error('Failed to execute ansible adhoc');
    }
    return response.json();
  }

  // CI/CD
  async getWorkflows(): Promise<{ workflows: any[] }> {
    const response = await fetch(`${API_BASE_URL}/cicd/workflows`);
    if (!response.ok) {
      throw new Error('Failed to fetch workflows');
    }
    return response.json();
  }
}

// Export singleton instance
const backend = new LocalBackendService();

// Mode démo : basculer entre le vrai backend et le mock
const DEMO_MODE = (import.meta as any).env?.VITE_DEMO_MODE === 'true' || localStorage.getItem('demoMode') === 'true';

if (DEMO_MODE) {
  console.log('🎭 MODE DÉMO ACTIVÉ - Utilisation des données mock');
  console.log('💡 Pour désactiver : localStorage.removeItem("demoMode")');
}

export const localBackend = DEMO_MODE 
  ? (async () => {
      const { mockBackend } = await import('./mockBackendService');
      return mockBackend;
    })() as any as LocalBackendService
  : backend;
