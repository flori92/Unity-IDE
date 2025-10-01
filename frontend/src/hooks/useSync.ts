/**
 * useSync Hook - Hook pour la synchronisation cloud
 * Fournit l'accès aux fonctionnalités de sync et backup
 */

import { useState, useEffect, useCallback } from 'react';
import {
  syncService,
  SyncSettings,
  SyncStatus,
  Device,
} from '../services/sync.service';
import {
  backupService,
  BackupSettings,
  Backup,
  RestoreOptions,
} from '../services/backup.service';
import {
  conflictService,
  Conflict,
  MergeResult,
} from '../services/conflict.service';

export interface UseSyncReturn {
  // Sync
  syncSettings: SyncSettings;
  syncStatus: SyncStatus;
  devices: Device[];
  setSyncEnabled: (enabled: boolean) => Promise<void>;
  configureProvider: (
    provider: 'github' | 'gitlab' | 'custom',
    endpoint?: string,
    token?: string
  ) => Promise<void>;
  sync: () => Promise<SyncStatus>;
  syncUserSettings: (settings: any) => Promise<void>;
  syncExtensions: (extensions: any[]) => Promise<void>;
  syncWorkspace: (workspace: any) => Promise<void>;

  // Backup
  backupSettings: BackupSettings;
  backups: Backup[];
  setBackupEnabled: (enabled: boolean) => Promise<void>;
  updateBackupSettings: (settings: Partial<BackupSettings>) => Promise<void>;
  createBackup: (name?: string) => Promise<Backup>;
  restoreBackup: (backupId: string, options: RestoreOptions) => Promise<void>;
  deleteBackup: (backupId: string) => Promise<void>;
  exportBackup: (backupId: string) => Promise<Blob>;
  importBackup: (file: File) => Promise<Backup>;

  // Conflicts
  conflicts: Conflict[];
  unresolvedConflicts: Conflict[];
  resolveWithLocal: (conflictId: string) => Promise<void>;
  resolveWithRemote: (conflictId: string) => Promise<void>;
  resolveWithMerge: (conflictId: string) => Promise<MergeResult>;
  resolveManually: (conflictId: string, resolvedData: any) => Promise<void>;
  deleteConflict: (conflictId: string) => Promise<void>;

  // État
  loading: boolean;
  error: string | null;
}

export function useSync(): UseSyncReturn {
  // Sync state
  const [syncSettings, setSyncSettings] = useState<SyncSettings>(syncService.getSettings());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncService.getStatus());
  const [devices] = useState<Device[]>(syncService.getDevices());

  // Backup state
  const [backupSettings, setBackupSettings] = useState<BackupSettings>(
    backupService.getSettings()
  );
  const [backups, setBackups] = useState<Backup[]>(backupService.getBackups());

  // Conflicts state
  const [conflicts, setConflicts] = useState<Conflict[]>(conflictService.getConflicts());
  const [unresolvedConflicts, setUnresolvedConflicts] = useState<Conflict[]>(
    conflictService.getUnresolvedConflicts()
  );

  // General state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialiser les services
  useEffect(() => {
    const initServices = async () => {
      try {
        await syncService.initialize();
        await backupService.initialize();
      } catch (err: any) {
        setError(err.message);
      }
    };

    initServices();

    // Écouter les événements de sync
    const unsubscribeSyncStarted = syncService.on('sync:started', () => {
      setLoading(true);
      setError(null);
    });

    const unsubscribeSyncCompleted = syncService.on('sync:completed', (status: SyncStatus) => {
      setLoading(false);
      setSyncStatus(status);
    });

    const unsubscribeSyncFailed = syncService.on('sync:failed', ({ error }: any) => {
      setLoading(false);
      setError(error.message);
    });

    const unsubscribeSyncSettingsChanged = syncService.on('settings:changed', (settings: SyncSettings) => {
      setSyncSettings(settings);
    });

    // Écouter les événements de backup
    const unsubscribeBackupCreated = backupService.on('backup:created', () => {
      setBackups(backupService.getBackups());
    });

    const unsubscribeBackupDeleted = backupService.on('backup:deleted', () => {
      setBackups(backupService.getBackups());
    });

    const unsubscribeBackupSettingsChanged = backupService.on('settings:changed', (settings: BackupSettings) => {
      setBackupSettings(settings);
    });

    const unsubscribeRestoreStarted = backupService.on('restore:started', () => {
      setLoading(true);
      setError(null);
    });

    const unsubscribeRestoreCompleted = backupService.on('restore:completed', () => {
      setLoading(false);
    });

    const unsubscribeRestoreFailed = backupService.on('restore:failed', ({ error }: any) => {
      setLoading(false);
      setError(error);
    });

    // Écouter les événements de conflits
    const unsubscribeConflictDetected = conflictService.on('conflict:detected', () => {
      setConflicts(conflictService.getConflicts());
      setUnresolvedConflicts(conflictService.getUnresolvedConflicts());
    });

    const unsubscribeConflictResolved = conflictService.on('conflict:resolved', () => {
      setConflicts(conflictService.getConflicts());
      setUnresolvedConflicts(conflictService.getUnresolvedConflicts());
    });

    // Nettoyer les abonnements
    return () => {
      unsubscribeSyncStarted();
      unsubscribeSyncCompleted();
      unsubscribeSyncFailed();
      unsubscribeSyncSettingsChanged();
      unsubscribeBackupCreated();
      unsubscribeBackupDeleted();
      unsubscribeBackupSettingsChanged();
      unsubscribeRestoreStarted();
      unsubscribeRestoreCompleted();
      unsubscribeRestoreFailed();
      unsubscribeConflictDetected();
      unsubscribeConflictResolved();
    };
  }, []);

  // Sync functions
  const setSyncEnabled = useCallback(async (enabled: boolean) => {
    setError(null);
    try {
      await syncService.setEnabled(enabled);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const configureProvider = useCallback(
    async (
      provider: 'github' | 'gitlab' | 'custom',
      endpoint?: string,
      token?: string
    ) => {
      setError(null);
      try {
        await syncService.configureProvider(provider, endpoint, token);
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    []
  );

  const sync = useCallback(async () => {
    setError(null);
    try {
      return await syncService.sync();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const syncUserSettings = useCallback(async (settings: any) => {
    setError(null);
    try {
      await syncService.syncSettings(settings);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const syncExtensions = useCallback(async (extensions: any[]) => {
    setError(null);
    try {
      await syncService.syncExtensions(extensions);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const syncWorkspace = useCallback(async (workspace: any) => {
    setError(null);
    try {
      await syncService.syncWorkspace(workspace);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Backup functions
  const setBackupEnabled = useCallback(async (enabled: boolean) => {
    setError(null);
    try {
      await backupService.setEnabled(enabled);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateBackupSettings = useCallback(async (settings: Partial<BackupSettings>) => {
    setError(null);
    try {
      await backupService.updateSettings(settings);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const createBackup = useCallback(async (name?: string) => {
    setError(null);
    try {
      return await backupService.createBackup(name);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const restoreBackup = useCallback(async (backupId: string, options: RestoreOptions) => {
    setError(null);
    try {
      await backupService.restoreBackup(backupId, options);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteBackup = useCallback(async (backupId: string) => {
    setError(null);
    try {
      await backupService.deleteBackup(backupId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const exportBackup = useCallback(async (backupId: string) => {
    setError(null);
    try {
      return await backupService.exportBackup(backupId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const importBackup = useCallback(async (file: File) => {
    setError(null);
    try {
      return await backupService.importBackup(file);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Conflict functions
  const resolveWithLocal = useCallback(async (conflictId: string) => {
    setError(null);
    try {
      await conflictService.resolveWithLocal(conflictId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const resolveWithRemote = useCallback(async (conflictId: string) => {
    setError(null);
    try {
      await conflictService.resolveWithRemote(conflictId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const resolveWithMerge = useCallback(async (conflictId: string) => {
    setError(null);
    try {
      return await conflictService.resolveWithMerge(conflictId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const resolveManually = useCallback(async (conflictId: string, resolvedData: any) => {
    setError(null);
    try {
      await conflictService.resolveManually(conflictId, resolvedData);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteConflict = useCallback(async (conflictId: string) => {
    setError(null);
    try {
      await conflictService.deleteConflict(conflictId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    // Sync
    syncSettings,
    syncStatus,
    devices,
    setSyncEnabled,
    configureProvider,
    sync,
    syncUserSettings,
    syncExtensions,
    syncWorkspace,

    // Backup
    backupSettings,
    backups,
    setBackupEnabled,
    updateBackupSettings,
    createBackup,
    restoreBackup,
    deleteBackup,
    exportBackup,
    importBackup,

    // Conflicts
    conflicts,
    unresolvedConflicts,
    resolveWithLocal,
    resolveWithRemote,
    resolveWithMerge,
    resolveManually,
    deleteConflict,

    // État
    loading,
    error,
  };
}
