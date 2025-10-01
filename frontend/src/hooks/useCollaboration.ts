/**
 * useCollaboration Hook - Hook pour la collaboration en temps réel
 * Fournit l'accès aux fonctionnalités de collaboration
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collaborationService,
  CollaborationSession,
  User,
  CursorPosition,
  CodeEdit,
  Annotation,
  AnnotationReply,
  SharePermission,
} from '../services/collaboration.service';

export interface UseCollaborationReturn {
  // Session
  currentSession: CollaborationSession | null;
  isConnected: boolean;
  createSession: (projectId: string, name: string) => Promise<CollaborationSession>;
  joinSession: (sessionId: string) => Promise<CollaborationSession>;
  leaveSession: () => Promise<void>;
  inviteUser: (email: string, permission: SharePermission) => Promise<void>;

  // Curseurs
  cursors: CursorPosition[];
  updateCursor: (fileId: string, line: number, column: number) => void;

  // Édition
  sendEdit: (edit: Omit<CodeEdit, 'id' | 'userId' | 'timestamp'>) => void;
  onEditReceived: (callback: (edit: CodeEdit) => void) => () => void;

  // Annotations
  annotations: Annotation[];
  addAnnotation: (
    fileId: string,
    line: number,
    content: string,
    type: 'comment' | 'suggestion' | 'question'
  ) => Promise<Annotation>;
  replyToAnnotation: (annotationId: string, content: string) => Promise<AnnotationReply>;
  resolveAnnotation: (annotationId: string) => Promise<void>;
  getFileAnnotations: (fileId: string) => Annotation[];

  // État
  loading: boolean;
  error: string | null;
}

export function useCollaboration(): UseCollaborationReturn {
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialiser le service
  useEffect(() => {
    // Simuler un utilisateur pour le développement
    const mockUser: User = {
      id: 'user-1',
      name: 'Current User',
      email: 'user@example.com',
      color: '#007acc',
    };

    collaborationService.initialize(mockUser);

    // Écouter les événements
    const unsubscribeCreated = collaborationService.on('session:created', (session: CollaborationSession) => {
      setCurrentSession(session);
      setIsConnected(true);
    });

    const unsubscribeJoined = collaborationService.on('session:joined', (session: CollaborationSession) => {
      setCurrentSession(session);
      setIsConnected(true);
    });

    const unsubscribeLeft = collaborationService.on('session:left', () => {
      setCurrentSession(null);
      setIsConnected(false);
      setCursors([]);
    });

    const unsubscribeCursorUpdated = collaborationService.on('cursor:updated', () => {
      setCursors(collaborationService.getOtherCursors());
    });

    const unsubscribeAnnotationAdded = collaborationService.on('annotation:added', () => {
      // Mettre à jour la liste des annotations
      updateAnnotations();
    });

    const unsubscribeAnnotationReplied = collaborationService.on('annotation:replied', () => {
      updateAnnotations();
    });

    const unsubscribeAnnotationResolved = collaborationService.on('annotation:resolved', () => {
      updateAnnotations();
    });

    const unsubscribeConnectionClosed = collaborationService.on('connection:closed', () => {
      setIsConnected(false);
    });

    // Nettoyer les abonnements
    return () => {
      unsubscribeCreated();
      unsubscribeJoined();
      unsubscribeLeft();
      unsubscribeCursorUpdated();
      unsubscribeAnnotationAdded();
      unsubscribeAnnotationReplied();
      unsubscribeAnnotationResolved();
      unsubscribeConnectionClosed();
    };
  }, []);

  // Mettre à jour les annotations
  const updateAnnotations = useCallback(() => {
    // Récupérer toutes les annotations de tous les fichiers
    // En production, filtrer par fichier actif
    const allAnnotations: Annotation[] = [];
    // Pour l'instant, on récupère toutes les annotations
    setAnnotations(allAnnotations);
  }, []);

  // Créer une session
  const createSession = useCallback(async (projectId: string, name: string) => {
    setLoading(true);
    setError(null);

    try {
      const session = await collaborationService.createSession(projectId, name);
      return session;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Rejoindre une session
  const joinSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const session = await collaborationService.joinSession(sessionId);
      return session;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Quitter une session
  const leaveSession = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await collaborationService.leaveSession();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Inviter un utilisateur
  const inviteUser = useCallback(async (email: string, permission: SharePermission) => {
    setLoading(true);
    setError(null);

    try {
      await collaborationService.inviteUser(email, permission);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour le curseur
  const updateCursor = useCallback((fileId: string, line: number, column: number) => {
    collaborationService.updateCursor(fileId, line, column);
  }, []);

  // Envoyer une modification
  const sendEdit = useCallback((edit: Omit<CodeEdit, 'id' | 'userId' | 'timestamp'>) => {
    collaborationService.sendEdit(edit);
  }, []);

  // Écouter les modifications reçues
  const onEditReceived = useCallback((callback: (edit: CodeEdit) => void) => {
    return collaborationService.on('edit:received', callback);
  }, []);

  // Ajouter une annotation
  const addAnnotation = useCallback(
    async (
      fileId: string,
      line: number,
      content: string,
      type: 'comment' | 'suggestion' | 'question'
    ) => {
      setLoading(true);
      setError(null);

      try {
        const annotation = await collaborationService.addAnnotation(fileId, line, content, type);
        return annotation;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Répondre à une annotation
  const replyToAnnotation = useCallback(async (annotationId: string, content: string) => {
    setLoading(true);
    setError(null);

    try {
      const reply = await collaborationService.replyToAnnotation(annotationId, content);
      return reply;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Résoudre une annotation
  const resolveAnnotation = useCallback(async (annotationId: string) => {
    setLoading(true);
    setError(null);

    try {
      await collaborationService.resolveAnnotation(annotationId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtenir les annotations d'un fichier
  const getFileAnnotations = useCallback((fileId: string) => {
    return collaborationService.getFileAnnotations(fileId);
  }, []);

  return {
    // Session
    currentSession,
    isConnected,
    createSession,
    joinSession,
    leaveSession,
    inviteUser,

    // Curseurs
    cursors,
    updateCursor,

    // Édition
    sendEdit,
    onEditReceived,

    // Annotations
    annotations,
    addAnnotation,
    replyToAnnotation,
    resolveAnnotation,
    getFileAnnotations,

    // État
    loading,
    error,
  };
}
