/**
 * Hook useDocker - Gestion Docker
 * Hook React pour interagir avec l'API Docker
 */

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.service';
import { wsService } from '../services/websocket.service';

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'paused' | 'restarting';
  state: string;
  ports: string[];
  created: string;
}

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: number;
  created: string;
}

export const useDocker = () => {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [images, setImages] = useState<DockerImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charge la liste des containers
   */
  const loadContainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.listContainers();
      setContainers(data.containers || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load containers');
      console.error('Failed to load containers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Charge la liste des images
   */
  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.listImages();
      setImages(data.images || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load images');
      console.error('Failed to load images:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Démarre un container
   */
  const startContainer = useCallback(async (containerId: string) => {
    try {
      await apiService.startContainer(containerId);
      await loadContainers();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to start container');
      console.error('Failed to start container:', err);
      return false;
    }
  }, [loadContainers]);

  /**
   * Arrête un container
   */
  const stopContainer = useCallback(async (containerId: string) => {
    try {
      await apiService.stopContainer(containerId);
      await loadContainers();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to stop container');
      console.error('Failed to stop container:', err);
      return false;
    }
  }, [loadContainers]);

  /**
   * Redémarre un container
   */
  const restartContainer = useCallback(async (containerId: string) => {
    try {
      await apiService.restartContainer(containerId);
      await loadContainers();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to restart container');
      console.error('Failed to restart container:', err);
      return false;
    }
  }, [loadContainers]);

  /**
   * Supprime un container
   */
  const removeContainer = useCallback(async (containerId: string) => {
    try {
      await apiService.removeContainer(containerId);
      await loadContainers();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to remove container');
      console.error('Failed to remove container:', err);
      return false;
    }
  }, [loadContainers]);

  /**
   * Récupère les logs d'un container
   */
  const getContainerLogs = useCallback(async (containerId: string, tail: number = 100) => {
    try {
      const data = await apiService.getContainerLogs(containerId, tail);
      return data.logs || [];
    } catch (err: any) {
      setError(err.message || 'Failed to get container logs');
      console.error('Failed to get container logs:', err);
      return [];
    }
  }, []);

  /**
   * Subscribe aux logs temps réel d'un container
   */
  const subscribeToLogs = useCallback((containerId: string, callback: (log: string) => void) => {
    const handler = (data: any) => {
      if (data.containerId === containerId) {
        callback(data.log);
      }
    };
    wsService.subscribeDockerLogs(containerId, handler);
    return () => wsService.unsubscribeDockerLogs(containerId, handler);
  }, []);

  /**
   * Pull une image
   */
  const pullImage = useCallback(async (imageName: string) => {
    try {
      await apiService.pullImage(imageName);
      await loadImages();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to pull image');
      console.error('Failed to pull image:', err);
      return false;
    }
  }, [loadImages]);

  // Charge les containers au montage
  useEffect(() => {
    loadContainers();
  }, [loadContainers]);

  return {
    containers,
    images,
    loading,
    error,
    loadContainers,
    loadImages,
    startContainer,
    stopContainer,
    restartContainer,
    removeContainer,
    getContainerLogs,
    subscribeToLogs,
    pullImage,
  };
};

export default useDocker;
