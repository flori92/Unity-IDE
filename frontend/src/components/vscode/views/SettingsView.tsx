/**
 * Settings View - Vue Paramètres style VS Code
 */

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { useSettings } from '../../../hooks/useSettings';
import { useSnackbar } from 'notistack';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetSettings, exportSettings, importSettings } = useSettings();
  const { enqueueSnackbar } = useSnackbar();

  const handleExport = () => {
    const json = exportSettings();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unity-ide-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    enqueueSnackbar('Settings exported', { variant: 'success' });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const json = event.target?.result as string;
          const success = importSettings(json);
          if (success) {
            enqueueSnackbar('Settings imported', { variant: 'success' });
          } else {
            enqueueSnackbar('Failed to import settings', { variant: 'error' });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <Box sx={{ p: 3, color: '#cccccc', maxWidth: 800 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Settings
      </Typography>

      {/* Appearance */}
      <Typography variant="h6" sx={{ mb: 2, fontSize: '16px' }}>
        Appearance
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Theme
        </Typography>
        <Select
          value={settings.theme}
          onChange={(e) => updateSettings({ theme: e.target.value as any })}
          size="small"
          sx={{ minWidth: 200, bgcolor: '#1e1e1e', color: '#cccccc' }}
        >
          <MenuItem value="dark">Dark</MenuItem>
          <MenuItem value="light">Light</MenuItem>
          <MenuItem value="high-contrast">High Contrast</MenuItem>
        </Select>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Font Size
        </Typography>
        <TextField
          type="number"
          value={settings.fontSize}
          onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
          size="small"
          sx={{ width: 100, '& input': { color: '#cccccc' } }}
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={settings.minimap}
            onChange={(e) => updateSettings({ minimap: e.target.checked })}
          />
        }
        label="Show Minimap"
        sx={{ mb: 2 }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={settings.lineNumbers}
            onChange={(e) => updateSettings({ lineNumbers: e.target.checked })}
          />
        }
        label="Show Line Numbers"
        sx={{ mb: 2 }}
      />

      <Divider sx={{ my: 3, borderColor: '#2d2d30' }} />

      {/* Editor */}
      <Typography variant="h6" sx={{ mb: 2, fontSize: '16px' }}>
        Editor
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Tab Size
        </Typography>
        <TextField
          type="number"
          value={settings.tabSize}
          onChange={(e) => updateSettings({ tabSize: parseInt(e.target.value) })}
          size="small"
          sx={{ width: 100, '& input': { color: '#cccccc' } }}
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={settings.autoSave}
            onChange={(e) => updateSettings({ autoSave: e.target.checked })}
          />
        }
        label="Auto Save"
        sx={{ mb: 2 }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={settings.wordWrap}
            onChange={(e) => updateSettings({ wordWrap: e.target.checked })}
          />
        }
        label="Word Wrap"
        sx={{ mb: 2 }}
      />

      <Divider sx={{ my: 3, borderColor: '#2d2d30' }} />

      {/* Docker */}
      <Typography variant="h6" sx={{ mb: 2, fontSize: '16px' }}>
        Docker
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Socket Path
        </Typography>
        <TextField
          value={settings.docker.socketPath}
          onChange={(e) => updateSettings({ docker: { ...settings.docker, socketPath: e.target.value } })}
          size="small"
          fullWidth
          sx={{ '& input': { color: '#cccccc' } }}
        />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={settings.docker.autoStart}
            onChange={(e) => updateSettings({ docker: { ...settings.docker, autoStart: e.target.checked } })}
          />
        }
        label="Auto Start Docker"
        sx={{ mb: 2 }}
      />

      <Divider sx={{ my: 3, borderColor: '#2d2d30' }} />

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button variant="contained" onClick={handleExport} sx={{ bgcolor: '#007acc' }}>
          Export Settings
        </Button>
        <Button variant="outlined" onClick={handleImport} sx={{ borderColor: '#007acc', color: '#007acc' }}>
          Import Settings
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            if (confirm('Reset all settings to default?')) {
              resetSettings();
              enqueueSnackbar('Settings reset', { variant: 'success' });
            }
          }}
          sx={{ borderColor: '#f48771', color: '#f48771' }}
        >
          Reset to Default
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsView;
