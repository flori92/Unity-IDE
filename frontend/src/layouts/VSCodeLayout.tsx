/**
 * VS Code-like Layout
 * Architecture inspirée de VS Code pour Unity DevOps IDE
 */

import React, { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import ActivityBar from '../components/vscode/ActivityBar';
import SideBar from '../components/vscode/SideBar';
import EditorArea from '../components/vscode/EditorArea';
import PanelArea from '../components/vscode/PanelArea';
import StatusBar from '../components/vscode/StatusBar';

type ActivityView = 'explorer' | 'search' | 'source-control' | 'docker' | 'kubernetes' | 'ansible' | 'extensions' | 'settings';

export const VSCodeLayout: React.FC = () => {
  const theme = useTheme();
  const [activeView, setActiveView] = useState<ActivityView>('explorer');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [panelVisible, setPanelVisible] = useState(true);
  const [panelHeight, setPanelHeight] = useState(300);

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        bgcolor: '#1e1e1e', // VS Code dark background
        color: '#cccccc',
      }}
    >
      {/* Activity Bar (Left) - 48px */}
      <ActivityBar
        activeView={activeView}
        onViewChange={setActiveView}
        onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
      />

      {/* Side Bar - 300px */}
      {sidebarVisible && (
        <SideBar
          activeView={activeView}
          width={300}
        />
      )}

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Editor Area */}
        <EditorArea
          height={panelVisible ? `calc(100% - ${panelHeight}px - 22px)` : 'calc(100% - 22px)'}
        />

        {/* Panel Area (Terminal, Output, Debug Console) */}
        {panelVisible && (
          <PanelArea
            height={panelHeight}
            onHeightChange={setPanelHeight}
            onClose={() => setPanelVisible(false)}
          />
        )}

        {/* Status Bar - 22px */}
        <StatusBar
          onTogglePanel={() => setPanelVisible(!panelVisible)}
        />
      </Box>
    </Box>
  );
};

export default VSCodeLayout;
