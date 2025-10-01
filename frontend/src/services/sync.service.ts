/**
 * Sync Service - Service de synchronisation cloud
 * Gère la synchronisation des settings, extensions, et workspaces entre devices
 */

export interface SyncSettings {
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // en minutes
  lastSync: Date | null;
  provider: 'github' | 'gitlab' | 'custom';
  endpoint?: string;
  token?: string;
}

export interface SyncItem {
  id: string;
  type: 'settings' | 'extensions' | 'workspace' | 'keybindings' | 'snippets';
  name: string;
  data: any;
  lastModified: Date;
  deviceId: string;
  hash: string;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSync: Date | null;
  itemsSynced: number;
  itemsFailed: number;
  errors: SyncError[];
}

export interface SyncError {
  id: string;
  itemId: string;
  message: string;
  timestamp: Date;
  retryable: boolean;
}

export interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'laptop' | 'web';
  os: string;
  lastSeen: Date;
  isCurrentDevice: boolean;
}

class SyncService {
  private static instance: SyncService;
  private settings: SyncSettings;
  private status: SyncStatus;
  private devices: Map<string, Device> = new Map();
  private syncQueue: SyncItem[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private currentDeviceId: string;

  private constructor() {
    // Singleton pattern
    this.currentDeviceId = this.generateDeviceId();
    this.settings = this.loadSettings();
    this.status = {
      isSyncing: false,
      lastSync: null,
      itemsSynced: 0,
      itemsFailed: 0,
      errors: [],
    };

    // Enregistrer le device actuel
    this.registerCurrentDevice();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Initialiser le service de synchronisation
   */
  async initialize(): Promise<void> {
    if (this.settings.enabled && this.settings.autoSync) {
      await this.startAutoSync();
    }

    // Charger les devices depuis le cloud
    await this.loadDevices();

    this.emit('initialized', {});
  }

  /**
   * Activer/désactiver la synchronisation
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.settings.enabled = enabled;
    await this.saveSettings();

    if (enabled && this.settings.autoSync) {
      await this.startAutoSync();
    } else {
      this.stopAutoSync();
    }

    this.emit('settings:changed', this.settings);
  }

  /**
   * Configurer le provider de synchronisation
   */
  async configureProvider(
    provider: 'github' | 'gitlab' | 'custom',
    endpoint?: string,
    token?: string
  ): Promise<void> {
    this.settings.provider = provider;
    this.settings.endpoint = endpoint;
    this.settings.token = token;
    await this.saveSettings();

    this.emit('settings:changed', this.settings);
  }

  /**
   * Démarrer la synchronisation automatique
   */
  async startAutoSync(): Promise<void> {
    if (this.syncInterval) {
      return;
    }

    // Sync immédiat
    await this.sync();

    // Puis sync périodique
    this.syncInterval = setInterval(
      () => this.sync(),
      this.settings.syncInterval * 60 * 1000
    );

    this.emit('autosync:started', {});
  }

  /**
   * Arrêter la synchronisation automatique
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.emit('autosync:stopped', {});
  }

  /**
   * Synchroniser maintenant
   */
  async sync(): Promise<SyncStatus> {
    if (this.status.isSyncing) {
      throw new Error('Sync already in progress');
    }

    if (!this.settings.enabled) {
      throw new Error('Sync is disabled');
    }

    this.status.isSyncing = true;
    this.status.errors = [];
    this.emit('sync:started', {});

    try {
      // 1. Upload les changements locaux
      await this.uploadLocalChanges();

      // 2. Download les changements distants
      await this.downloadRemoteChanges();

      // 3. Mettre à jour le statut
      this.status.lastSync = new Date();
      this.settings.lastSync = new Date();
      await this.saveSettings();

      this.emit('sync:completed', this.status);
    } catch (error: any) {
      const syncError: SyncError = {
        id: this.generateId(),
        itemId: 'sync',
        message: error.message,
        timestamp: new Date(),
        retryable: true,
      };

      this.status.errors.push(syncError);
      this.emit('sync:failed', { error: syncError });
    } finally {
      this.status.isSyncing = false;
    }

    return this.status;
  }

  /**
   * Ajouter un item à synchroniser
   */
  async queueSync(item: Omit<SyncItem, 'id' | 'deviceId' | 'hash'>): Promise<void> {
    const syncItem: SyncItem = {
      ...item,
      id: this.generateId(),
      deviceId: this.currentDeviceId,
      hash: this.calculateHash(item.data),
    };

    this.syncQueue.push(syncItem);

    // Si auto-sync est activé, sync immédiatement
    if (this.settings.enabled && this.settings.autoSync) {
      await this.sync();
    }

    this.emit('item:queued', syncItem);
  }

  /**
   * Synchroniser les settings
   */
  async syncSettings(settings: any): Promise<void> {
    await this.queueSync({
      type: 'settings',
      name: 'User Settings',
      data: settings,
      lastModified: new Date(),
    });
  }

  /**
   * Synchroniser les extensions
   */
  async syncExtensions(extensions: any[]): Promise<void> {
    await this.queueSync({
      type: 'extensions',
      name: 'Installed Extensions',
      data: extensions,
      lastModified: new Date(),
    });
  }

  /**
   * Synchroniser un workspace
   */
  async syncWorkspace(workspace: any): Promise<void> {
    await this.queueSync({
      type: 'workspace',
      name: workspace.name || 'Workspace',
      data: workspace,
      lastModified: new Date(),
    });
  }

  /**
   * Obtenir les devices synchronisés
   */
  getDevices(): Device[] {
    return Array.from(this.devices.values());
  }

  /**
   * Obtenir le device actuel
   */
  getCurrentDevice(): Device | undefined {
    return this.devices.get(this.currentDeviceId);
  }

  /**
   * Obtenir les settings de sync
   */
  getSettings(): SyncSettings {
    return { ...this.settings };
  }

  /**
   * Obtenir le statut de sync
   */
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * S'abonner à un événement
   */
  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Émettre un événement
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Upload les changements locaux vers le cloud
   */
  private async uploadLocalChanges(): Promise<void> {
    if (this.syncQueue.length === 0) {
      return;
    }

    // Simuler l'upload vers le cloud
    // En production, faire un appel API réel
    for (const item of this.syncQueue) {
      try {
        await this.uploadItem(item);
        this.status.itemsSynced++;
      } catch (error: any) {
        this.status.itemsFailed++;
        const syncError: SyncError = {
          id: this.generateId(),
          itemId: item.id,
          message: error.message,
          timestamp: new Date(),
          retryable: true,
        };
        this.status.errors.push(syncError);
      }
    }

    // Vider la queue après upload
    this.syncQueue = [];
  }

  /**
   * Download les changements distants depuis le cloud
   */
  private async downloadRemoteChanges(): Promise<void> {
    // Simuler le download depuis le cloud
    // En production, faire un appel API réel
    try {
      const remoteItems = await this.fetchRemoteItems();

      for (const item of remoteItems) {
        await this.applyRemoteItem(item);
        this.status.itemsSynced++;
      }
    } catch (error: any) {
      this.status.itemsFailed++;
      const syncError: SyncError = {
        id: this.generateId(),
        itemId: 'remote',
        message: error.message,
        timestamp: new Date(),
        retryable: true,
      };
      this.status.errors.push(syncError);
    }
  }

  /**
   * Upload un item vers le cloud
   */
  private async uploadItem(item: SyncItem): Promise<void> {
    // Simuler l'upload
    // En production, utiliser l'API du provider (GitHub Gist, GitLab Snippets, etc.)
    console.log('Uploading item:', item.type, item.name);

    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.emit('item:uploaded', item);
  }

  /**
   * Récupérer les items distants
   */
  private async fetchRemoteItems(): Promise<SyncItem[]> {
    // Simuler le fetch depuis le cloud
    // En production, utiliser l'API du provider
    console.log('Fetching remote items...');

    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Retourner des items vides pour l'instant
    return [];
  }

  /**
   * Appliquer un item distant localement
   */
  private async applyRemoteItem(item: SyncItem): Promise<void> {
    // Vérifier si l'item existe déjà localement
    // Si oui, vérifier le hash pour détecter les conflits
    // Appliquer les changements

    console.log('Applying remote item:', item.type, item.name);
    this.emit('item:applied', item);
  }

  /**
   * Charger les devices depuis le cloud
   */
  private async loadDevices(): Promise<void> {
    // Simuler le chargement des devices
    // En production, faire un appel API
    console.log('Loading devices...');
  }

  /**
   * Enregistrer le device actuel
   */
  private registerCurrentDevice(): void {
    const device: Device = {
      id: this.currentDeviceId,
      name: this.getDeviceName(),
      type: this.getDeviceType(),
      os: this.getOS(),
      lastSeen: new Date(),
      isCurrentDevice: true,
    };

    this.devices.set(device.id, device);
  }

  /**
   * Charger les settings depuis le localStorage
   */
  private loadSettings(): SyncSettings {
    const stored = localStorage.getItem('unity-ide-sync-settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        lastSync: parsed.lastSync ? new Date(parsed.lastSync) : null,
      };
    }

    return {
      enabled: false,
      autoSync: false,
      syncInterval: 30, // 30 minutes par défaut
      lastSync: null,
      provider: 'github',
    };
  }

  /**
   * Sauvegarder les settings dans le localStorage
   */
  private async saveSettings(): Promise<void> {
    localStorage.setItem('unity-ide-sync-settings', JSON.stringify(this.settings));
  }

  /**
   * Générer un ID unique
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Générer un ID de device unique
   */
  private generateDeviceId(): string {
    let deviceId = localStorage.getItem('unity-ide-device-id');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('unity-ide-device-id', deviceId);
    }
    return deviceId;
  }

  /**
   * Calculer le hash d'un objet
   */
  private calculateHash(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Obtenir le nom du device
   */
  private getDeviceName(): string {
    return navigator.userAgent.includes('Mac') ? 'MacBook' : 'PC';
  }

  /**
   * Obtenir le type de device
   */
  private getDeviceType(): 'desktop' | 'laptop' | 'web' {
    return 'desktop';
  }

  /**
   * Obtenir l'OS
   */
  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown';
  }
}

export const syncService = SyncService.getInstance();
