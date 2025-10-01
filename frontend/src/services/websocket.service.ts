/**
 * WebSocket Service - Streaming temps réel
 * Gère les connexions WebSocket pour les logs et événements
 */

type MessageHandler = (data: any) => void;
type ErrorHandler = (error: Event) => void;
type CloseHandler = () => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private errorHandlers: ErrorHandler[] = [];
  private closeHandlers: CloseHandler[] = [];

  constructor(private url: string = 'ws://localhost:9090/ws') {}

  /**
   * Connecte au WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.errorHandlers.forEach((handler) => handler(error));
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed');
          this.closeHandlers.forEach((handler) => handler());
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Déconnecte du WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Envoie un message
   */
  send(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket not connected');
    }
  }

  /**
   * Subscribe aux logs d'un container Docker
   */
  subscribeDockerLogs(containerId: string, handler: MessageHandler) {
    this.on('docker:logs', handler);
    this.send('subscribe', { type: 'docker:logs', containerId });
  }

  /**
   * Unsubscribe des logs d'un container Docker
   */
  unsubscribeDockerLogs(containerId: string, handler: MessageHandler) {
    this.off('docker:logs', handler);
    this.send('unsubscribe', { type: 'docker:logs', containerId });
  }

  /**
   * Subscribe aux logs d'un pod Kubernetes
   */
  subscribeK8sLogs(podName: string, namespace: string, handler: MessageHandler) {
    this.on('k8s:logs', handler);
    this.send('subscribe', { type: 'k8s:logs', podName, namespace });
  }

  /**
   * Unsubscribe des logs d'un pod Kubernetes
   */
  unsubscribeK8sLogs(podName: string, namespace: string, handler: MessageHandler) {
    this.off('k8s:logs', handler);
    this.send('unsubscribe', { type: 'k8s:logs', podName, namespace });
  }

  /**
   * Subscribe aux événements Kubernetes
   */
  subscribeK8sEvents(namespace: string, handler: MessageHandler) {
    this.on('k8s:events', handler);
    this.send('subscribe', { type: 'k8s:events', namespace });
  }

  /**
   * Unsubscribe des événements Kubernetes
   */
  unsubscribeK8sEvents(namespace: string, handler: MessageHandler) {
    this.off('k8s:events', handler);
    this.send('unsubscribe', { type: 'k8s:events', namespace });
  }

  /**
   * Subscribe aux métriques système
   */
  subscribeMetrics(handler: MessageHandler) {
    this.on('metrics', handler);
    this.send('subscribe', { type: 'metrics' });
  }

  /**
   * Unsubscribe des métriques système
   */
  unsubscribeMetrics(handler: MessageHandler) {
    this.off('metrics', handler);
    this.send('unsubscribe', { type: 'metrics' });
  }

  /**
   * Subscribe à un type de message
   */
  on(type: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  /**
   * Unsubscribe d'un type de message
   */
  off(type: string, handler: MessageHandler) {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Subscribe aux erreurs
   */
  onError(handler: ErrorHandler) {
    this.errorHandlers.push(handler);
  }

  /**
   * Subscribe à la fermeture
   */
  onClose(handler: CloseHandler) {
    this.closeHandlers.push(handler);
  }

  /**
   * Gère les messages entrants
   */
  private handleMessage(message: { type: string; data: any }) {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message.data));
    }
  }

  /**
   * Tente de se reconnecter
   */
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
      
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Vérifie si le WebSocket est connecté
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Instance singleton
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:9090/ws';
export const wsService = new WebSocketService(WS_URL);
export default wsService;
