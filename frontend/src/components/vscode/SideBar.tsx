/**
 * Side Bar - Barre latérale VS Code
 * Affiche le contenu selon la vue active
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import ExplorerView from './views/ExplorerView';
import DockerView from './views/DockerView';
import KubernetesView from './views/KubernetesView';
import AnsibleView from './views/AnsibleView';
import SourceControlView from './views/SourceControlView';
import ExtensionsView from './views/ExtensionsView';
import SettingsView from './views/SettingsView';
import AIChatView from './views/AIChatView';

interface SideBarProps {
  activeView: string;
  width: number;
}
export const SideBar: React.FC<SideBarProps> = ({ activeView, width }) => {
  const renderView = () => {
    switch (activeView) {
      case 'explorer':
        return <ExplorerView />;
      case 'search':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Search functionality coming soon...
            </Typography>
          </Box>
        );
      case 'source-control':
        return <SourceControlView />;
      case 'docker':
        return <DockerView />;
      case 'kubernetes':
        return <KubernetesView />;
      case 'ansible':
        return <AnsibleView />;
      case 'extensions':
        return <ExtensionsView />;
      case 'ai-chat':
        return <AIChatView />;
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    const titles: Record<string, string> = {
      explorer: 'EXPLORER',
      search: 'SEARCH',
      'source-control': 'SOURCE CONTROL',
      docker: 'DOCKER',
      kubernetes: 'KUBERNETES',
      ansible: 'ANSIBLE',
      extensions: 'EXTENSIONS',
      'ai-chat': 'AI COPILOT',
      settings: 'SETTINGS',
    };
    return titles[activeView] || 'UNITY DEVOPS IDE';
  };

  return (
    <Box
      sx={{
        width,
        height: '100%',
        bgcolor: '#252526',
        borderRight: '1px solid #2d2d30',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          height: 35,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #2d2d30',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: '#cccccc',
            fontWeight: 600,
            letterSpacing: '0.5px',
            fontSize: '11px',
          }}
        >
          {getTitle()}
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '10px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#252526',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#424242',
            borderRadius: '5px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#4e4e4e',
          },
        }}
      >
        {renderView()}
      </Box>
    </Box>
  );
};

export default SideBar;
