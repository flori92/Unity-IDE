/**
 * Local Backend Service
 * Communicates with the local backend server that runs on the user's machine
 * Similar to how Docker Desktop works
 */

const API_BASE_URL = 'http://127.0.0.1:9090/api';
const WS_URL = 'ws://127.0.0.1:9090/ws';

export interface SystemInfo {
  os: string;
  arch: string;
  cpuCores: number;
  memoryGB: number;
  dockerVersion?: string;
  dockerRunning: boolean;
  k8sVersion?: string;
  k8sConnected: boolean;
}

export interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  ports: string[];
  created: Date;
  stats?: ContainerStats;
}

export interface ContainerStats {
  cpuUsage: number;
  memoryUsage: number;
  memoryLimit: number;
  networkRx: number;
  networkTx: number;
  blockRead: number;
  blockWrite: number;
}

export interface Pod {
  name: string;
  namespace: string;
  status: string;
  ready: string;
  restarts: number;
  age: string;
  node: string;
}

// Proxy (Nginx) types
export interface ProxyStatus {
  dockerAvailable: boolean;
  containerExists: boolean;
  containerRunning: boolean;
  containerName: string;
  image: string;
  lastReload?: string;
  hostsCount: number;
}

export interface ProxyHost {
  id: string;
  serverName: string;
  targetUrl: string;
  sslMode: 'none' | 'letsencrypt' | 'custom';
  enabled: boolean;
}

export interface MetricsData {
  timestamp: Date;
  cpu: number;
  memory: number;
  disk: number;
  network: {
    rx: number;
    tx: number;
  };
}

class LocalBackendService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private metricsCallbacks: Set<(data: MetricsData) => void> = new Set();
  private isConnected: boolean = false;

  /**
   * Check if backend is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      this.isConnected = data.status === 'healthy';
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Get system information
   */
  async getSystemInfo(): Promise<SystemInfo> {
    const response = await fetch(`${API_BASE_URL}/system`);
    if (!response.ok) {
      throw new Error('Failed to get system info');
    }
    return response.json();
  }

  // Docker Methods

  /**
   * Get all Docker containers
   */
  async getContainers(): Promise<Container[]> {
    const response = await fetch(`${API_BASE_URL}/docker/containers`);
    if (!response.ok) {
      if (response.status === 503) {
        throw new Error('Docker is not running');
      }
      throw new Error('Failed to get containers');
    }
    return response.json();
  }

  /**
   * Start a container
   */
  async startContainer(containerId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/docker/containers/${containerId}/start`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to start container');
    }
  }

  /**
   * Stop a container
   */
  async stopContainer(containerId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/docker/containers/${containerId}/stop`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to stop container');
    }
  }

  /**
   * Get container stats
   */
  async getContainerStats(containerId: string): Promise<ContainerStats> {
    const response = await fetch(`${API_BASE_URL}/docker/containers/${containerId}/stats`);
    if (!response.ok) {
      throw new Error('Failed to get container stats');
    }
    return response.json();
  }

  /**
   * Get Docker images
   */
  async getImages(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/docker/images`);
    if (!response.ok) {
      throw new Error('Failed to get images');
    }
    return response.json();
  }

  // Kubernetes Methods

  /**
   * Get all pods
   */
  async getPods(): Promise<Pod[]> {
    const response = await fetch(`${API_BASE_URL}/k8s/pods`);
    if (!response.ok) {
      if (response.status === 503) {
        throw new Error('Kubernetes is not connected');
      }
      throw new Error('Failed to get pods');
    }
    const data = await response.json();
    return this.parseK8sResponse(data.items || []);
  }

  /**
   * Get all services
   */
  async getServices(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/k8s/services`);
    if (!response.ok) {
      throw new Error('Failed to get services');
    }
    const data = await response.json();
    return data.items || [];
  }

  /**
   * Get all deployments
   */
  async getDeployments(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/k8s/deployments`);
    if (!response.ok) {
      throw new Error('Failed to get deployments');
    }
    const data = await response.json();
    return data.items || [];
  }

  /**
   * Get nodes
   */
  async getNodes(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/k8s/nodes`);
    if (!response.ok) {
      throw new Error('Failed to get nodes');
    }
    const data = await response.json();
    return data.items || [];
  }

  // Metrics Methods

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<MetricsData> {
    const response = await fetch(`${API_BASE_URL}/metrics/system`);
    if (!response.ok) {
      throw new Error('Failed to get system metrics');
    }
    return response.json();
  }

  /**
   * Get container metrics
   */
  async getContainerMetrics(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/metrics/containers`);
    if (!response.ok) {
      throw new Error('Failed to get container metrics');
    }
    return response.json();
  }

  // WebSocket Methods

  /**
   * Connect to WebSocket for real-time updates
   */
  connectWebSocket(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('Connected to local backend WebSocket');
        this.clearReconnectTimeout();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    this.clearReconnectTimeout();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Subscribe to metrics updates
   */
  subscribeToMetrics(callback: (data: MetricsData) => void): () => void {
    this.metricsCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.metricsCallbacks.delete(callback);
    };
  }

  // Private Methods

  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'metrics':
        this.metricsCallbacks.forEach(callback => {
          callback(message.data);
        });
        break;
      case 'docker-event':
        // Handle Docker events
        console.log('Docker event:', message.data);
        break;
      case 'k8s-event':
        // Handle Kubernetes events
        console.log('Kubernetes event:', message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimeout();
    this.reconnectTimeout = setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      this.connectWebSocket();
    }, 5000);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private parseK8sResponse(items: any[]): Pod[] {
    return items.map(item => ({
      name: item.metadata?.name || 'unknown',
      namespace: item.metadata?.namespace || 'default',
      status: item.status?.phase || 'Unknown',
      ready: `${item.status?.containerStatuses?.filter((c: any) => c.ready).length || 0}/${item.status?.containerStatuses?.length || 0}`,
      restarts: item.status?.containerStatuses?.reduce((sum: number, c: any) => sum + (c.restartCount || 0), 0) || 0,
      age: this.calculateAge(item.metadata?.creationTimestamp),
      node: item.spec?.nodeName || 'unknown',
    }));
  }

  // Proxy (Nginx) Methods

  /**
   * Get proxy status
   */
  async getProxyStatus(): Promise<ProxyStatus> {
    const res = await fetch(`${API_BASE_URL}/proxy/status`);
    if (!res.ok) throw new Error('Failed to get proxy status');
    return res.json();
  }

  /**
   * List proxy hosts
   */
  async getProxyHosts(): Promise<ProxyHost[]> {
    const res = await fetch(`${API_BASE_URL}/proxy/hosts`);
    if (!res.ok) throw new Error('Failed to get proxy hosts');
    return res.json();
  }

  /** Create a proxy host */
  async createProxyHost(host: Omit<ProxyHost, 'id'> & { id?: string }): Promise<ProxyHost> {
    const res = await fetch(`${API_BASE_URL}/proxy/hosts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(host),
    });
    if (!res.ok) throw new Error('Failed to create proxy host');
    return res.json();
  }

  /** Update a proxy host */
  async updateProxyHost(id: string, host: Partial<ProxyHost>): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/proxy/hosts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(host),
    });
    if (!res.ok) throw new Error('Failed to update proxy host');
  }

  /** Delete a proxy host */
  async deleteProxyHost(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/proxy/hosts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete proxy host');
  }

  /** Apply configs (generate and reload) */
  async applyProxyConfig(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/proxy/apply`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to apply proxy config');
  }

  /** Hot reload nginx */
  async reloadProxy(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/proxy/reload`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reload proxy');
  }

  /** Get proxy logs */
  async getProxyLogs(): Promise<string> {
    const res = await fetch(`${API_BASE_URL}/proxy/logs`);
    if (!res.ok) throw new Error('Failed to get proxy logs');
    return res.text();
  }

  private calculateAge(timestamp: string): string {
    if (!timestamp) return 'unknown';
    
    const created = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  }
}

// Export singleton instance
export const localBackend = new LocalBackendService();

// Auto-connect on import
if (typeof window !== 'undefined') {
  // Check backend health on startup
  localBackend.checkHealth().then(healthy => {
    if (healthy) {
      console.log('✅ Local backend is running');
      localBackend.connectWebSocket();
    } else {
      console.warn('⚠️ Local backend is not running. Please ensure the DevOps Unity IDE backend is started.');
    }
  });
}
