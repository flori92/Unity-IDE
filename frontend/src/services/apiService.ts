import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class APIService {
  private static instance: APIService;
  private constructor() {}

  public static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  // Docker Services
  async getContainers() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/docker/containers`);
      return response.data as APIResponse<any[]>;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Kubernetes Services
  async getPods(namespace: string = 'default') {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/kubernetes/pods/${namespace}`);
      return response.data as APIResponse<any[]>;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Ansible Services
  async runPlaybook(playbookPath: string, inventory: string) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ansible/playbook`, {
        playbookPath,
        inventory
      });
      return response.data as APIResponse<any>;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): APIResponse<any> {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Une erreur est survenue'
    };
  }
}

export default APIService.getInstance();