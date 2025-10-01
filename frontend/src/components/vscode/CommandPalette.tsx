/**
 * Command Palette - Palette de commandes VS Code
 * Ctrl+Shift+P pour ouvrir
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, List, ListItem, ListItemText, Typography, Chip } from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  Delete,
  Settings,
  Search,
  FolderOpen,
} from '@mui/icons-material';

interface Command {
  id: string;
  label: string;
  description?: string;
  category: string;
  icon?: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands?: Command[];
}

const defaultCommands: Command[] = [
  {
    id: 'docker.containers.list',
    label: 'Docker: List Containers',
    description: 'Show all Docker containers',
    category: 'Docker',
    icon: <FolderOpen fontSize="small" />,
    action: () => console.log('List containers'),
    keywords: ['docker', 'container', 'list'],
  },
  {
    id: 'docker.containers.start',
    label: 'Docker: Start Container',
    description: 'Start a stopped container',
    category: 'Docker',
    icon: <PlayArrow fontSize="small" />,
    action: () => console.log('Start container'),
    keywords: ['docker', 'container', 'start', 'run'],
  },
  {
    id: 'docker.containers.stop',
    label: 'Docker: Stop Container',
    description: 'Stop a running container',
    category: 'Docker',
    icon: <Stop fontSize="small" />,
    action: () => console.log('Stop container'),
    keywords: ['docker', 'container', 'stop'],
  },
  {
    id: 'docker.containers.remove',
    label: 'Docker: Remove Container',
    description: 'Remove a container',
    category: 'Docker',
    icon: <Delete fontSize="small" />,
    action: () => console.log('Remove container'),
    keywords: ['docker', 'container', 'remove', 'delete'],
  },
  {
    id: 'k8s.pods.list',
    label: 'Kubernetes: List Pods',
    description: 'Show all pods in current namespace',
    category: 'Kubernetes',
    icon: <FolderOpen fontSize="small" />,
    action: () => console.log('List pods'),
    keywords: ['kubernetes', 'k8s', 'pod', 'list'],
  },
  {
    id: 'k8s.deployments.scale',
    label: 'Kubernetes: Scale Deployment',
    description: 'Scale a deployment',
    category: 'Kubernetes',
    icon: <Settings fontSize="small" />,
    action: () => console.log('Scale deployment'),
    keywords: ['kubernetes', 'k8s', 'deployment', 'scale'],
  },
  {
    id: 'k8s.pods.delete',
    label: 'Kubernetes: Delete Pod',
    description: 'Delete a pod',
    category: 'Kubernetes',
    icon: <Delete fontSize="small" />,
    action: () => console.log('Delete pod'),
    keywords: ['kubernetes', 'k8s', 'pod', 'delete', 'remove'],
  },
  {
    id: 'ansible.playbooks.run',
    label: 'Ansible: Run Playbook',
    description: 'Execute an Ansible playbook',
    category: 'Ansible',
    icon: <PlayArrow fontSize="small" />,
    action: () => console.log('Run playbook'),
    keywords: ['ansible', 'playbook', 'run', 'execute'],
  },
  {
    id: 'view.refresh',
    label: 'View: Refresh',
    description: 'Refresh current view',
    category: 'View',
    icon: <Refresh fontSize="small" />,
    action: () => console.log('Refresh view'),
    keywords: ['view', 'refresh', 'reload'],
  },
  {
    id: 'search.files',
    label: 'Search: Find in Files',
    description: 'Search for text in files',
    category: 'Search',
    icon: <Search fontSize="small" />,
    action: () => console.log('Search files'),
    keywords: ['search', 'find', 'files'],
  },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  commands = defaultCommands,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter commands based on query
  const filteredCommands = query
    ? commands.filter((cmd) => {
        const searchText = query.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(searchText) ||
          cmd.description?.toLowerCase().includes(searchText) ||
          cmd.category.toLowerCase().includes(searchText) ||
          cmd.keywords?.some((k) => k.toLowerCase().includes(searchText))
        );
      })
    : commands;

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, filteredCommands, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const executeCommand = (command: Command) => {
    command.action();
    onClose();
    setQuery('');
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <Box
        onClick={onClose}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
        }}
      />

      {/* Command Palette */}
      <Box
        sx={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          maxWidth: '90vw',
          maxHeight: '60vh',
          bgcolor: '#252526',
          border: '1px solid #2d2d30',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Search Input */}
        <Box sx={{ p: 1, borderBottom: '1px solid #2d2d30' }}>
          <TextField
            ref={inputRef}
            fullWidth
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#cccccc',
                fontSize: '14px',
                bgcolor: '#1e1e1e',
                '& fieldset': {
                  border: 'none',
                },
              },
              '& .MuiOutlinedInput-input': {
                padding: '10px 12px',
              },
            }}
          />
        </Box>

        {/* Commands List */}
        <Box
          ref={listRef}
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
          }}
        >
          {filteredCommands.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: '#858585' }}>
              <Typography variant="body2">No commands found</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredCommands.map((command, index) => (
                <ListItem
                  key={command.id}
                  onClick={() => executeCommand(command)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: index === selectedIndex ? '#094771' : 'transparent',
                    borderLeft: index === selectedIndex ? '2px solid #007acc' : '2px solid transparent',
                    '&:hover': {
                      bgcolor: index === selectedIndex ? '#094771' : 'rgba(255, 255, 255, 0.05)',
                    },
                    py: 1.5,
                    px: 2,
                  }}
                >
                  {command.icon && (
                    <Box sx={{ mr: 2, color: '#858585', display: 'flex', alignItems: 'center' }}>
                      {command.icon}
                    </Box>
                  )}
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: '#cccccc', fontSize: '14px' }}>
                          {command.label}
                        </Typography>
                        <Chip
                          label={command.category}
                          size="small"
                          sx={{
                            height: '18px',
                            fontSize: '10px',
                            bgcolor: '#007acc',
                            color: '#ffffff',
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      command.description && (
                        <Typography variant="caption" sx={{ color: '#858585', fontSize: '12px' }}>
                          {command.description}
                        </Typography>
                      )
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: 2,
            py: 1,
            borderTop: '1px solid #2d2d30',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#858585',
          }}
        >
          <span>{filteredCommands.length} commands</span>
          <span>↑↓ Navigate • Enter Execute • Esc Close</span>
        </Box>
      </Box>
    </>
  );
};

export default CommandPalette;
