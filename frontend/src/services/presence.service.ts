/**
 * Presence Service - Service de présence utilisateurs
 * Gère le statut en ligne/hors ligne, les indicateurs de frappe, et l'activité des utilisateurs
 */

export type PresenceStatus = 'online' | 'away' | 'offline' | 'busy';

export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeen: Date;
  currentFile?: string;
  isTyping: boolean;
  customStatus?: string;
}

export interface ActivityEvent {
  userId: string;
  type: 'file:open' | 'file:edit' | 'file:save' | 'chat:message' | 'annotation:add';
  fileId?: string;
  timestamp: Date;
  details?: any;
}

class PresenceService {
  private static instance: PresenceService;
  private presences: Map<string, UserPresence> = new Map();
  private activities: ActivityEvent[] = [];
  private listeners: Map<string, Set<Function>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private awayTimeout: NodeJS.Timeout | null = null;
  private currentUserId: string | null = null;

  private constructor() {
    // Singleton pattern
    this.setupActivityDetection();
  }

  static getInstance(): PresenceService {
    if (!PresenceService.instance) {
      PresenceService.instance = new PresenceService();
    }
    return PresenceService.instance;
  }

  /**
   * Initialiser le service avec l'utilisateur courant
   */
  initialize(userId: string): void {
    this.currentUserId = userId;
    this.setStatus('online');
    this.startHeartbeat();
  }

  /**
   * Définir le statut de l'utilisateur courant
   */
  setStatus(status: PresenceStatus, customStatus?: string): void {
    if (!this.currentUserId) {
      return;
    }

    const presence: UserPresence = {
      userId: this.currentUserId,
      status,
      lastSeen: new Date(),
      isTyping: false,
      customStatus,
    };

    this.presences.set(this.currentUserId, presence);
    this.emit('presence:updated', presence);

    // Envoyer au serveur (simulé)
    this.broadcastPresence(presence);
  }

  /**
   * Définir le fichier courant de l'utilisateur
   */
  setCurrentFile(fileId: string | undefined): void {
    if (!this.currentUserId) {
      return;
    }

    const presence = this.presences.get(this.currentUserId);
    if (presence) {
      presence.currentFile = fileId;
      presence.lastSeen = new Date();
      this.emit('presence:updated', presence);
      this.broadcastPresence(presence);
    }

    if (fileId) {
      this.recordActivity({
        userId: this.currentUserId,
        type: 'file:open',
        fileId,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Indiquer que l'utilisateur est en train de taper
   */
  setTyping(isTyping: boolean, fileId?: string): void {
    if (!this.currentUserId) {
      return;
    }

    const presence = this.presences.get(this.currentUserId);
    if (presence) {
      presence.isTyping = isTyping;
      presence.lastSeen = new Date();
      if (fileId) {
        presence.currentFile = fileId;
      }
      this.emit('presence:updated', presence);
      this.broadcastPresence(presence);
    }
  }

  /**
   * Enregistrer une activité utilisateur
   */
  recordActivity(activity: ActivityEvent): void {
    this.activities.unshift(activity);

    // Garder seulement les 100 dernières activités
    if (this.activities.length > 100) {
      this.activities = this.activities.slice(0, 100);
    }

    this.emit('activity:recorded', activity);

    // Réinitialiser le timer "away"
    this.resetAwayTimer();
  }

  /**
   * Obtenir la présence d'un utilisateur
   */
  getUserPresence(userId: string): UserPresence | undefined {
    return this.presences.get(userId);
  }

  /**
   * Obtenir toutes les présences
   */
  getAllPresences(): UserPresence[] {
    return Array.from(this.presences.values());
  }

  /**
   * Obtenir les utilisateurs en ligne
   */
  getOnlineUsers(): UserPresence[] {
    return this.getAllPresences().filter(
      (p) => p.status === 'online' || p.status === 'busy'
    );
  }

  /**
   * Obtenir les utilisateurs travaillant sur un fichier
   */
  getUsersOnFile(fileId: string): UserPresence[] {
    return this.getAllPresences().filter((p) => p.currentFile === fileId);
  }

  /**
   * Obtenir les activités récentes
   */
  getRecentActivities(limit: number = 20): ActivityEvent[] {
    return this.activities.slice(0, limit);
  }

  /**
   * Obtenir les activités d'un utilisateur
   */
  getUserActivities(userId: string, limit: number = 20): ActivityEvent[] {
    return this.activities.filter((a) => a.userId === userId).slice(0, limit);
  }

  /**
   * Obtenir les activités d'un fichier
   */
  getFileActivities(fileId: string, limit: number = 20): ActivityEvent[] {
    return this.activities.filter((a) => a.fileId === fileId).slice(0, limit);
  }

  /**
   * Mettre à jour la présence d'un autre utilisateur (reçu du serveur)
   */
  updateUserPresence(presence: UserPresence): void {
    this.presences.set(presence.userId, presence);
    this.emit('presence:updated', presence);
  }

  /**
   * Supprimer la présence d'un utilisateur (déconnexion)
   */
  removeUserPresence(userId: string): void {
    this.presences.delete(userId);
    this.emit('presence:removed', userId);
  }

  /**
   * S'abonner à un événement
   */
  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    // Retourner une fonction de désabonnement
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Arrêter le service
   */
  stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.awayTimeout) {
      clearTimeout(this.awayTimeout);
      this.awayTimeout = null;
    }

    if (this.currentUserId) {
      this.setStatus('offline');
    }
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
   * Diffuser la présence au serveur
   */
  private broadcastPresence(presence: UserPresence): void {
    // En production, envoyer au serveur via WebSocket ou API
    console.log('Broadcasting presence:', presence);
  }

  /**
   * Démarrer le heartbeat
   */
  private startHeartbeat(): void {
    // Envoyer un heartbeat toutes les 30 secondes
    this.heartbeatInterval = setInterval(() => {
      if (this.currentUserId) {
        const presence = this.presences.get(this.currentUserId);
        if (presence) {
          presence.lastSeen = new Date();
          this.broadcastPresence(presence);
        }
      }
    }, 30000);
  }

  /**
   * Configurer la détection d'activité
   */
  private setupActivityDetection(): void {
    if (typeof window !== 'undefined') {
      // Détecter l'activité de la souris
      window.addEventListener('mousemove', () => this.onUserActivity());
      window.addEventListener('keydown', () => this.onUserActivity());
      window.addEventListener('click', () => this.onUserActivity());

      // Détecter quand l'utilisateur quitte/revient sur l'onglet
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.setStatus('away');
        } else {
          this.setStatus('online');
          this.resetAwayTimer();
        }
      });
    }
  }

  /**
   * Gérer l'activité utilisateur
   */
  private onUserActivity(): void {
    if (!this.currentUserId) {
      return;
    }

    const presence = this.presences.get(this.currentUserId);
    if (presence && presence.status === 'away') {
      this.setStatus('online');
    }

    this.resetAwayTimer();
  }

  /**
   * Réinitialiser le timer "away"
   */
  private resetAwayTimer(): void {
    if (this.awayTimeout) {
      clearTimeout(this.awayTimeout);
    }

    // Passer en "away" après 5 minutes d'inactivité
    this.awayTimeout = setTimeout(() => {
      if (this.currentUserId) {
        const presence = this.presences.get(this.currentUserId);
        if (presence && presence.status === 'online') {
          this.setStatus('away');
        }
      }
    }, 5 * 60 * 1000);
  }
}

export const presenceService = PresenceService.getInstance();
