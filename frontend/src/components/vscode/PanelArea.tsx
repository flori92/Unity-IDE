/**
 * Panel Area - Panel inférieur avec Terminal, Output, Debug
 * Comme VS Code avec tabs et redimensionnement
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, Tab, Tabs, IconButton } from '@mui/material';
import { Close, ExpandMore, ExpandLess } from '@mui/icons-material';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface PanelAreaProps {
  height: number;
  onHeightChange: (height: number) => void;
  onClose: () => void;
}

export const PanelArea: React.FC<PanelAreaProps> = ({
  height,
  onHeightChange,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('terminal');
  const [isResizing, setIsResizing] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);

  // Initialize terminal
  useEffect(() => {
    if (terminalRef.current && !terminalInstance.current) {
      const term = new Terminal({
        theme: {
          background: '#1e1e1e',
          foreground: '#cccccc',
          cursor: '#ffffff',
          black: '#000000',
          red: '#cd3131',
          green: '#0dbc79',
          yellow: '#e5e510',
          blue: '#2472c8',
          magenta: '#bc3fbc',
          cyan: '#11a8cd',
          white: '#e5e5e5',
          brightBlack: '#666666',
          brightRed: '#f14c4c',
          brightGreen: '#23d18b',
          brightYellow: '#f5f543',
          brightBlue: '#3b8eea',
          brightMagenta: '#d670d6',
          brightCyan: '#29b8db',
          brightWhite: '#e5e5e5',
        },
        fontSize: 14,
        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
        cursorBlink: true,
        cursorStyle: 'block',
      });

      fitAddon.current = new FitAddon();
      term.loadAddon(fitAddon.current);
      term.open(terminalRef.current);
      fitAddon.current.fit();

      // Welcome message
      term.writeln('Unity DevOps IDE Terminal');
      term.writeln('Type "help" for available commands\r\n');
      term.write('$ ');

      // Handle input
      let currentLine = '';
      term.onData((data) => {
        if (data === '\r') {
          // Enter key
          term.write('\r\n');
          if (currentLine.trim()) {
            handleCommand(currentLine.trim(), term);
          }
          currentLine = '';
          term.write('$ ');
        } else if (data === '\x7f') {
          // Backspace
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1);
            term.write('\b \b');
          }
        } else if (data === '\x03') {
          // Ctrl+C
          term.write('^C\r\n$ ');
          currentLine = '';
        } else {
          currentLine += data;
          term.write(data);
        }
      });

      terminalInstance.current = term;

      // Resize on window resize
      const handleResize = () => {
        if (fitAddon.current) {
          fitAddon.current.fit();
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        term.dispose();
      };
    }
  }, []);

  const handleCommand = (command: string, term: Terminal) => {
    const cmd = command.toLowerCase();
    
    if (cmd === 'help') {
      term.writeln('Available commands:');
      term.writeln('  help     - Show this help message');
      term.writeln('  clear    - Clear the terminal');
      term.writeln('  docker   - Docker commands');
      term.writeln('  kubectl  - Kubernetes commands');
      term.writeln('  ansible  - Ansible commands');
    } else if (cmd === 'clear') {
      term.clear();
    } else if (cmd.startsWith('docker')) {
      term.writeln('Docker integration coming soon...');
    } else if (cmd.startsWith('kubectl')) {
      term.writeln('Kubernetes integration coming soon...');
    } else if (cmd.startsWith('ansible')) {
      term.writeln('Ansible integration coming soon...');
    } else {
      term.writeln(`Command not found: ${command}`);
    }
  };

  // Handle resize
  const handleMouseDown = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newHeight = window.innerHeight - e.clientY - 22; // 22px for status bar
        if (newHeight >= 100 && newHeight <= 600) {
          onHeightChange(newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onHeightChange]);

  return (
    <Box
      sx={{
        height,
        bgcolor: '#1e1e1e',
        borderTop: '1px solid #2d2d30',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Resize Handle */}
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          height: 4,
          cursor: 'ns-resize',
          bgcolor: isResizing ? '#007acc' : 'transparent',
          '&:hover': {
            bgcolor: '#007acc',
          },
          transition: 'background-color 0.1s',
        }}
      />

      {/* Tabs */}
      <Box
        sx={{
          height: 35,
          bgcolor: '#252526',
          borderBottom: '1px solid #2d2d30',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            minHeight: 35,
            height: 35,
            '& .MuiTabs-indicator': {
              backgroundColor: '#007acc',
              height: 2,
            },
            '& .MuiTab-root': {
              minHeight: 35,
              height: 35,
              textTransform: 'none',
              color: '#969696',
              fontSize: '13px',
              padding: '0 16px',
              minWidth: 'auto',
              '&.Mui-selected': {
                color: '#ffffff',
              },
            },
          }}
        >
          <Tab value="terminal" label="TERMINAL" />
          <Tab value="output" label="OUTPUT" />
          <Tab value="debug" label="DEBUG CONSOLE" />
          <Tab value="problems" label="PROBLEMS" />
        </Tabs>

        <Box sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
          <IconButton
            size="small"
            onClick={() => onHeightChange(height === 300 ? 150 : 300)}
            sx={{ color: '#858585' }}
          >
            {height > 200 ? <ExpandMore fontSize="small" /> : <ExpandLess fontSize="small" />}
          </IconButton>
          <IconButton size="small" onClick={onClose} sx={{ color: '#858585' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'terminal' && (
          <Box
            ref={terminalRef}
            sx={{
              height: '100%',
              padding: '4px',
            }}
          />
        )}
        {activeTab === 'output' && (
          <Box sx={{ p: 2, color: '#cccccc', fontFamily: 'monospace', fontSize: '13px' }}>
            [Unity DevOps IDE] Output console
          </Box>
        )}
        {activeTab === 'debug' && (
          <Box sx={{ p: 2, color: '#cccccc', fontFamily: 'monospace', fontSize: '13px' }}>
            Debug console ready
          </Box>
        )}
        {activeTab === 'problems' && (
          <Box sx={{ p: 2, color: '#cccccc', fontSize: '13px' }}>
            No problems detected
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PanelArea;
