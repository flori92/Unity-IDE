/**
 * Activity Bar - Barre d'activité VS Code
 * Icônes verticales à gauche
 */

import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import {
  FolderOpen,
  Search,
  SourceOutlined,
  Extension,
  Settings,
  Terminal,
} from '@mui/icons-material';

// Icônes personnalisées pour DevOps
const DockerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185"/>
  </svg>
);

const KubernetesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10.204 14.35l.007.01-.999 2.413a5.171 5.171 0 0 1-2.075-2.597l2.578-.437.004.005a.44.44 0 0 1 .484.606zm-.833-2.129a.44.44 0 0 0 .173-.756l.002-.011L7.585 9.7a5.143 5.143 0 0 0-.73 3.255l2.514-.725.002-.009zm1.145-1.98a.44.44 0 0 0 .699-.337l.01-.005.15-2.62a5.144 5.144 0 0 0-3.01 1.442l2.147 1.523.004-.002zm.76 2.75l.723.349.722-.347.18-.78-.5-.623h-.804l-.5.623.179.779zm1.5-3.095a.44.44 0 0 0 .7.336l.008.003 2.134-1.513a5.188 5.188 0 0 0-2.992-1.442l.148 2.615.002.001zm10.876 5.97l-5.773 7.181a1.6 1.6 0 0 1-1.248.594l-9.261.003a1.6 1.6 0 0 1-1.247-.596L.35 16.866a1.6 1.6 0 0 1-.1-1.763L4.145 8.63a1.6 1.6 0 0 1 1.353-.76l9.262-.003a1.6 1.6 0 0 1 1.352.76l3.895 6.475a1.6 1.6 0 0 1-.1 1.763z"/>
  </svg>
);

const AIIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const CollabIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const SyncIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
  </svg>
);

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onToggleSidebar: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  onViewChange,
}) => {
  const activities = [
    { id: 'explorer', icon: <FolderOpen />, label: 'Explorer' },
    { id: 'search', icon: <Search />, label: 'Search' },
    { id: 'source-control', icon: <SourceOutlined />, label: 'Source Control' },
    { id: 'docker', icon: <DockerIcon />, label: 'Docker' },
    { id: 'kubernetes', icon: <KubernetesIcon />, label: 'Kubernetes' },
    { id: 'ansible', icon: <Terminal />, label: 'Ansible' },
    { id: 'collaboration', icon: <CollabIcon />, label: 'Collaboration' },
    { id: 'ai-chat', icon: <AIIcon />, label: 'AI Copilot' },
    { id: 'sync', icon: <SyncIcon />, label: 'Sync & Backup' },
    { id: 'extensions', icon: <Extension />, label: 'Extensions' },
  ];

  return (
    <Box
      sx={{
        width: 48,
        height: '100%',
        bgcolor: '#333333',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 1,
        borderRight: '1px solid #2d2d30',
      }}
    >
      {/* Main Activities */}
      <Box sx={{ flex: 1 }}>
        {activities.map((activity) => (
          <Tooltip key={activity.id} title={activity.label} placement="right">
            <IconButton
              onClick={() => onViewChange(activity.id)}
              sx={{
                width: 48,
                height: 48,
                borderRadius: 0,
                color: activeView === activity.id ? '#ffffff' : '#858585',
                borderLeft: activeView === activity.id ? '2px solid #007acc' : '2px solid transparent',
                '&:hover': {
                  color: '#ffffff',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {activity.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>

      {/* Bottom Settings */}
      <Tooltip title="Settings" placement="right">
        <IconButton
          onClick={() => onViewChange('settings')}
          sx={{
            width: 48,
            height: 48,
            borderRadius: 0,
            color: activeView === 'settings' ? '#ffffff' : '#858585',
            '&:hover': {
              color: '#ffffff',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Settings />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ActivityBar;
