/**
 * Backup Service - Service de backup automatique
 * Gère les sauvegardes automatiques, la restauration et l'historique
 */

export interface BackupSettings {
  enabled: boolean;
  autoBackup: boolean;
  backupInterval: number; // en minutes
  maxBackups: number;
  includeWorkspaces: boolean;
  includeSettings: boolean;
  includeExtensions: boolean;
}

export interface Backup {
  id: string;
  name: string;
  timestamp: Date;
  size: number; // en bytes
  items: BackupItem[];
  deviceId: string;
  deviceName: string;
  isAutomatic: boolean;
}

export interface BackupItem {
  type: 'workspace' | 'settings' | 'extensions' | 'keybindings' | 'snippets';
  name: string;
  data: any;
  size: number;
}

export interface RestoreOptions {
  restoreWorkspaces: boolean;
  restoreSettings: boolean;
  restoreExtensions: boolean;
  overwriteExisting: boolean;
}

class BackupService {
  private static instance: BackupService;
  private settings: BackupSettings;
  private backups: Map<string, Backup> = new Map();
  private backupInterval: NodeJS.Timeout | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  private constructor() {
    // Singleton pattern
    this.settings = this.loadSettings();
    this.loadBackups();
  }

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  /**
   * Initialiser le service de backup
   */
  async initialize(): Promise<void> {
    if (this.settings.enabled && this.settings.autoBackup) {
      this.startAutoBackup();
    }

    this.emit('initialized', {});
  }

  /**
   * Activer/désactiver les backups
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.settings.enabled = enabled;
    await this.saveSettings();

    if (enabled && this.settings.autoBackup) {
      this.startAutoBackup();
    } else {
      this.stopAutoBackup();
    }

    this.emit('settings:changed', this.settings);
  }

  /**
   * Configurer les settings de backup
   */
  async updateSettings(settings: Partial<BackupSettings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    await this.saveSettings();

    if (this.settings.enabled && this.settings.autoBackup) {
      this.stopAutoBackup();
      this.startAutoBackup();
    }

    this.emit('settings:changed', this.settings);
  }

  /**
   * Démarrer les backups automatiques
   */
  startAutoBackup(): void {
    if (this.backupInterval) {
      return;
    }

    this.backupInterval = setInterval(
      () => this.createBackup(),
      this.settings.backupInterval * 60 * 1000
    );

    this.emit('autobackup:started', {});
  }

  /**
   * Arrêter les backups automatiques
   */
  stopAutoBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }

    this.emit('autobackup:stopped', {});
  }

  /**
   * Créer un backup maintenant
   */
  async createBackup(name?: string, isAutomatic: boolean = false): Promise<Backup> {
    const items: BackupItem[] = [];

    // Backup des workspaces
    if (this.settings.includeWorkspaces) {
      const workspaces = this.getWorkspaces();
      items.push({
        type: 'workspace',
        name: 'Workspaces',
        data: workspaces,
        size: this.calculateSize(workspaces),
      });
    }

    // Backup des settings
    if (this.settings.includeSettings) {
      const settings = this.getUserSettings();
      items.push({
        type: 'settings',
        name: 'User Settings',
        data: settings,
        size: this.calculateSize(settings),
      });
    }

    // Backup des extensions
    if (this.settings.includeExtensions) {
      const extensions = this.getExtensions();
      items.push({
        type: 'extensions',
        name: 'Extensions',
        data: extensions,
        size: this.calculateSize(extensions),
      });
    }

    // Créer le backup
    const backup: Backup = {
      id: this.generateId(),
      name: name || `Backup ${new Date().toLocaleString()}`,
      timestamp: new Date(),
      size: items.reduce((sum, item) => sum + item.size, 0),
      items,
      deviceId: this.getDeviceId(),
      deviceName: this.getDeviceName(),
      isAutomatic,
    };

    // Sauvegarder
    this.backups.set(backup.id, backup);
    await this.saveBackups();

    // Nettoyer les vieux backups si nécessaire
    await this.cleanupOldBackups();

    this.emit('backup:created', backup);
    return backup;
  }

  /**
   * Restaurer un backup
   */
  async restoreBackup(backupId: string, options: RestoreOptions): Promise<void> {
    const backup = this.backups.get(backupId);
    if (!backup) {
      throw new Error('Backup not found');
    }

    this.emit('restore:started', { backupId });

    try {
      for (const item of backup.items) {
        if (item.type === 'workspace' && options.restoreWorkspaces) {
          await this.restoreWorkspaces(item.data, options.overwriteExisting);
        } else if (item.type === 'settings' && options.restoreSettings) {
          await this.restoreSettings(item.data, options.overwriteExisting);
        } else if (item.type === 'extensions' && options.restoreExtensions) {
          await this.restoreExtensions(item.data, options.overwriteExisting);
        }
      }

      this.emit('restore:completed', { backupId });
    } catch (error: any) {
      this.emit('restore:failed', { backupId, error: error.message });
      throw error;
    }
  }

  /**
   * Supprimer un backup
   */
  async deleteBackup(backupId: string): Promise<void> {
    if (!this.backups.has(backupId)) {
      throw new Error('Backup not found');
    }

    this.backups.delete(backupId);
    await this.saveBackups();

    this.emit('backup:deleted', { backupId });
  }

  /**
   * Obtenir tous les backups
   */
  getBackups(): Backup[] {
    return Array.from(this.backups.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Obtenir un backup spécifique
   */
  getBackup(backupId: string): Backup | undefined {
    return this.backups.get(backupId);
  }

  /**
   * Obtenir les settings de backup
   */
  getSettings(): BackupSettings {
    return { ...this.settings };
  }

  /**
   * Exporter un backup vers un fichier
   */
  async exportBackup(backupId: string): Promise<Blob> {
    const backup = this.backups.get(backupId);
    if (!backup) {
      throw new Error('Backup not found');
    }

    const json = JSON.stringify(backup, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  /**
   * Importer un backup depuis un fichier
   */
  async importBackup(file: File): Promise<Backup> {
    const text = await file.text();
    const backup: Backup = JSON.parse(text);

    // Générer un nouvel ID pour éviter les conflits
    backup.id = this.generateId();
    backup.timestamp = new Date(backup.timestamp);

    this.backups.set(backup.id, backup);
    await this.saveBackups();

    this.emit('backup:imported', backup);
    return backup;
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
   * Nettoyer les vieux backups
   */
  private async cleanupOldBackups(): Promise<void> {
    const backups = this.getBackups();
    if (backups.length <= this.settings.maxBackups) {
      return;
    }

    // Garder seulement les N derniers backups
    const toDelete = backups.slice(this.settings.maxBackups);
    for (const backup of toDelete) {
      await this.deleteBackup(backup.id);
    }
  }

  /**
   * Obtenir les workspaces
   */
  private getWorkspaces(): any {
    // En production, récupérer depuis le state de l'application
    return localStorage.getItem('unity-ide-workspaces') || '[]';
  }

  /**
   * Obtenir les user settings
   */
  private getUserSettings(): any {
    // En production, récupérer depuis le state de l'application
    return localStorage.getItem('unity-ide-settings') || '{}';
  }

  /**
   * Obtenir les extensions
   */
  private getExtensions(): any {
    // En production, récupérer depuis le state de l'application
    return localStorage.getItem('unity-ide-extensions') || '[]';
  }

  /**
   * Restaurer les workspaces
   */
  private async restoreWorkspaces(data: any, overwrite: boolean): Promise<void> {
    if (overwrite) {
      localStorage.setItem('unity-ide-workspaces', data);
    } else {
      // Merger avec les workspaces existants
      const existing = JSON.parse(localStorage.getItem('unity-ide-workspaces') || '[]');
      const restored = JSON.parse(data);
      const merged = [...existing, ...restored];
      localStorage.setItem('unity-ide-workspaces', JSON.stringify(merged));
    }
  }

  /**
   * Restaurer les settings
   */
  private async restoreSettings(data: any, overwrite: boolean): Promise<void> {
    if (overwrite) {
      localStorage.setItem('unity-ide-settings', data);
    } else {
      // Merger avec les settings existants
      const existing = JSON.parse(localStorage.getItem('unity-ide-settings') || '{}');
      const restored = JSON.parse(data);
      const merged = { ...existing, ...restored };
      localStorage.setItem('unity-ide-settings', JSON.stringify(merged));
    }
  }

  /**
   * Restaurer les extensions
   */
  private async restoreExtensions(data: any, overwrite: boolean): Promise<void> {
    if (overwrite) {
      localStorage.setItem('unity-ide-extensions', data);
    } else {
      // Merger avec les extensions existantes
      const existing = JSON.parse(localStorage.getItem('unity-ide-extensions') || '[]');
      const restored = JSON.parse(data);
      const merged = [...existing, ...restored];
      localStorage.setItem('unity-ide-extensions', JSON.stringify(merged));
    }
  }

  /**
   * Charger les settings depuis le localStorage
   */
  private loadSettings(): BackupSettings {
    const stored = localStorage.getItem('unity-ide-backup-settings');
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      enabled: true,
      autoBackup: true,
      backupInterval: 60, // 1 heure par défaut
      maxBackups: 10,
      includeWorkspaces: true,
      includeSettings: true,
      includeExtensions: true,
    };
  }

  /**
   * Sauvegarder les settings dans le localStorage
   */
  private async saveSettings(): Promise<void> {
    localStorage.setItem('unity-ide-backup-settings', JSON.stringify(this.settings));
  }

  /**
   * Charger les backups depuis le localStorage
   */
  private loadBackups(): void {
    const stored = localStorage.getItem('unity-ide-backups');
    if (stored) {
      const backups: Backup[] = JSON.parse(stored);
      backups.forEach((backup) => {
        backup.timestamp = new Date(backup.timestamp);
        this.backups.set(backup.id, backup);
      });
    }
  }

  /**
   * Sauvegarder les backups dans le localStorage
   */
  private async saveBackups(): Promise<void> {
    const backups = Array.from(this.backups.values());
    localStorage.setItem('unity-ide-backups', JSON.stringify(backups));
  }

  /**
   * Calculer la taille d'un objet en bytes
   */
  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  /**
   * Générer un ID unique
   */
  private generateId(): string {
    return `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtenir l'ID du device
   */
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('unity-ide-device-id');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('unity-ide-device-id', deviceId);
    }
    return deviceId;
  }

  /**
   * Obtenir le nom du device
   */
  private getDeviceName(): string {
    return navigator.userAgent.includes('Mac') ? 'MacBook' : 'PC';
  }
}

export const backupService = BackupService.getInstance();
