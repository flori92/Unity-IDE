// Mode démo avec données mock
import type { Container, Pod, Service, SystemInfo, SystemMetrics, CommandResult, LogsResult } from './localBackendService';

// Données mock pour le mode démo
const mockContainers: Container[] = [
  {
    id: 'abc123',
    name: 'web-server',
    image: 'nginx:latest',
    status: 'running',
    state: 'Running',
    ports: ['80:80', '443:443'],
    created: '2024-01-15T10:30:00Z',
  },
  {
    id: 'def456',
    name: 'api-backend',
    image: 'node:18-alpine',
    status: 'running',
    state: 'Running',
    ports: ['3000:3000'],
    created: '2024-01-15T10:35:00Z',
  },
  {
    id: 'ghi789',
    name: 'redis-cache',
    image: 'redis:7-alpine',
    status: 'running',
    state: 'Running',
    ports: ['6379:6379'],
    created: '2024-01-15T10:40:00Z',
  },
];

const mockPods: Pod[] = [
  {
    name: 'frontend-deployment-5f7b9c8d-x9k2m',
    namespace: 'default',
    status: 'Running',
    ip: '10.244.0.15',
    node: 'node-1',
  },
  {
    name: 'backend-api-7d8c9f-h4j6k',
    namespace: 'default',
    status: 'Running',
    ip: '10.244.0.16',
    node: 'node-1',
  },
  {
    name: 'database-statefulset-0',
    namespace: 'default',
    status: 'Running',
    ip: '10.244.0.17',
    node: 'node-2',
  },
];

const mockServices: Service[] = [
  {
    name: 'frontend-service',
    namespace: 'default',
    type: 'LoadBalancer',
    clusterIP: '10.96.0.10',
    ports: ['80:30080'],
  },
  {
    name: 'backend-api-service',
    namespace: 'default',
    type: 'ClusterIP',
    clusterIP: '10.96.0.11',
    ports: ['3000:3000'],
  },
];

const mockSystemInfo: SystemInfo = {
  hostname: 'demo-machine',
  platform: 'darwin',
  arch: 'arm64',
  cpuCores: 8,
  memoryGB: 16,
  dockerRunning: true,
  dockerVersion: '24.0.7',
  kubernetesRunning: true,
  k8sConnected: true,
  k8sVersion: 'v1.28.3',
};

const mockSystemMetrics: SystemMetrics = {
  cpu: Math.random() * 100,
  memory: Math.random() * 100,
  disk: Math.random() * 100,
  network: {
    rx: Math.random() * 1000,
    tx: Math.random() * 1000,
  },
};

class MockBackendService {
  private ws: WebSocket | null = null;
  private intervalId: number | null = null;
  private metricsCallbacks: Array<(data: any) => void> = [];
  private k8sEventCallbacks: Array<(data: any) => void> = [];
  private dockerLogCallbacks: Array<(data: any) => void> = [];
  private ansibleExecCallbacks: Array<(data: any) => void> = [];

  connectWebSocket(): void {
    console.log('[MOCK] WebSocket connecté');
    
    // Simuler l'envoi de métriques toutes les 5 secondes
    this.intervalId = window.setInterval(() => {
      const mockMetrics = {
        containers: {
          'abc123': {
            cpuUsage: Math.random() * 100,
            memoryUsage: Math.random() * 1024 * 1024 * 512,
            memoryLimit: 1024 * 1024 * 1024,
          },
          'def456': {
            cpuUsage: Math.random() * 100,
            memoryUsage: Math.random() * 1024 * 1024 * 256,
            memoryLimit: 512 * 1024 * 1024,
          },
        },
      };
      
      this.metricsCallbacks.forEach(cb => cb(mockMetrics));
    }, 5000);
  }

  disconnectWebSocket(): void {
    console.log('[MOCK] WebSocket déconnecté');
    if (this.intervalId) {
      clearInterval(this.intervalId);
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

  async checkHealth(): Promise<boolean> {
    return true;
  }

  async getSystemInfo(): Promise<SystemInfo> {
    await this.delay(300);
    return mockSystemInfo;
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    await this.delay(200);
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      network: {
        rx: Math.random() * 1000,
        tx: Math.random() * 1000,
      },
    };
  }

  async getAlerts(): Promise<any[]> {
    await this.delay(200);
    return [
      {
        id: '1',
        severity: 'warning',
        message: 'CPU usage high on web-server',
        timestamp: new Date().toISOString(),
      },
    ];
  }

  async getContainers(): Promise<Container[]> {
    await this.delay(300);
    return mockContainers;
  }

  async getImages(): Promise<any[]> {
    await this.delay(300);
    return [
      { id: 'img1', name: 'nginx:latest', size: '142MB' },
      { id: 'img2', name: 'node:18-alpine', size: '178MB' },
      { id: 'img3', name: 'redis:7-alpine', size: '32MB' },
    ];
  }

  async startContainer(id: string): Promise<void> {
    await this.delay(500);
    console.log(`[MOCK] Starting container ${id}`);
  }

  async stopContainer(id: string): Promise<void> {
    await this.delay(500);
    console.log(`[MOCK] Stopping container ${id}`);
  }

  async restartContainer(id: string): Promise<void> {
    await this.delay(800);
    console.log(`[MOCK] Restarting container ${id}`);
  }

  async removeContainer(id: string): Promise<void> {
    await this.delay(500);
    console.log(`[MOCK] Removing container ${id}`);
  }

  async getContainerLogs(id: string, lines: number): Promise<LogsResult> {
    await this.delay(400);
    return {
      logs: [
        `[${new Date().toISOString()}] Container started`,
        `[${new Date().toISOString()}] Listening on port 80`,
        `[${new Date().toISOString()}] GET / 200 OK`,
        `[${new Date().toISOString()}] GET /api/health 200 OK`,
      ],
    };
  }

  async execDockerCommand(containerId: string, command: string[]): Promise<CommandResult> {
    await this.delay(600);
    return {
      output: `Mock output for command: ${command.join(' ')}\nContainer: ${containerId}`,
      success: true,
    };
  }

  async getPods(namespace: string = 'default'): Promise<Pod[]> {
    await this.delay(300);
    return mockPods;
  }

  async getServices(namespace: string = 'default'): Promise<Service[]> {
    await this.delay(300);
    return mockServices;
  }

  async deletePod(name: string, namespace: string): Promise<void> {
    await this.delay(500);
    console.log(`[MOCK] Deleting pod ${name} in namespace ${namespace}`);
  }

  async scaleDeployment(name: string, namespace: string, replicas: number): Promise<void> {
    await this.delay(700);
    console.log(`[MOCK] Scaling deployment ${name} to ${replicas} replicas`);
  }

  async rollingRestartDeployment(name: string, namespace: string): Promise<void> {
    await this.delay(800);
    console.log(`[MOCK] Rolling restart for deployment ${name}`);
  }

  async getPodLogs(namespace: string, pod: string, container: string, lines: number): Promise<LogsResult> {
    await this.delay(400);
    return {
      logs: [
        `[${new Date().toISOString()}] Pod started`,
        `[${new Date().toISOString()}] Application running`,
        `[${new Date().toISOString()}] Health check passed`,
      ],
    };
  }

  async execK8sCommand(namespace: string, pod: string, container: string, command: string[]): Promise<CommandResult> {
    await this.delay(600);
    return {
      output: `Mock output for K8s command: ${command.join(' ')}\nPod: ${pod}`,
      success: true,
    };
  }

  async execHostCommand(binary: string, args: string[]): Promise<CommandResult> {
    await this.delay(600);
    return {
      output: `Mock output for host command: ${binary} ${args.join(' ')}`,
      success: true,
    };
  }

  async execAnsibleAdhoc(module: string, args: string, hosts: string): Promise<CommandResult> {
    await this.delay(800);
    return {
      output: `Mock Ansible execution:\nModule: ${module}\nHosts: ${hosts}\nArgs: ${args}`,
      success: true,
    };
  }

  async getWorkflows(): Promise<{ workflows: any[] }> {
    await this.delay(400);
    return {
      workflows: [
        { id: '1', name: 'Build & Deploy', status: 'success', lastRun: new Date().toISOString() },
        { id: '2', name: 'Run Tests', status: 'running', lastRun: new Date().toISOString() },
      ],
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockBackend = new MockBackendService();
