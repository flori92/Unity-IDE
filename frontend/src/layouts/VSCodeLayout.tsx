/**
 * VS Code-like Layout
 * Architecture inspirée de VS Code pour Unity DevOps IDE
 * Avec raccourcis clavier globaux (Ctrl+Shift+P, Ctrl+P, Ctrl+B, Ctrl+J)
 */

import React, { useState, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import ActivityBar from '../components/vscode/ActivityBar';
import SideBar from '../components/vscode/SideBar';
import EditorArea from '../components/vscode/EditorArea';
import PanelArea from '../components/vscode/PanelArea';
import StatusBar from '../components/vscode/StatusBar';
import CommandPalette from '../components/vscode/CommandPalette';
import QuickOpen from '../components/vscode/QuickOpen';

type ActivityView = 'explorer' | 'search' | 'source-control' | 'docker' | 'kubernetes' | 'ansible' | 'extensions' | 'settings';

export const VSCodeLayout: React.FC = () => {
  const theme = useTheme();
  const [activeView, setActiveView] = useState<ActivityView>('explorer');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [panelVisible, setPanelVisible] = useState(true);
  const [panelHeight, setPanelHeight] = useState(300);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showQuickOpen, setShowQuickOpen] = useState(false);

  // Raccourcis clavier globaux
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+P : Command Palette
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      
      // Ctrl+P : Quick Open
      if (e.ctrlKey && e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        setShowQuickOpen(true);
      }
      
      // Ctrl+B : Toggle Sidebar
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setSidebarVisible(!sidebarVisible);
      }
      
      // Ctrl+J : Toggle Panel
      if (e.ctrlKey && e.key === 'j') {
        e.preventDefault();
        setPanelVisible(!panelVisible);
      }
      
      // Ctrl+` : Toggle Terminal (same as Ctrl+J)
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setPanelVisible(!panelVisible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarVisible, panelVisible]);

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
            onClose={() => setPanelVisible(false)}
          />
        )}

        {/* Status Bar - 22px */}
      <StatusBar
        onTogglePanel={() => setPanelVisible(!panelVisible)}
      />
    </Box>

    {/* Command Palette (Ctrl+Shift+P) */}
    <CommandPalette
      open={showCommandPalette}
      onClose={() => setShowCommandPalette(false)}
    />

    {/* Quick Open (Ctrl+P) */}
    <QuickOpen
      open={showQuickOpen}
      onClose={() => setShowQuickOpen(false)}
      onSelect={(item) => {
        console.log('Opening file:', item.path);
        // TODO: Ouvrir le fichier dans l'éditeur
      }}
    />
  </Box>
  );
};

export default VSCodeLayout;
