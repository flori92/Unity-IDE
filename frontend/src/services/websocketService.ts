// Mock WebSocket Service for development
type EventHandler = (data: any) => void;

class WebSocketServiceClass {
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private isConnected = false;
  private url: string = '';

  connect(url: string): void {
    this.url = url;
    
    // Mock connection in development
    if (import.meta.env?.DEV || true) {
      console.log('WebSocket mock connection established');
      this.isConnected = true;
      this.emit('connected', { timestamp: Date.now() });
      return;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', { timestamp: Date.now() });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', { reason, timestamp: Date.now() });
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', { error, timestamp: Date.now() });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      this.emit('reconnected', { attempts: attemptNumber, timestamp: Date.now() });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('WebSocket reconnection attempt', attemptNumber);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
      this.emit('reconnect_failed', { timestamp: Date.now() });
    });

    // Listen for any event and forward to registered handlers
    this.socket.onAny((event, ...args) => {
      this.handleEvent(event, args[0]);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(handler);
  }

  off(event: string, handler: EventHandler): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  emit(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected, queuing event:', event);
      // Could implement a queue here to send when reconnected
      return;
    }
    this.socket.emit(event, data);
  }

  private handleEvent(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Specific event methods for type safety
  sendCommand(command: string, params: any = {}): void {
    this.emit('command', { command, params, timestamp: Date.now() });
  }

  requestMetrics(): void {
    this.emit('request_metrics', { timestamp: Date.now() });
  }

  subscribeToLogs(sources: string[]): void {
    this.emit('subscribe_logs', { sources, timestamp: Date.now() });
  }

  unsubscribeFromLogs(sources: string[]): void {
    this.emit('unsubscribe_logs', { sources, timestamp: Date.now() });
  }

  // Utility methods
  isConnectedStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  // Request-Response pattern with promises
  async request(event: string, data: any, timeout = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const requestId = `${event}_${Date.now()}_${Math.random()}`;
      const timeoutId = setTimeout(() => {
        this.off(`${event}_response_${requestId}`, responseHandler);
        reject(new Error(`Request timeout for ${event}`));
      }, timeout);

      const responseHandler = (responseData: any) => {
        clearTimeout(timeoutId);
        resolve(responseData);
      };

      this.on(`${event}_response_${requestId}`, responseHandler);
      this.emit(event, { ...data, requestId });
    });
  }

  // Specific request methods
  async getDockerStats(): Promise<any> {
    return this.request('get_docker_stats', {});
  }

  async getK8sClusterInfo(): Promise<any> {
    return this.request('get_k8s_cluster_info', {});
  }

  async getAnsibleInventory(): Promise<any> {
    return this.request('get_ansible_inventory', {});
  }

  async getSystemHealth(): Promise<any> {
    return this.request('get_system_health', {});
  }
}

export const WebSocketService = new WebSocketServiceClass();
export default WebSocketService;
