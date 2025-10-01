/**
 * Hook useKubernetes - Gestion Kubernetes
 * Hook React pour interagir avec l'API Kubernetes
 */

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.service';
import { wsService } from '../services/websocket.service';

export interface K8sPod {
  name: string;
  namespace: string;
  status: 'Running' | 'Pending' | 'Failed' | 'Succeeded' | 'Unknown';
  ready: string;
  restarts: number;
  age: string;
  ip: string;
}

export interface K8sDeployment {
  name: string;
  namespace: string;
  replicas: number;
  available: number;
  ready: number;
  upToDate: number;
  age: string;
}

export interface K8sService {
  name: string;
  namespace: string;
  type: string;
  clusterIP: string;
  externalIP: string;
  ports: string[];
  age: string;
}

export const useKubernetes = (namespace: string = 'default') => {
  const [pods, setPods] = useState<K8sPod[]>([]);
  const [deployments, setDeployments] = useState<K8sDeployment[]>([]);
  const [services, setServices] = useState<K8sService[]>([]);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charge la liste des pods
   */
  const loadPods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.listPods(namespace);
      setPods(data.pods || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load pods');
      console.error('Failed to load pods:', err);
    } finally {
      setLoading(false);
    }
  }, [namespace]);

  /**
   * Charge la liste des deployments
   */
  const loadDeployments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.listDeployments(namespace);
      setDeployments(data.deployments || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load deployments');
      console.error('Failed to load deployments:', err);
    } finally {
      setLoading(false);
    }
  }, [namespace]);

  /**
   * Charge la liste des services
   */
  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.listServices(namespace);
      setServices(data.services || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load services');
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  }, [namespace]);

  /**
   * Charge la liste des namespaces
   */
  const loadNamespaces = useCallback(async () => {
    try {
      const data = await apiService.listNamespaces();
      setNamespaces(data.namespaces || []);
    } catch (err: any) {
      console.error('Failed to load namespaces:', err);
    }
  }, []);

  /**
   * Supprime un pod
   */
  const deletePod = useCallback(async (podName: string) => {
    try {
      await apiService.deletePod(podName, namespace);
      await loadPods();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete pod');
      console.error('Failed to delete pod:', err);
      return false;
    }
  }, [namespace, loadPods]);

  /**
   * Scale un deployment
   */
  const scaleDeployment = useCallback(async (deploymentName: string, replicas: number) => {
    try {
      await apiService.scaleDeployment(deploymentName, replicas, namespace);
      await loadDeployments();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to scale deployment');
      console.error('Failed to scale deployment:', err);
      return false;
    }
  }, [namespace, loadDeployments]);

  /**
   * Récupère les logs d'un pod
   */
  const getPodLogs = useCallback(async (podName: string, tail: number = 100) => {
    try {
      const data = await apiService.getPodLogs(podName, namespace, tail);
      return data.logs || [];
    } catch (err: any) {
      setError(err.message || 'Failed to get pod logs');
      console.error('Failed to get pod logs:', err);
      return [];
    }
  }, [namespace]);

  /**
   * Subscribe aux logs temps réel d'un pod
   */
  const subscribeToLogs = useCallback((podName: string, callback: (log: string) => void) => {
    const handler = (data: any) => {
      if (data.podName === podName && data.namespace === namespace) {
        callback(data.log);
      }
    };
    wsService.subscribeK8sLogs(podName, namespace, handler);
    return () => wsService.unsubscribeK8sLogs(podName, namespace, handler);
  }, [namespace]);

  /**
   * Subscribe aux événements Kubernetes
   */
  const subscribeToEvents = useCallback((callback: (event: any) => void) => {
    const handler = (data: any) => {
      if (data.namespace === namespace) {
        callback(data.event);
      }
    };
    wsService.subscribeK8sEvents(namespace, handler);
    return () => wsService.unsubscribeK8sEvents(namespace, handler);
  }, [namespace]);

  // Charge les ressources au montage
  useEffect(() => {
    loadPods();
    loadDeployments();
    loadServices();
    loadNamespaces();
  }, [loadPods, loadDeployments, loadServices, loadNamespaces]);

  return {
    pods,
    deployments,
    services,
    namespaces,
    loading,
    error,
    loadPods,
    loadDeployments,
    loadServices,
    loadNamespaces,
    deletePod,
    scaleDeployment,
    getPodLogs,
    subscribeToLogs,
    subscribeToEvents,
  };
};

export default useKubernetes;
