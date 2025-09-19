import { invoke } from '@tauri-apps/api/tauri';
import { listen, Event, UnlistenFn } from '@tauri-apps/api/event';
import { open, save } from '@tauri-apps/api/dialog';
import { readTextFile, writeTextFile, readDir, createDir } from '@tauri-apps/api/fs';
import { appDataDir, configDir, cacheDir } from '@tauri-apps/api/path';

export interface DockerContainer {
  id: string;
  names: string[];
  image: string;
  state: string;
  status: string;
  ports: any[];
  created: number;
}

export interface K8sPod {
  name: string;
  namespace: string;
  status: string;
  node: string | null;
  containers: any[];
  age: string;
  labels: Record<string, string>;
}

export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage_percent: number;
    cores: number;
    load_average: number[];
  };
  memory: {
    total_mb: number;
    used_mb: number;
    free_mb: number;
    usage_percent: number;
  };
  disk: {
    total_gb: number;
    used_gb: number;
    free_gb: number;
    usage_percent: number;
  };
  network: {
    rx_mb_s: number;
    tx_mb_s: number;
    connections: number;
  };
}

class TauriServiceClass {
  private listeners: Map<string, UnlistenFn> = new Map();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('TauriService initialized');
  }

  // Docker Commands
  async getDockerContainers(): Promise<DockerContainer[]> {
    try {
      const result = await invoke<string>('get_docker_containers');
      return JSON.parse(result);
    } catch (error) {
      console.error('Failed to get Docker containers:', error);
      throw error;
    }
  }

  async dockerComposeUp(composePath: string): Promise<string> {
    try {
      return await invoke<string>('docker_compose_up', { composePath });
    } catch (error) {
      console.error('Failed to run docker-compose up:', error);
      throw error;
    }
  }

  // Kubernetes Commands
  async getK8sPods(namespace?: string): Promise<K8sPod[]> {
    try {
      const result = await invoke<string>('get_k8s_pods', { namespace });
      return JSON.parse(result);
    } catch (error) {
      console.error('Failed to get K8s pods:', error);
      throw error;
    }
  }

  async connectToCluster(configPath: string): Promise<string> {
    try {
      return await invoke<string>('connect_to_cluster', { configPath });
    } catch (error) {
      console.error('Failed to connect to cluster:', error);
      throw error;
    }
  }

  // Ansible Commands
  async runAnsiblePlaybook(playbookPath: string, inventory: string): Promise<string> {
    try {
      return await invoke<string>('run_ansible_playbook', { 
        playbookPath, 
        inventory 
      });
    } catch (error) {
      console.error('Failed to run Ansible playbook:', error);
      throw error;
    }
  }

  // Monitoring Commands
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const result = await invoke<string>('get_system_metrics');
      return JSON.parse(result);
    } catch (error) {
      console.error('Failed to get system metrics:', error);
      throw error;
    }
  }

  // Extension Commands
  async installExtension(extensionId: string): Promise<string> {
    try {
      return await invoke<string>('install_extension', { extensionId });
    } catch (error) {
      console.error('Failed to install extension:', error);
      throw error;
    }
  }

  // Workflow Commands
  async createWorkflow(name: string, workflowDef: string): Promise<string> {
    try {
      return await invoke<string>('create_workflow', { name, workflowDef });
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  }

  async executeWorkflow(workflowId: string): Promise<string> {
    try {
      return await invoke<string>('execute_workflow', { workflowId });
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      throw error;
    }
  }

  // Event Listeners
  async listen(event: string, handler: (event: Event<any>) => void): Promise<void> {
    if (this.listeners.has(event)) {
      const unlisten = this.listeners.get(event);
      if (unlisten) unlisten();
    }

    const unlisten = await listen(event, handler);
    this.listeners.set(event, unlisten);
  }

  async unlisten(event: string): Promise<void> {
    const unlisten = this.listeners.get(event);
    if (unlisten) {
      unlisten();
      this.listeners.delete(event);
    }
  }

  async unlistenAll(): Promise<void> {
    for (const [_, unlisten] of this.listeners) {
      unlisten();
    }
    this.listeners.clear();
  }

  // File System Operations
  async openFile(filters?: { name: string; extensions: string[] }[]): Promise<string | null> {
    const selected = await open({
      multiple: false,
      filters,
    });
    return selected as string | null;
  }

  async saveFile(
    content: string,
    defaultPath?: string,
    filters?: { name: string; extensions: string[] }[]
  ): Promise<string | null> {
    const filePath = await save({
      defaultPath,
      filters,
    });
    
    if (filePath) {
      await writeTextFile(filePath, content);
      return filePath;
    }
    return null;
  }

  async readFile(path: string): Promise<string> {
    return await readTextFile(path);
  }

  async writeFile(path: string, content: string): Promise<void> {
    await writeTextFile(path, content);
  }

  async listDirectory(path: string): Promise<any[]> {
    return await readDir(path);
  }

  async createDirectory(path: string): Promise<void> {
    await createDir(path, { recursive: true });
  }

  // Path Utilities
  async getAppDataDir(): Promise<string> {
    return await appDataDir();
  }

  async getConfigDir(): Promise<string> {
    return await configDir();
  }

  async getCacheDir(): Promise<string> {
    return await cacheDir();
  }
}

export const TauriService = new TauriServiceClass();
export default TauriService;
