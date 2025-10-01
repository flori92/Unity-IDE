/**
 * Collaboration Service - Service de collaboration en temps réel
 * Gère les sessions collaboratives, le partage de code, et les interactions entre utilisateurs
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string; // Couleur pour le curseur
}

export interface CollaborationSession {
  id: string;
  projectId: string;
  name: string;
  owner: User;
  participants: User[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CursorPosition {
  userId: string;
  fileId: string;
  line: number;
  column: number;
  timestamp: Date;
}

export interface CodeEdit {
  id: string;
  userId: string;
  fileId: string;
  type: 'insert' | 'delete' | 'replace';
  position: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  content: string;
  timestamp: Date;
}

export interface Annotation {
  id: string;
  userId: string;
  fileId: string;
  line: number;
  content: string;
  type: 'comment' | 'suggestion' | 'question';
  resolved: boolean;
  createdAt: Date;
  replies: AnnotationReply[];
}

export interface AnnotationReply {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface SharePermission {
  userId: string;
  role: 'viewer' | 'editor' | 'admin';
  canEdit: boolean;
  canComment: boolean;
  canInvite: boolean;
}

class CollaborationService {
  private static instance: CollaborationService;
  private ws: WebSocket | null = null;
  private currentSession: CollaborationSession | null = null;
  private currentUser: User | null = null;
  private cursors: Map<string, CursorPosition> = new Map();
  private annotations: Map<string, Annotation> = new Map();
  private listeners: Map<string, Set<Function>> = new Map();

  private constructor() {
    // Singleton pattern
  }

  static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  /**
   * Initialiser le service avec l'utilisateur courant
   */
  initialize(user: User): void {
    this.currentUser = user;
  }

  /**
   * Créer une nouvelle session de collaboration
   */
  async createSession(projectId: string, name: string): Promise<CollaborationSession> {
    if (!this.currentUser) {
      throw new Error('User not initialized');
    }

    const session: CollaborationSession = {
      id: this.generateId(),
      projectId,
      name,
      owner: this.currentUser,
      participants: [this.currentUser],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    this.currentSession = session;
    await this.connectWebSocket(session.id);

    this.emit('session:created', session);
    return session;
  }

  /**
   * Rejoindre une session existante
   */
  async joinSession(sessionId: string): Promise<CollaborationSession> {
    if (!this.currentUser) {
      throw new Error('User not initialized');
    }

    // Simuler la récupération de la session depuis le serveur
    // En production, cela ferait un appel API
    const session: CollaborationSession = {
      id: sessionId,
      projectId: 'project-1',
      name: 'Collaborative Session',
      owner: this.currentUser,
      participants: [this.currentUser],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    this.currentSession = session;
    await this.connectWebSocket(sessionId);

    this.emit('session:joined', session);
    return session;
  }

  /**
   * Quitter la session courante
   */
  async leaveSession(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    const session = this.currentSession;
    this.currentSession = null;
    this.cursors.clear();

    if (session) {
      this.emit('session:left', session);
    }
  }

  /**
   * Inviter un utilisateur à la session
   */
  async inviteUser(email: string, permission: SharePermission): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    // Simuler l'envoi d'invitation
    // En production, cela ferait un appel API
    this.sendMessage({
      type: 'invite',
      sessionId: this.currentSession.id,
      email,
      permission,
    });

    this.emit('user:invited', { email, permission });
  }

  /**
   * Mettre à jour la position du curseur
   */
  updateCursor(fileId: string, line: number, column: number): void {
    if (!this.currentUser || !this.currentSession) {
      return;
    }

    const cursor: CursorPosition = {
      userId: this.currentUser.id,
      fileId,
      line,
      column,
      timestamp: new Date(),
    };

    this.cursors.set(this.currentUser.id, cursor);

    this.sendMessage({
      type: 'cursor:update',
      cursor,
    });
  }

  /**
   * Envoyer une modification de code
   */
  sendEdit(edit: Omit<CodeEdit, 'id' | 'userId' | 'timestamp'>): void {
    if (!this.currentUser) {
      return;
    }

    const fullEdit: CodeEdit = {
      ...edit,
      id: this.generateId(),
      userId: this.currentUser.id,
      timestamp: new Date(),
    };

    this.sendMessage({
      type: 'code:edit',
      edit: fullEdit,
    });

    this.emit('edit:sent', fullEdit);
  }

  /**
   * Ajouter une annotation
   */
  async addAnnotation(
    fileId: string,
    line: number,
    content: string,
    type: 'comment' | 'suggestion' | 'question'
  ): Promise<Annotation> {
    if (!this.currentUser) {
      throw new Error('User not initialized');
    }

    const annotation: Annotation = {
      id: this.generateId(),
      userId: this.currentUser.id,
      fileId,
      line,
      content,
      type,
      resolved: false,
      createdAt: new Date(),
      replies: [],
    };

    this.annotations.set(annotation.id, annotation);

    this.sendMessage({
      type: 'annotation:add',
      annotation,
    });

    this.emit('annotation:added', annotation);
    return annotation;
  }

  /**
   * Répondre à une annotation
   */
  async replyToAnnotation(annotationId: string, content: string): Promise<AnnotationReply> {
    if (!this.currentUser) {
      throw new Error('User not initialized');
    }

    const annotation = this.annotations.get(annotationId);
    if (!annotation) {
      throw new Error('Annotation not found');
    }

    const reply: AnnotationReply = {
      id: this.generateId(),
      userId: this.currentUser.id,
      content,
      createdAt: new Date(),
    };

    annotation.replies.push(reply);

    this.sendMessage({
      type: 'annotation:reply',
      annotationId,
      reply,
    });

    this.emit('annotation:replied', { annotationId, reply });
    return reply;
  }

  /**
   * Résoudre une annotation
   */
  async resolveAnnotation(annotationId: string): Promise<void> {
    const annotation = this.annotations.get(annotationId);
    if (!annotation) {
      throw new Error('Annotation not found');
    }

    annotation.resolved = true;

    this.sendMessage({
      type: 'annotation:resolve',
      annotationId,
    });

    this.emit('annotation:resolved', annotationId);
  }

  /**
   * Obtenir toutes les annotations d'un fichier
   */
  getFileAnnotations(fileId: string): Annotation[] {
    return Array.from(this.annotations.values()).filter(
      (annotation) => annotation.fileId === fileId
    );
  }

  /**
   * Obtenir les curseurs des autres utilisateurs
   */
  getOtherCursors(): CursorPosition[] {
    if (!this.currentUser) {
      return [];
    }

    return Array.from(this.cursors.values()).filter(
      (cursor) => cursor.userId !== this.currentUser!.id
    );
  }

  /**
   * Obtenir la session courante
   */
  getCurrentSession(): CollaborationSession | null {
    return this.currentSession;
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
   * Émettre un événement
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Connecter le WebSocket
   */
  private async connectWebSocket(sessionId: string): Promise<void> {
    // En production, utiliser une vraie URL WebSocket
    const wsUrl = `ws://localhost:3001/collaboration/${sessionId}`;

    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.sendMessage({
            type: 'join',
            userId: this.currentUser?.id,
            sessionId,
          });
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          // Ne pas rejeter, continuer en mode dégradé
          resolve();
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.emit('connection:closed', {});
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        // Continuer en mode dégradé
        resolve();
      }
    });
  }

  /**
   * Envoyer un message via WebSocket
   */
  private sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Gérer les messages reçus
   */
  private handleMessage(message: any): void {
    switch (message.type) {
      case 'cursor:update':
        if (message.cursor.userId !== this.currentUser?.id) {
          this.cursors.set(message.cursor.userId, message.cursor);
          this.emit('cursor:updated', message.cursor);
        }
        break;

      case 'code:edit':
        this.emit('edit:received', message.edit);
        break;

      case 'annotation:add':
        this.annotations.set(message.annotation.id, message.annotation);
        this.emit('annotation:added', message.annotation);
        break;

      case 'annotation:reply':
        const annotation = this.annotations.get(message.annotationId);
        if (annotation) {
          annotation.replies.push(message.reply);
          this.emit('annotation:replied', { annotationId: message.annotationId, reply: message.reply });
        }
        break;

      case 'annotation:resolve':
        const resolvedAnnotation = this.annotations.get(message.annotationId);
        if (resolvedAnnotation) {
          resolvedAnnotation.resolved = true;
          this.emit('annotation:resolved', message.annotationId);
        }
        break;

      case 'user:joined':
        if (this.currentSession) {
          this.currentSession.participants.push(message.user);
          this.emit('user:joined', message.user);
        }
        break;

      case 'user:left':
        if (this.currentSession) {
          this.currentSession.participants = this.currentSession.participants.filter(
            (p) => p.id !== message.userId
          );
          this.cursors.delete(message.userId);
          this.emit('user:left', message.userId);
        }
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  /**
   * Générer un ID unique
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const collaborationService = CollaborationService.getInstance();
