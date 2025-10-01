// Mode démo ultra-performant - Style K9s
import type { Container, Pod, Service, SystemInfo, SystemMetrics, CommandResult, LogsResult } from './localBackendService';

// Données mock réalistes inspirées de K9s
const generateMockContainers = (): Container[] => [
  {
    id: 'web-nginx-7f8b9c',
    name: 'web-server',
    image: 'nginx:1.25-alpine',
    status: 'Up 2 hours',
    state: 'running',
    ports: ['0.0.0.0:80->80/tcp', ':::443->443/tcp'],
    created: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    labels: { 'app': 'web', 'env': 'prod' }
  },
  {
    id: 'api-node-d4e5f6',
    name: 'api-backend',
    image: 'node:20-alpine',
    status: 'Up 2 hours',
    state: 'running',
    ports: ['0.0.0.0:3000->3000/tcp'],
    created: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    labels: { 'app': 'api', 'version': 'v2.1' }
  },
  {
    id: 'db-postgres-a1b2c3',
    name: 'postgres-db',
    image: 'postgres:15-alpine',
    status: 'Up 2 hours',
    state: 'running',
    ports: ['5432/tcp'],
    created: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    labels: { 'app': 'db', 'db': 'postgres' }
  },
  {
    id: 'cache-redis-x9y8z7',
    name: 'redis-cache',
    image: 'redis:7-alpine',
    status: 'Up 2 hours',
    state: 'running',
    ports: ['6379/tcp'],
    created: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    labels: { 'app': 'cache', 'type': 'redis' }
  }
];

const generateMockPods = (): Pod[] => [
  {
    name: 'frontend-deployment-6b7c8d9e-x9k2m',
    namespace: 'production',
    status: 'Running',
    ready: '1/1',
    restarts: 0,
    age: '2h',
    ip: '10.244.1.15',
    node: 'worker-node-1',
    labels: { 'app': 'frontend', 'version': 'v2.1' }
  },
  {
    name: 'backend-api-8d9e0f-a1b2c',
    namespace: 'production',
    status: 'Running',
    ready: '1/1',
    restarts: 1,
    age: '2h',
    ip: '10.244.1.16',
    node: 'worker-node-1',
    labels: { 'app': 'backend', 'tier': 'api' }
  },
  {
    name: 'database-postgres-0',
    namespace: 'production',
    status: 'Running',
    ready: '1/1',
    restarts: 0,
    age: '24h',
    ip: '10.244.2.10',
    node: 'worker-node-2',
    labels: { 'app': 'database', 'db': 'postgres' }
  },
  {
    name: 'monitoring-prometheus-5f6g7h',
    namespace: 'monitoring',
    status: 'Running',
    ready: '1/1',
    restarts: 0,
    age: '24h',
    ip: '10.244.3.5',
    node: 'monitoring-node',
    labels: { 'app': 'prometheus', 'component': 'server' }
  },
  {
    name: 'ingress-nginx-controller-12345',
    namespace: 'ingress-nginx',
    status: 'Running',
    ready: '1/1',
    restarts: 2,
    age: '24h',
    ip: '10.244.0.100',
    node: 'ingress-node',
    labels: { 'app.kubernetes.io/name': 'ingress-nginx' }
  }
];

const generateMockServices = (): Service[] => [
  {
    name: 'frontend-service',
    namespace: 'production',
    type: 'LoadBalancer',
    clusterIP: '10.96.1.10',
    externalIP: '34.102.156.89',
    ports: ['80:30080/TCP', '443:30443/TCP'],
    age: '24h',
    labels: { 'app': 'frontend' }
  },
  {
    name: 'backend-api-service',
    namespace: 'production',
    type: 'ClusterIP',
    clusterIP: '10.96.1.11',
    ports: ['3000:3000/TCP'],
    age: '24h',
    labels: { 'app': 'backend' }
  },
  {
    name: 'database-service',
    namespace: 'production',
    type: 'ClusterIP',
    clusterIP: '10.96.1.12',
    ports: ['5432:5432/TCP'],
    age: '24h',
    labels: { 'app': 'database' }
  },
  {
    name: 'monitoring-service',
    namespace: 'monitoring',
    type: 'ClusterIP',
    clusterIP: '10.96.2.5',
    ports: ['9090:9090/TCP'],
    age: '24h',
    labels: { 'app': 'prometheus' }
  }
];

const mockSystemInfo: SystemInfo = {
  hostname: 'k8s-cluster-master',
  platform: 'linux',
  arch: 'x86_64',
  cpuCores: 16,
  memoryGB: 64,
  dockerRunning: true,
  dockerVersion: '24.0.7',
  kubernetesRunning: true,
  k8sConnected: true,
  k8sVersion: 'v1.28.3',
  uptime: '7 days, 4 hours',
  loadAverage: [1.25, 1.15, 1.05]
};

// mockSystemMetrics retiré car non utilisé - les métriques sont générées dynamiquement

class MockBackendService {
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
    return generateMockContainers();
  }

  async getImages(): Promise<any[]> {
    await this.delay(300);
    return [
      { id: 'sha256:abc123', repoTags: ['nginx:1.25-alpine'], size: 142 * 1024 * 1024, created: Date.now() - 86400000 },
      { id: 'sha256:def456', repoTags: ['node:20-alpine'], size: 178 * 1024 * 1024, created: Date.now() - 86400000 },
      { id: 'sha256:ghi789', repoTags: ['postgres:15-alpine'], size: 245 * 1024 * 1024, created: Date.now() - 86400000 },
      { id: 'sha256:jkl012', repoTags: ['redis:7-alpine'], size: 32 * 1024 * 1024, created: Date.now() - 86400000 },
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

  async getContainerLogs(_id: string, _lines: number): Promise<LogsResult> {
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

  async getPods(_namespace: string = 'default'): Promise<Pod[]> {
    await this.delay(300);
    return generateMockPods();
  }

  async getServices(_namespace: string = 'default'): Promise<Service[]> {
    await this.delay(300);
    return generateMockServices();
  }

  async deletePod(name: string, _namespace: string): Promise<void> {
    await this.delay(500);
    console.log(`[MOCK] Deleting pod ${name} in namespace ${_namespace}`);
  }

  async scaleDeployment(name: string, _namespace: string, replicas: number): Promise<void> {
    await this.delay(700);
    console.log(`[MOCK] Scaling deployment ${name} to ${replicas} replicas`);
  }

  async rollingRestartDeployment(name: string, _namespace: string): Promise<void> {
    await this.delay(800);
    console.log(`[MOCK] Rolling restart for deployment ${name}`);
  }

  async getPodLogs(_namespace: string, _pod: string, _container: string, _lines: number): Promise<LogsResult> {
    await this.delay(400);
    return {
      logs: [
        `[${new Date().toISOString()}] Pod started`,
        `[${new Date().toISOString()}] Application running`,
        `[${new Date().toISOString()}] Health check passed`,
      ],
    };
  }

  async execK8sCommand(_namespace: string, pod: string, _container: string, command: string[]): Promise<CommandResult> {
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
