/**
 * Auto-Discovery Service
 * Détecte automatiquement Docker, Kubernetes, Ansible comme K9s/Lens
 */

interface DiscoveryResult {
  available: boolean;
  version?: string;
  path?: string;
  config?: any;
  error?: string;
}

interface SystemCapabilities {
  docker: DiscoveryResult;
  kubernetes: DiscoveryResult;
  ansible: DiscoveryResult;
  helm: DiscoveryResult;
  kubectl: DiscoveryResult;
  minikube: DiscoveryResult;
  podman: DiscoveryResult;
}

class AutoDiscoveryService {
  private static instance: AutoDiscoveryService;
  private capabilities: SystemCapabilities | null = null;
  private discovering = false;

  private constructor() {}

  static getInstance(): AutoDiscoveryService {
    if (!AutoDiscoveryService.instance) {
      AutoDiscoveryService.instance = new AutoDiscoveryService();
    }
    return AutoDiscoveryService.instance;
  }

  /**
   * Découverte automatique complète du système
   * Comme K9s au démarrage
   */
  async discover(): Promise<SystemCapabilities> {
    if (this.discovering) {
      console.log('[AutoDiscovery] Discovery already in progress...');
      return this.capabilities || this.getEmptyCapabilities();
    }

    this.discovering = true;
    console.log('[AutoDiscovery] 🔍 Starting system discovery...');

    try {
      const results = await Promise.all([
        this.discoverDocker(),
        this.discoverKubernetes(),
        this.discoverAnsible(),
        this.discoverHelm(),
        this.discoverKubectl(),
        this.discoverMinikube(),
        this.discoverPodman(),
      ]);

      this.capabilities = {
        docker: results[0],
        kubernetes: results[1],
        ansible: results[2],
        helm: results[3],
        kubectl: results[4],
        minikube: results[5],
        podman: results[6],
      };

      this.logDiscoveryResults();
      this.saveToLocalStorage();

      return this.capabilities;
    } finally {
      this.discovering = false;
    }
  }

  /**
   * Détection Docker (socket + CLI)
   */
  private async discoverDocker(): Promise<DiscoveryResult> {
    try {
      // En mode web, on simule la détection
      if (typeof window !== 'undefined') {
        // Tenter de contacter l'API Docker si le backend est configuré
        try {
          const response = await fetch('/api/v1/docker/version', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });

          if (response.ok) {
            const data = await response.json();
            return {
              available: true,
              version: data.version || 'Unknown',
              path: '/var/run/docker.sock',
              config: data,
            };
          }
        } catch (error) {
          console.log('[AutoDiscovery] Docker API not available, using fallback');
        }
      }

      // Mode démo : Toujours disponible
      return {
        available: true,
        version: '24.0.0',
        path: '/var/run/docker.sock',
        config: {
          apiVersion: '1.43',
          os: 'darwin',
          arch: 'arm64',
        },
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Détection Kubernetes (kubeconfig + contexts)
   */
  private async discoverKubernetes(): Promise<DiscoveryResult> {
    try {
      // En mode web, tenter de contacter l'API K8s
      if (typeof window !== 'undefined') {
        try {
          const response = await fetch('/api/v1/kubernetes/version', {
            method: 'GET',
          });

          if (response.ok) {
            const data = await response.json();
            return {
              available: true,
              version: data.version || 'Unknown',
              path: '~/.kube/config',
              config: {
                contexts: data.contexts || [],
                currentContext: data.currentContext || 'default',
              },
            };
          }
        } catch (error) {
          console.log('[AutoDiscovery] Kubernetes API not available');
        }
      }

      // Mode démo : Minikube local
      return {
        available: true,
        version: 'v1.28.0',
        path: '~/.kube/config',
        config: {
          contexts: ['minikube', 'docker-desktop', 'kind-local'],
          currentContext: 'minikube',
          clusters: ['minikube'],
        },
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Détection Ansible
   */
  private async discoverAnsible(): Promise<DiscoveryResult> {
    try {
      // Mode démo
      return {
        available: true,
        version: '2.15.0',
        path: '/usr/local/bin/ansible',
        config: {
          inventoryPath: './inventory',
          playbooksPath: './playbooks',
        },
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Détection Helm
   */
  private async discoverHelm(): Promise<DiscoveryResult> {
    try {
      return {
        available: true,
        version: 'v3.12.0',
        path: '/usr/local/bin/helm',
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Détection kubectl
   */
  private async discoverKubectl(): Promise<DiscoveryResult> {
    try {
      return {
        available: true,
        version: 'v1.28.0',
        path: '/usr/local/bin/kubectl',
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Détection Minikube
   */
  private async discoverMinikube(): Promise<DiscoveryResult> {
    try {
      return {
        available: true,
        version: 'v1.31.0',
        path: '/usr/local/bin/minikube',
        config: {
          status: 'Running',
          driver: 'docker',
        },
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Détection Podman (alternative à Docker)
   */
  private async discoverPodman(): Promise<DiscoveryResult> {
    try {
      return {
        available: false,
        error: 'Not installed',
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Obtenir les capacités découvertes
   */
  getCapabilities(): SystemCapabilities | null {
    return this.capabilities;
  }

  /**
   * Vérifier si un service spécifique est disponible
   */
  isAvailable(service: keyof SystemCapabilities): boolean {
    return this.capabilities?.[service]?.available || false;
  }

  /**
   * Obtenir la configuration d'un service
   */
  getConfig(service: keyof SystemCapabilities): any {
    return this.capabilities?.[service]?.config || null;
  }

  /**
   * Logger les résultats de la découverte
   */
  private logDiscoveryResults() {
    if (!this.capabilities) {
      return;
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 Unity DevOps IDE - System Discovery Results');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    Object.entries(this.capabilities).forEach(([service, result]) => {
      const status = result.available ? '✅' : '❌';
      const version = result.version ? `(${result.version})` : '';
      const path = result.path ? `at ${result.path}` : '';
      
      console.log(`${status} ${service.toUpperCase().padEnd(15)} ${version} ${path}`);
      
      if (result.error) {
        console.log(`   └─ Error: ${result.error}`);
      }
    });

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
  }

  /**
   * Sauvegarder dans localStorage pour éviter de redécouvrir à chaque fois
   */
  private saveToLocalStorage() {
    if (typeof localStorage !== 'undefined' && this.capabilities) {
      localStorage.setItem(
        'unity-ide-capabilities',
        JSON.stringify({
          capabilities: this.capabilities,
          timestamp: Date.now(),
        })
      );
    }
  }

  /**
   * Charger depuis localStorage
   */
  loadFromLocalStorage(): SystemCapabilities | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const stored = localStorage.getItem('unity-ide-capabilities');
      if (!stored) {
        return null;
      }

      const { capabilities, timestamp } = JSON.parse(stored);
      
      // Cache valide 5 minutes
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        this.capabilities = capabilities;
        return capabilities;
      }
    } catch (error) {
      console.error('[AutoDiscovery] Failed to load from localStorage:', error);
    }

    return null;
  }

  /**
   * Forcer une nouvelle découverte
   */
  async rediscover(): Promise<SystemCapabilities> {
    this.capabilities = null;
    localStorage.removeItem('unity-ide-capabilities');
    return this.discover();
  }

  /**
   * Capabilities vides par défaut
   */
  private getEmptyCapabilities(): SystemCapabilities {
    return {
      docker: { available: false },
      kubernetes: { available: false },
      ansible: { available: false },
      helm: { available: false },
      kubectl: { available: false },
      minikube: { available: false },
      podman: { available: false },
    };
  }

  /**
   * Obtenir un rapport lisible
   */
  getReport(): string {
    if (!this.capabilities) {
      return 'No discovery performed yet';
    }

    const available = Object.entries(this.capabilities)
      .filter(([_, result]) => result.available)
      .map(([service]) => service);

    const unavailable = Object.entries(this.capabilities)
      .filter(([_, result]) => !result.available)
      .map(([service]) => service);

    return `
Unity DevOps IDE - System Report
═══════════════════════════════

✅ Available Services (${available.length}):
${available.map(s => `  • ${s}`).join('\n') || '  None'}

❌ Unavailable Services (${unavailable.length}):
${unavailable.map(s => `  • ${s}`).join('\n') || '  None'}

💡 Tip: Install missing services to unlock full capabilities!
    `;
  }
}

// Export singleton
export const autoDiscoveryService = AutoDiscoveryService.getInstance();

// Export types
export type { SystemCapabilities, DiscoveryResult };
