/**
 * API Service - Connexion au backend
 * Gère toutes les requêtes HTTP vers le backend Go
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour gérer les erreurs
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // ==================== DOCKER ====================

  /**
   * Liste tous les containers Docker
   */
  async listContainers() {
    const response = await this.api.get('/docker/containers');
    return response.data;
  }

  /**
   * Démarre un container
   */
  async startContainer(containerId: string) {
    const response = await this.api.post(`/docker/containers/${containerId}/start`);
    return response.data;
  }

  /**
   * Arrête un container
   */
  async stopContainer(containerId: string) {
    const response = await this.api.post(`/docker/containers/${containerId}/stop`);
    return response.data;
  }

  /**
   * Redémarre un container
   */
  async restartContainer(containerId: string) {
    const response = await this.api.post(`/docker/containers/${containerId}/restart`);
    return response.data;
  }

  /**
   * Supprime un container
   */
  async removeContainer(containerId: string) {
    const response = await this.api.delete(`/docker/containers/${containerId}`);
    return response.data;
  }

  /**
   * Récupère les logs d'un container
   */
  async getContainerLogs(containerId: string, tail: number = 100) {
    const response = await this.api.get(`/docker/containers/${containerId}/logs`, {
      params: { tail },
    });
    return response.data;
  }

  /**
   * Liste toutes les images Docker
   */
  async listImages() {
    const response = await this.api.get('/docker/images');
    return response.data;
  }

  /**
   * Pull une image Docker
   */
  async pullImage(imageName: string) {
    const response = await this.api.post('/docker/images/pull', { image: imageName });
    return response.data;
  }

  /**
   * Liste les volumes Docker
   */
  async listVolumes() {
    const response = await this.api.get('/docker/volumes');
    return response.data;
  }

  /**
   * Liste les networks Docker
   */
  async listNetworks() {
    const response = await this.api.get('/docker/networks');
    return response.data;
  }

  // ==================== KUBERNETES ====================

  /**
   * Liste tous les pods
   */
  async listPods(namespace: string = 'default') {
    const response = await this.api.get('/kubernetes/pods', {
      params: { namespace },
    });
    return response.data;
  }

  /**
   * Récupère les détails d'un pod
   */
  async getPod(name: string, namespace: string = 'default') {
    const response = await this.api.get(`/kubernetes/pods/${name}`, {
      params: { namespace },
    });
    return response.data;
  }

  /**
   * Supprime un pod
   */
  async deletePod(name: string, namespace: string = 'default') {
    const response = await this.api.delete(`/kubernetes/pods/${name}`, {
      params: { namespace },
    });
    return response.data;
  }

  /**
   * Récupère les logs d'un pod
   */
  async getPodLogs(name: string, namespace: string = 'default', tail: number = 100) {
    const response = await this.api.get(`/kubernetes/pods/${name}/logs`, {
      params: { namespace, tail },
    });
    return response.data;
  }

  /**
   * Liste tous les deployments
   */
  async listDeployments(namespace: string = 'default') {
    const response = await this.api.get('/kubernetes/deployments', {
      params: { namespace },
    });
    return response.data;
  }

  /**
   * Scale un deployment
   */
  async scaleDeployment(name: string, replicas: number, namespace: string = 'default') {
    const response = await this.api.post(`/kubernetes/deployments/${name}/scale`, {
      replicas,
      namespace,
    });
    return response.data;
  }

  /**
   * Liste tous les services
   */
  async listServices(namespace: string = 'default') {
    const response = await this.api.get('/kubernetes/services', {
      params: { namespace },
    });
    return response.data;
  }

  /**
   * Liste tous les namespaces
   */
  async listNamespaces() {
    const response = await this.api.get('/kubernetes/namespaces');
    return response.data;
  }

  /**
   * Liste tous les nodes
   */
  async listNodes() {
    const response = await this.api.get('/kubernetes/nodes');
    return response.data;
  }

  // ==================== ANSIBLE ====================

  /**
   * Liste tous les playbooks
   */
  async listPlaybooks() {
    const response = await this.api.get('/ansible/playbooks');
    return response.data;
  }

  /**
   * Exécute un playbook
   */
  async runPlaybook(playbookPath: string, inventory: string, extraVars?: Record<string, any>) {
    const response = await this.api.post('/ansible/playbooks/run', {
      playbook: playbookPath,
      inventory,
      extra_vars: extraVars,
    });
    return response.data;
  }

  /**
   * Récupère le statut d'une exécution de playbook
   */
  async getPlaybookStatus(executionId: string) {
    const response = await this.api.get(`/ansible/playbooks/status/${executionId}`);
    return response.data;
  }

  /**
   * Liste les inventaires
   */
  async listInventories() {
    const response = await this.api.get('/ansible/inventories');
    return response.data;
  }

  /**
   * Liste les rôles
   */
  async listRoles() {
    const response = await this.api.get('/ansible/roles');
    return response.data;
  }

  // ==================== MONITORING ====================

  /**
   * Récupère les métriques système
   */
  async getSystemMetrics() {
    const response = await this.api.get('/monitoring/metrics');
    return response.data;
  }

  /**
   * Récupère les alertes actives
   */
  async getActiveAlerts() {
    const response = await this.api.get('/monitoring/alerts');
    return response.data;
  }

  /**
   * Récupère l'historique des métriques
   */
  async getMetricsHistory(duration: number = 3600) {
    const response = await this.api.get('/monitoring/metrics/history', {
      params: { duration },
    });
    return response.data;
  }

  // ==================== SYSTEM ====================

  /**
   * Health check
   */
  async healthCheck() {
    const response = await this.api.get('/health');
    return response.data;
  }

  /**
   * Récupère la version du backend
   */
  async getVersion() {
    const response = await this.api.get('/version');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
