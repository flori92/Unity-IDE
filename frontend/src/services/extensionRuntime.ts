/**
 * Extension Runtime System
 * Manages loading, executing, and sandboxing extensions
 */

import { Extension, ExtensionManifest, ExtensionAPI } from '../types/extension';
import { TauriService } from './tauriService';
import { WebSocketService } from './websocketService';

export class ExtensionRuntime {
  private loadedExtensions: Map<string, ExtensionInstance> = new Map();
  private extensionAPI: ExtensionAPI;
  private sandboxWorker: Worker | null = null;

  constructor() {
    this.extensionAPI = this.createExtensionAPI();
  }

  /**
   * Load and activate an extension
   */
  async loadExtension(extensionPath: string, manifest: ExtensionManifest): Promise<void> {
    console.log(`Loading extension: ${manifest.id}`);

    try {
      // Create extension context
      const context = this.createExtensionContext(extensionPath, manifest);

      // Load extension in sandbox
      if (typeof Worker !== 'undefined') {
        // Web Worker for browser environment
        const instance = await this.loadInWebWorker(extensionPath, manifest, context);
        this.loadedExtensions.set(manifest.id, instance);
      } else {
        // Direct loading for Tauri environment
        const instance = await this.loadDirectly(extensionPath, manifest, context);
        this.loadedExtensions.set(manifest.id, instance);
      }

      // Call activation event
      await this.activateExtension(manifest.id);
      
      console.log(`Extension ${manifest.id} loaded successfully`);
    } catch (error) {
      console.error(`Failed to load extension ${manifest.id}:`, error);
      throw error;
    }
  }

  /**
   * Unload an extension
   */
  async unloadExtension(extensionId: string): Promise<void> {
    const instance = this.loadedExtensions.get(extensionId);
    if (!instance) return;

    try {
      // Call deactivation
      if (instance.exports?.deactivate) {
        await instance.exports.deactivate();
      }

      // Clean up
      instance.dispose();
      this.loadedExtensions.delete(extensionId);
      
      console.log(`Extension ${extensionId} unloaded`);
    } catch (error) {
      console.error(`Failed to unload extension ${extensionId}:`, error);
    }
  }

  /**
   * Execute an extension command
   */
  async executeCommand(command: string, ...args: any[]): Promise<any> {
    // Find which extension provides this command
    for (const [extensionId, instance] of this.loadedExtensions) {
      if (instance.commands.has(command)) {
        const handler = instance.commands.get(command);
        return await handler(...args);
      }
    }
    
    throw new Error(`Command not found: ${command}`);
  }

  /**
   * Create the Extension API exposed to extensions
   */
  private createExtensionAPI(): ExtensionAPI {
    return {
      workspace: {
        getConfiguration: (section?: string) => {
          // Return configuration from store
          return {} as any;
        },
        onDidChangeConfiguration: (listener: (e: any) => void) => {
          // Register configuration change listener
          return { dispose: () => {} };
        },
        openTextDocument: async (uri: string) => {
          // Open document via Tauri
          return {} as any;
        },
        applyEdit: async (edit: any) => {
          // Apply workspace edit
          return true;
        },
      },
      window: {
        showMessage: (message: string, type?: 'info' | 'warning' | 'error') => {
          // Show message via notification system
          console.log(`[${type || 'info'}] ${message}`);
        },
        showInputBox: async (options?: any) => {
          // Show input dialog
          return prompt(options?.prompt || 'Input:') || undefined;
        },
        showQuickPick: async (items: string[], options?: any) => {
          // Show selection dialog
          return items[0];
        },
        createOutputChannel: (name: string) => {
          // Create output channel
          return {
            append: (value: string) => console.log(value),
            appendLine: (value: string) => console.log(value),
            clear: () => {},
            show: () => {},
            hide: () => {},
            dispose: () => {},
          };
        },
        createStatusBarItem: (alignment?: any, priority?: number) => {
          // Create status bar item
          return {
            text: '',
            tooltip: undefined,
            command: undefined,
            show: () => {},
            hide: () => {},
            dispose: () => {},
          };
        },
      },
      commands: {
        registerCommand: (command: string, callback: (...args: any[]) => any) => {
          // Register command handler
          return { dispose: () => {} };
        },
        executeCommand: async (command: string, ...args: any[]) => {
          return await this.executeCommand(command, ...args);
        },
        getCommands: async () => {
          // Return all registered commands
          const commands: string[] = [];
          for (const instance of this.loadedExtensions.values()) {
            commands.push(...instance.commands.keys());
          }
          return commands;
        },
      },
      docker: {
        listContainers: async () => {
          return await TauriService.getDockerContainers();
        },
        startContainer: async (id: string) => {
          // Start container via Tauri
          console.log(`Starting container ${id}`);
        },
        stopContainer: async (id: string) => {
          // Stop container via Tauri
          console.log(`Stopping container ${id}`);
        },
        executeCommand: async (containerId: string, command: string[]) => {
          // Execute command in container
          return 'command output';
        },
      },
      kubernetes: {
        listPods: async (namespace?: string) => {
          return await TauriService.getK8sPods(namespace);
        },
        applyManifest: async (yaml: string) => {
          // Apply K8s manifest
          console.log('Applying manifest');
        },
        deleteResource: async (kind: string, name: string, namespace?: string) => {
          // Delete K8s resource
          console.log(`Deleting ${kind} ${name}`);
        },
      },
      ansible: {
        runPlaybook: async (playbook: string, inventory: string) => {
          return await TauriService.runAnsiblePlaybook(playbook, inventory);
        },
        validatePlaybook: async (playbook: string) => {
          // Validate playbook syntax
          return { valid: true, errors: [] };
        },
        encryptVault: async (content: string, password: string) => {
          // Encrypt with Ansible Vault
          return 'encrypted_content';
        },
      },
      storage: {
        get: (key: string) => {
          return localStorage.getItem(key);
        },
        set: (key: string, value: any) => {
          localStorage.setItem(key, JSON.stringify(value));
        },
        delete: (key: string) => {
          localStorage.removeItem(key);
        },
        clear: () => {
          localStorage.clear();
        },
      },
    };
  }

  /**
   * Create extension context
   */
  private createExtensionContext(extensionPath: string, manifest: ExtensionManifest): ExtensionContext {
    return {
      extensionPath,
      extensionId: manifest.id,
      globalState: new ExtensionMemento(`global:${manifest.id}`),
      workspaceState: new ExtensionMemento(`workspace:${manifest.id}`),
      subscriptions: [],
      api: this.extensionAPI,
    };
  }

  /**
   * Load extension in Web Worker (sandboxed)
   */
  private async loadInWebWorker(
    extensionPath: string,
    manifest: ExtensionManifest,
    context: ExtensionContext
  ): Promise<ExtensionInstance> {
    return new Promise((resolve, reject) => {
      const worker = new Worker('/extension-worker.js');
      
      worker.postMessage({
        type: 'load',
        extensionPath,
        manifest,
        context,
      });

      worker.onmessage = (event) => {
        if (event.data.type === 'loaded') {
          resolve(new ExtensionInstance(manifest, worker, event.data.exports));
        } else if (event.data.type === 'error') {
          reject(new Error(event.data.error));
        }
      };

      worker.onerror = reject;
    });
  }

  /**
   * Load extension directly (for Tauri environment)
   */
  private async loadDirectly(
    extensionPath: string,
    manifest: ExtensionManifest,
    context: ExtensionContext
  ): Promise<ExtensionInstance> {
    // In Tauri, we can use dynamic imports
    const module = await import(/* @vite-ignore */ extensionPath);
    
    const instance = new ExtensionInstance(manifest, null, module);
    
    // Call activate
    if (module.activate) {
      await module.activate(context);
    }
    
    return instance;
  }

  /**
   * Activate an extension
   */
  private async activateExtension(extensionId: string): Promise<void> {
    const instance = this.loadedExtensions.get(extensionId);
    if (!instance) return;

    // Register commands
    const manifest = instance.manifest;
    if (manifest.contributes?.commands) {
      for (const command of manifest.contributes.commands) {
        // Register command handler
        console.log(`Registering command: ${command.command}`);
      }
    }

    // Register views
    if (manifest.contributes?.views) {
      // Register view providers
      console.log('Registering views');
    }
  }
}

/**
 * Extension instance wrapper
 */
class ExtensionInstance {
  public commands: Map<string, Function> = new Map();
  public disposables: Array<() => void> = [];

  constructor(
    public manifest: ExtensionManifest,
    private worker: Worker | null,
    public exports: any
  ) {}

  dispose() {
    // Clean up disposables
    for (const dispose of this.disposables) {
      dispose();
    }
    this.disposables = [];
    
    // Terminate worker if exists
    if (this.worker) {
      this.worker.terminate();
    }
  }
}

/**
 * Extension context interface
 */
interface ExtensionContext {
  extensionPath: string;
  extensionId: string;
  globalState: ExtensionMemento;
  workspaceState: ExtensionMemento;
  subscriptions: Array<{ dispose: () => void }>;
  api: ExtensionAPI;
}

/**
 * Extension memento for state persistence
 */
class ExtensionMemento {
  constructor(private prefix: string) {}

  get<T>(key: string, defaultValue?: T): T | undefined {
    const value = localStorage.getItem(`${this.prefix}:${key}`);
    if (value) {
      try {
        return JSON.parse(value);
      } catch {
        return value as any;
      }
    }
    return defaultValue;
  }

  async update(key: string, value: any): Promise<void> {
    localStorage.setItem(`${this.prefix}:${key}`, JSON.stringify(value));
  }

  keys(): readonly string[] {
    const keys: string[] = [];
    const prefix = `${this.prefix}:`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        keys.push(key.slice(prefix.length));
      }
    }
    return keys;
  }
}

// Export singleton instance
export const extensionRuntime = new ExtensionRuntime();
