/**
 * VS Code-like Layout
 * Architecture inspirée de VS Code pour Unity DevOps IDE
 * Avec raccourcis clavier globaux (Ctrl+Shift+P, Ctrl+P, Ctrl+B, Ctrl+J)
 */

import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import ActivityBar from '../components/vscode/ActivityBar';
import SideBar from '../components/vscode/SideBar';
import EditorArea from '../components/vscode/EditorArea';
import PanelArea from '../components/vscode/PanelArea';
import StatusBar from '../components/vscode/StatusBar';
import CommandPalette from '../components/vscode/CommandPalette';
import QuickOpen from '../components/vscode/QuickOpen';
import AISidePanel from '../components/vscode/AISidePanel';

type ActivityView = 'explorer' | 'search' | 'source-control' | 'docker' | 'kubernetes' | 'ansible' | 'extensions' | 'settings';

export const VSCodeLayout: React.FC = () => {
  const [activeView, setActiveView] = useState<ActivityView>('explorer');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [panelVisible, setPanelVisible] = useState(true);
  const [panelHeight, setPanelHeight] = useState(300);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showQuickOpen, setShowQuickOpen] = useState(false);
  const [aiPanelVisible, setAiPanelVisible] = useState(false);

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
      
      // Ctrl+Shift+A : Toggle AI Panel
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setAiPanelVisible(!aiPanelVisible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarVisible, panelVisible, aiPanelVisible]);

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
        onViewChange={(view) => setActiveView(view as ActivityView)}
        onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
      />

      {/* Side Bar - 300px */}
      {sidebarVisible && (
        <SideBar
          activeView={activeView}
          width={300}
        />
      )}

      {/* Main Content Area (avec AI Panel à droite) */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Content principal (Editor + Panel) */}
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
              onHeightChange={(h) => setPanelHeight(h)}
            />
          )}

          {/* Status Bar - 22px */}
          <StatusBar
            onTogglePanel={() => setPanelVisible(!panelVisible)}
            onToggleAIPanel={() => setAiPanelVisible(!aiPanelVisible)}
          />
        </Box>

        {/* AI Side Panel (Right) */}
        {aiPanelVisible && (
          <AISidePanel
            width={400}
            onClose={() => setAiPanelVisible(false)}
          />
        )}
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
