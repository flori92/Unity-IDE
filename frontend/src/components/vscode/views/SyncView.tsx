/**
 * SyncView - Vue de synchronisation et backup
 * Gère la synchronisation cloud et les backups
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  CloudSync,
  CloudDone,
  CloudOff,
  Backup,
  Restore,
  Delete,
  Download,
  Upload,
  Refresh,
  Settings,
  Computer,
  Warning,
} from '@mui/icons-material';
import { useSync } from '../../../hooks/useSync';

export const SyncView: React.FC = () => {
  const {
    syncSettings,
    syncStatus,
    devices,
    backups,
    unresolvedConflicts,
    setSyncEnabled,
    configureProvider,
    sync,
    createBackup,
    restoreBackup,
    deleteBackup,
    exportBackup,
    loading,
    error,
  } = useSync();

  const [showSyncConfig, setShowSyncConfig] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [provider, setProvider] = useState(syncSettings.provider);
  const [token, setToken] = useState('');

  const handleToggleSync = async () => {
    try {
      await setSyncEnabled(!syncSettings.enabled);
    } catch (err) {
      console.error('Failed to toggle sync:', err);
    }
  };

  const handleSyncNow = async () => {
    try {
      await sync();
    } catch (err) {
      console.error('Failed to sync:', err);
    }
  };

  const handleConfigureProvider = async () => {
    try {
      await configureProvider(provider, undefined, token);
      setShowSyncConfig(false);
    } catch (err) {
      console.error('Failed to configure provider:', err);
    }
  };

  const handleCreateBackup = async () => {
    try {
      await createBackup();
    } catch (err) {
      console.error('Failed to create backup:', err);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;

    try {
      await restoreBackup(selectedBackup, {
        restoreWorkspaces: true,
        restoreSettings: true,
        restoreExtensions: true,
        overwriteExisting: false,
      });
      setShowRestoreDialog(false);
      setSelectedBackup(null);
    } catch (err) {
      console.error('Failed to restore backup:', err);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Delete this backup?')) return;

    try {
      await deleteBackup(backupId);
    } catch (err) {
      console.error('Failed to delete backup:', err);
    }
  };

  const handleExportBackup = async (backupId: string) => {
    try {
      const blob = await exportBackup(backupId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unity-ide-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export backup:', err);
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString();
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #2d2d30',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudSync sx={{ color: '#007acc' }} />
          <Typography variant="h6" sx={{ color: '#cccccc', fontSize: '16px' }}>
            Sync & Backup
          </Typography>
        </Box>

        <IconButton size="small" onClick={() => setShowSyncConfig(true)} sx={{ color: '#858585' }}>
          <Settings />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Conflicts Warning */}
        {unresolvedConflicts.length > 0 && (
          <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
            {unresolvedConflicts.length} unresolved conflict{unresolvedConflicts.length > 1 ? 's' : ''}
          </Alert>
        )}

        {/* Sync Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: '#cccccc' }}>
              Cloud Synchronization
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={syncSettings.enabled}
                  onChange={handleToggleSync}
                  disabled={loading}
                />
              }
              label={syncSettings.enabled ? 'Enabled' : 'Disabled'}
              sx={{ color: '#858585' }}
            />
          </Box>

          {syncSettings.enabled && (
            <>
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#1e1e1e',
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {syncStatus.isSyncing ? (
                    <CloudSync sx={{ color: '#007acc', animation: 'spin 2s linear infinite' }} />
                  ) : syncSettings.lastSync ? (
                    <CloudDone sx={{ color: '#4caf50' }} />
                  ) : (
                    <CloudOff sx={{ color: '#858585' }} />
                  )}
                  <Typography variant="body2" sx={{ color: '#cccccc' }}>
                    {syncStatus.isSyncing
                      ? 'Syncing...'
                      : syncSettings.lastSync
                      ? `Last sync: ${formatDate(syncSettings.lastSync)}`
                      : 'Not synced yet'}
                  </Typography>
                </Box>

                {syncStatus.isSyncing && <LinearProgress sx={{ mb: 1 }} />}

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={handleSyncNow}
                    disabled={loading || syncStatus.isSyncing}
                    sx={{ bgcolor: '#007acc', '&:hover': { bgcolor: '#005a9e' } }}
                  >
                    Sync Now
                  </Button>
                  <Chip
                    label={`Provider: ${syncSettings.provider}`}
                    size="small"
                    sx={{ bgcolor: '#2d2d30', color: '#cccccc' }}
                  />
                </Box>
              </Box>

              {/* Devices */}
              {devices.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#cccccc', mb: 1 }}>
                    Synced Devices ({devices.length})
                  </Typography>
                  <List sx={{ p: 0 }}>
                    {devices.map((device) => (
                      <ListItem
                        key={device.id}
                        sx={{
                          bgcolor: '#1e1e1e',
                          borderRadius: 1,
                          mb: 0.5,
                        }}
                      >
                        <Computer sx={{ mr: 2, color: '#007acc' }} />
                        <ListItemText
                          primary={device.name}
                          secondary={`${device.os} • Last seen: ${formatDate(device.lastSeen)}`}
                          primaryTypographyProps={{ sx: { color: '#cccccc', fontSize: '14px' } }}
                          secondaryTypographyProps={{ sx: { color: '#858585', fontSize: '12px' } }}
                        />
                        {device.isCurrentDevice && (
                          <Chip label="This device" size="small" sx={{ bgcolor: '#007acc', color: 'white' }} />
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </>
          )}
        </Box>

        <Divider sx={{ borderColor: '#2d2d30', my: 3 }} />

        {/* Backup Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: '#cccccc' }}>
              Backups
            </Typography>
            <Button
              size="small"
              variant="contained"
              startIcon={<Backup />}
              onClick={handleCreateBackup}
              disabled={loading}
              sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
            >
              Create Backup
            </Button>
          </Box>

          {backups.length === 0 ? (
            <Box
              sx={{
                p: 3,
                bgcolor: '#1e1e1e',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" sx={{ color: '#858585' }}>
                No backups yet. Create your first backup to protect your data.
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {backups.map((backup) => (
                <ListItem
                  key={backup.id}
                  sx={{
                    bgcolor: '#1e1e1e',
                    borderRadius: 1,
                    mb: 1,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#cccccc', fontWeight: 500 }}>
                        {backup.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#858585' }}>
                        {formatDate(backup.timestamp)} • {formatSize(backup.size)} • {backup.items.length} items
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedBackup(backup.id);
                          setShowRestoreDialog(true);
                        }}
                        sx={{ color: '#007acc' }}
                      >
                        <Restore fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleExportBackup(backup.id)}
                        sx={{ color: '#4caf50' }}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteBackup(backup.id)}
                        sx={{ color: '#f44336' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  {backup.isAutomatic && (
                    <Chip label="Automatic" size="small" sx={{ bgcolor: '#2d2d30', color: '#858585', height: 18 }} />
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>

      {/* Sync Config Dialog */}
      <Dialog open={showSyncConfig} onClose={() => setShowSyncConfig(false)}>
        <DialogTitle sx={{ bgcolor: '#252526', color: '#cccccc' }}>
          Sync Configuration
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1e1e1e', pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: '#858585' }}>Provider</InputLabel>
            <Select
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
              sx={{
                color: '#cccccc',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2d2d30' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007acc' },
              }}
            >
              <MenuItem value="github">GitHub</MenuItem>
              <MenuItem value="gitlab">GitLab</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Access Token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your access token"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#cccccc',
                '& fieldset': { borderColor: '#2d2d30' },
                '&:hover fieldset': { borderColor: '#007acc' },
              },
              '& .MuiInputLabel-root': { color: '#858585' },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#252526' }}>
          <Button onClick={() => setShowSyncConfig(false)} sx={{ color: '#858585' }}>
            Cancel
          </Button>
          <Button onClick={handleConfigureProvider} disabled={!token} sx={{ color: '#007acc' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={showRestoreDialog} onClose={() => setShowRestoreDialog(false)}>
        <DialogTitle sx={{ bgcolor: '#252526', color: '#cccccc' }}>
          Restore Backup
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1e1e1e', pt: 2 }}>
          <Typography variant="body2" sx={{ color: '#cccccc', mb: 2 }}>
            This will restore your settings, workspaces, and extensions from the selected backup.
          </Typography>
          <Alert severity="warning">
            Existing data will be merged with the backup. No data will be lost.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#252526' }}>
          <Button onClick={() => setShowRestoreDialog(false)} sx={{ color: '#858585' }}>
            Cancel
          </Button>
          <Button onClick={handleRestoreBackup} disabled={loading} sx={{ color: '#007acc' }}>
            Restore
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SyncView;
