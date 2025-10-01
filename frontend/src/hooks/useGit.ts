/**
 * Hook useGit - Gestion Git
 * Hook React pour interagir avec Git
 */

import { useState, useEffect, useCallback } from 'react';
import { gitService, GitStatus, GitCommit, GitBranch } from '../services/git.service';

export const useGit = (repoPath: string = '.') => {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [branches, setBranches] = useState<GitBranch[]>([]);
  const [history, setHistory] = useState<GitCommit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charge le status Git
   */
  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await gitService.getStatus(repoPath);
      setStatus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load Git status');
      console.error('Failed to load Git status:', err);
    } finally {
      setLoading(false);
    }
  }, [repoPath]);

  /**
   * Charge les branches
   */
  const loadBranches = useCallback(async () => {
    try {
      const data = await gitService.listBranches(repoPath);
      setBranches(data);
    } catch (err: any) {
      console.error('Failed to load branches:', err);
    }
  }, [repoPath]);

  /**
   * Charge l'historique
   */
  const loadHistory = useCallback(async (limit: number = 50) => {
    try {
      const data = await gitService.getHistory(limit, repoPath);
      setHistory(data);
    } catch (err: any) {
      console.error('Failed to load history:', err);
    }
  }, [repoPath]);

  /**
   * Crée une nouvelle branche
   */
  const createBranch = useCallback(async (name: string) => {
    try {
      await gitService.createBranch(name, repoPath);
      await loadBranches();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to create branch');
      console.error('Failed to create branch:', err);
      return false;
    }
  }, [repoPath, loadBranches]);

  /**
   * Change de branche
   */
  const checkoutBranch = useCallback(async (name: string) => {
    try {
      await gitService.checkoutBranch(name, repoPath);
      await loadStatus();
      await loadBranches();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to checkout branch');
      console.error('Failed to checkout branch:', err);
      return false;
    }
  }, [repoPath, loadStatus, loadBranches]);

  /**
   * Stage des fichiers
   */
  const stageFiles = useCallback(async (files: string[]) => {
    try {
      await gitService.stageFiles(files, repoPath);
      await loadStatus();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to stage files');
      console.error('Failed to stage files:', err);
      return false;
    }
  }, [repoPath, loadStatus]);

  /**
   * Unstage des fichiers
   */
  const unstageFiles = useCallback(async (files: string[]) => {
    try {
      await gitService.unstageFiles(files, repoPath);
      await loadStatus();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to unstage files');
      console.error('Failed to unstage files:', err);
      return false;
    }
  }, [repoPath, loadStatus]);

  /**
   * Commit les changements
   */
  const commit = useCallback(async (message: string) => {
    try {
      await gitService.commit(message, repoPath);
      await loadStatus();
      await loadHistory();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to commit');
      console.error('Failed to commit:', err);
      return false;
    }
  }, [repoPath, loadStatus, loadHistory]);

  /**
   * Push vers le remote
   */
  const push = useCallback(async () => {
    try {
      await gitService.push(repoPath);
      await loadStatus();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to push');
      console.error('Failed to push:', err);
      return false;
    }
  }, [repoPath, loadStatus]);

  /**
   * Pull depuis le remote
   */
  const pull = useCallback(async () => {
    try {
      await gitService.pull(repoPath);
      await loadStatus();
      await loadHistory();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to pull');
      console.error('Failed to pull:', err);
      return false;
    }
  }, [repoPath, loadStatus, loadHistory]);

  /**
   * Discard les changements d'un fichier
   */
  const discardChanges = useCallback(async (file: string) => {
    try {
      await gitService.discardChanges(file, repoPath);
      await loadStatus();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to discard changes');
      console.error('Failed to discard changes:', err);
      return false;
    }
  }, [repoPath, loadStatus]);

  // Charge le status au montage
  useEffect(() => {
    loadStatus();
    loadBranches();
    loadHistory();
  }, [loadStatus, loadBranches, loadHistory]);

  return {
    status,
    branches,
    history,
    loading,
    error,
    loadStatus,
    loadBranches,
    loadHistory,
    createBranch,
    checkoutBranch,
    stageFiles,
    unstageFiles,
    commit,
    push,
    pull,
    discardChanges,
  };
};

export default useGit;
