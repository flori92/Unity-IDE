/**
 * usePresence Hook - Hook pour la gestion de la présence utilisateurs
 * Fournit l'accès aux statuts, activités et indicateurs de présence
 */

import { useState, useEffect, useCallback } from 'react';
import {
  presenceService,
  UserPresence,
  PresenceStatus,
  ActivityEvent,
} from '../services/presence.service';

export interface UsePresenceReturn {
  // Statut
  myPresence: UserPresence | null;
  setStatus: (status: PresenceStatus, customStatus?: string) => void;
  setCurrentFile: (fileId: string | undefined) => void;
  setTyping: (isTyping: boolean, fileId?: string) => void;

  // Présences
  allPresences: UserPresence[];
  onlineUsers: UserPresence[];
  getUserPresence: (userId: string) => UserPresence | undefined;
  getUsersOnFile: (fileId: string) => UserPresence[];

  // Activités
  recentActivities: ActivityEvent[];
  getUserActivities: (userId: string, limit?: number) => ActivityEvent[];
  getFileActivities: (fileId: string, limit?: number) => ActivityEvent[];
  recordActivity: (activity: ActivityEvent) => void;
}

export function usePresence(userId?: string): UsePresenceReturn {
  const [myPresence, setMyPresence] = useState<UserPresence | null>(null);
  const [allPresences, setAllPresences] = useState<UserPresence[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityEvent[]>([]);

  // Initialiser le service
  useEffect(() => {
    const currentUserId = userId || 'user-1'; // Utilisateur par défaut pour le développement
    presenceService.initialize(currentUserId);

    // Écouter les événements de présence
    const unsubscribePresenceUpdated = presenceService.on('presence:updated', (presence: UserPresence) => {
      // Mettre à jour la liste des présences
      setAllPresences(presenceService.getAllPresences());
      setOnlineUsers(presenceService.getOnlineUsers());

      // Mettre à jour ma présence si c'est moi
      if (presence.userId === currentUserId) {
        setMyPresence(presence);
      }
    });

    const unsubscribePresenceRemoved = presenceService.on('presence:removed', () => {
      setAllPresences(presenceService.getAllPresences());
      setOnlineUsers(presenceService.getOnlineUsers());
    });

    const unsubscribeActivityRecorded = presenceService.on('activity:recorded', () => {
      setRecentActivities(presenceService.getRecentActivities());
    });

    // Initialiser les états
    setAllPresences(presenceService.getAllPresences());
    setOnlineUsers(presenceService.getOnlineUsers());
    setRecentActivities(presenceService.getRecentActivities());

    // Nettoyer à la désactivation
    return () => {
      unsubscribePresenceUpdated();
      unsubscribePresenceRemoved();
      unsubscribeActivityRecorded();
      presenceService.stop();
    };
  }, [userId]);

  // Définir le statut
  const setStatus = useCallback((status: PresenceStatus, customStatus?: string) => {
    presenceService.setStatus(status, customStatus);
  }, []);

  // Définir le fichier courant
  const setCurrentFile = useCallback((fileId: string | undefined) => {
    presenceService.setCurrentFile(fileId);
  }, []);

  // Indiquer que l'utilisateur tape
  const setTyping = useCallback((isTyping: boolean, fileId?: string) => {
    presenceService.setTyping(isTyping, fileId);
  }, []);

  // Obtenir la présence d'un utilisateur
  const getUserPresence = useCallback((userId: string) => {
    return presenceService.getUserPresence(userId);
  }, []);

  // Obtenir les utilisateurs sur un fichier
  const getUsersOnFile = useCallback((fileId: string) => {
    return presenceService.getUsersOnFile(fileId);
  }, []);

  // Obtenir les activités d'un utilisateur
  const getUserActivities = useCallback((userId: string, limit?: number) => {
    return presenceService.getUserActivities(userId, limit);
  }, []);

  // Obtenir les activités d'un fichier
  const getFileActivities = useCallback((fileId: string, limit?: number) => {
    return presenceService.getFileActivities(fileId, limit);
  }, []);

  // Enregistrer une activité
  const recordActivity = useCallback((activity: ActivityEvent) => {
    presenceService.recordActivity(activity);
  }, []);

  return {
    // Statut
    myPresence,
    setStatus,
    setCurrentFile,
    setTyping,

    // Présences
    allPresences,
    onlineUsers,
    getUserPresence,
    getUsersOnFile,

    // Activités
    recentActivities,
    getUserActivities,
    getFileActivities,
    recordActivity,
  };
}
