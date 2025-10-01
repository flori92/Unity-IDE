/**
 * Conflict Service - Service de résolution de conflits
 * Gère la détection et la résolution des conflits de synchronisation
 */

export interface Conflict {
  id: string;
  itemId: string;
  itemType: 'settings' | 'workspace' | 'extensions' | 'keybindings';
  itemName: string;
  localVersion: ConflictVersion;
  remoteVersion: ConflictVersion;
  timestamp: Date;
  resolved: boolean;
  resolution?: 'local' | 'remote' | 'merge' | 'manual';
}

export interface ConflictVersion {
  data: any;
  lastModified: Date;
  deviceId: string;
  deviceName: string;
  hash: string;
}

export interface MergeResult {
  success: boolean;
  merged: any;
  conflicts: string[];
}

class ConflictService {
  private static instance: ConflictService;
  private conflicts: Map<string, Conflict> = new Map();
  private listeners: Map<string, Set<Function>> = new Map();

  private constructor() {
    // Singleton pattern
    this.loadConflicts();
  }

  static getInstance(): ConflictService {
    if (!ConflictService.instance) {
      ConflictService.instance = new ConflictService();
    }
    return ConflictService.instance;
  }

  /**
   * Détecter un conflit entre versions locale et distante
   */
  detectConflict(
    itemId: string,
    itemType: 'settings' | 'workspace' | 'extensions' | 'keybindings',
    itemName: string,
    localVersion: ConflictVersion,
    remoteVersion: ConflictVersion
  ): Conflict | null {
    // Pas de conflit si les hashs sont identiques
    if (localVersion.hash === remoteVersion.hash) {
      return null;
    }

    // Pas de conflit si une version est plus récente
    if (localVersion.lastModified > remoteVersion.lastModified) {
      return null; // Version locale plus récente, pas de conflit
    }

    if (remoteVersion.lastModified > localVersion.lastModified) {
      // Version distante plus récente, mais vérifier si changements locaux
      if (this.hasLocalChanges(localVersion)) {
        // Il y a des changements locaux non synchronisés, c'est un conflit
        const conflict: Conflict = {
          id: this.generateId(),
          itemId,
          itemType,
          itemName,
          localVersion,
          remoteVersion,
          timestamp: new Date(),
          resolved: false,
        };

        this.conflicts.set(conflict.id, conflict);
        this.saveConflicts();
        this.emit('conflict:detected', conflict);

        return conflict;
      }
    }

    return null;
  }

  /**
   * Résoudre un conflit en choisissant la version locale
   */
  async resolveWithLocal(conflictId: string): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    conflict.resolved = true;
    conflict.resolution = 'local';

    this.saveConflicts();
    this.emit('conflict:resolved', conflict);
  }

  /**
   * Résoudre un conflit en choisissant la version distante
   */
  async resolveWithRemote(conflictId: string): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    conflict.resolved = true;
    conflict.resolution = 'remote';

    this.saveConflicts();
    this.emit('conflict:resolved', conflict);
  }

  /**
   * Résoudre un conflit en fusionnant les versions
   */
  async resolveWithMerge(conflictId: string): Promise<MergeResult> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    const mergeResult = this.mergeVersions(
      conflict.localVersion.data,
      conflict.remoteVersion.data,
      conflict.itemType
    );

    if (mergeResult.success) {
      conflict.resolved = true;
      conflict.resolution = 'merge';
      this.saveConflicts();
      this.emit('conflict:resolved', conflict);
    }

    return mergeResult;
  }

  /**
   * Résoudre un conflit manuellement
   */
  async resolveManually(conflictId: string, resolvedData: any): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    conflict.resolved = true;
    conflict.resolution = 'manual';

    // Sauvegarder les données résolues
    this.saveResolvedData(conflict.itemId, resolvedData);

    this.saveConflicts();
    this.emit('conflict:resolved', conflict);
  }

  /**
   * Obtenir tous les conflits
   */
  getConflicts(): Conflict[] {
    return Array.from(this.conflicts.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Obtenir les conflits non résolus
   */
  getUnresolvedConflicts(): Conflict[] {
    return this.getConflicts().filter((c) => !c.resolved);
  }

  /**
   * Obtenir un conflit spécifique
   */
  getConflict(conflictId: string): Conflict | undefined {
    return this.conflicts.get(conflictId);
  }

  /**
   * Supprimer un conflit résolu
   */
  async deleteConflict(conflictId: string): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    if (!conflict.resolved) {
      throw new Error('Cannot delete unresolved conflict');
    }

    this.conflicts.delete(conflictId);
    this.saveConflicts();

    this.emit('conflict:deleted', { conflictId });
  }

  /**
   * Nettoyer les conflits résolus
   */
  async cleanupResolvedConflicts(): Promise<void> {
    const resolved = this.getConflicts().filter((c) => c.resolved);
    for (const conflict of resolved) {
      this.conflicts.delete(conflict.id);
    }

    this.saveConflicts();
    this.emit('conflicts:cleaned', { count: resolved.length });
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
   * Vérifier si la version locale a des changements non synchronisés
   */
  private hasLocalChanges(version: ConflictVersion): boolean {
    // Vérifier si la dernière modification est récente (moins de 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return version.lastModified > fiveMinutesAgo;
  }

  /**
   * Fusionner deux versions
   */
  private mergeVersions(
    local: any,
    remote: any,
    type: string
  ): MergeResult {
    const conflicts: string[] = [];

    try {
      if (type === 'settings') {
        // Pour les settings, fusionner les objets
        const merged = { ...remote, ...local };
        return { success: true, merged, conflicts };
      } else if (type === 'extensions') {
        // Pour les extensions, fusionner les tableaux
        const localArray = Array.isArray(local) ? local : [];
        const remoteArray = Array.isArray(remote) ? remote : [];
        const merged = [...new Set([...localArray, ...remoteArray])];
        return { success: true, merged, conflicts };
      } else if (type === 'workspace') {
        // Pour les workspaces, prendre la version locale par défaut
        return { success: true, merged: local, conflicts: ['Using local workspace'] };
      } else {
        // Type inconnu, ne pas fusionner
        conflicts.push('Unknown item type');
        return { success: false, merged: null, conflicts };
      }
    } catch (error: any) {
      conflicts.push(error.message);
      return { success: false, merged: null, conflicts };
    }
  }

  /**
   * Sauvegarder les données résolues
   */
  private saveResolvedData(itemId: string, data: any): void {
    // En production, sauvegarder dans le store approprié
    localStorage.setItem(`unity-ide-resolved-${itemId}`, JSON.stringify(data));
  }

  /**
   * Charger les conflits depuis le localStorage
   */
  private loadConflicts(): void {
    const stored = localStorage.getItem('unity-ide-conflicts');
    if (stored) {
      const conflicts: Conflict[] = JSON.parse(stored);
      conflicts.forEach((conflict) => {
        conflict.timestamp = new Date(conflict.timestamp);
        conflict.localVersion.lastModified = new Date(conflict.localVersion.lastModified);
        conflict.remoteVersion.lastModified = new Date(conflict.remoteVersion.lastModified);
        this.conflicts.set(conflict.id, conflict);
      });
    }
  }

  /**
   * Sauvegarder les conflits dans le localStorage
   */
  private saveConflicts(): void {
    const conflicts = Array.from(this.conflicts.values());
    localStorage.setItem('unity-ide-conflicts', JSON.stringify(conflicts));
  }

  /**
   * Générer un ID unique
   */
  private generateId(): string {
    return `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const conflictService = ConflictService.getInstance();
