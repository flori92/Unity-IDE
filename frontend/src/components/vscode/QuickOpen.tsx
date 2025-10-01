/**
 * Quick Open - Ouverture rapide de fichiers VS Code
 * Ctrl+P pour ouvrir
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, List, ListItem, ListItemText, Typography } from '@mui/material';
import {
  InsertDriveFile,
  Folder,
  Description,
  Code,
  Image,
} from '@mui/icons-material';

interface QuickOpenItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  extension?: string;
}

interface QuickOpenProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (item: QuickOpenItem) => void;
  items?: QuickOpenItem[];
}

const mockItems: QuickOpenItem[] = [
  { id: '1', name: 'App.tsx', path: 'src/App.tsx', type: 'file', extension: 'tsx' },
  { id: '2', name: 'main.go', path: 'backend/cmd/server/main.go', type: 'file', extension: 'go' },
  { id: '3', name: 'docker-compose.yml', path: 'docker-compose.yml', type: 'file', extension: 'yml' },
  { id: '4', name: 'Dockerfile', path: 'Dockerfile', type: 'file' },
  { id: '5', name: 'package.json', path: 'package.json', type: 'file', extension: 'json' },
  { id: '6', name: 'README.md', path: 'README.md', type: 'file', extension: 'md' },
  { id: '7', name: 'VSCodeLayout.tsx', path: 'src/layouts/VSCodeLayout.tsx', type: 'file', extension: 'tsx' },
  { id: '8', name: 'DockerView.tsx', path: 'src/components/vscode/views/DockerView.tsx', type: 'file', extension: 'tsx' },
  { id: '9', name: 'KubernetesView.tsx', path: 'src/components/vscode/views/KubernetesView.tsx', type: 'file', extension: 'tsx' },
  { id: '10', name: 'api.service.ts', path: 'src/services/api.service.ts', type: 'file', extension: 'ts' },
  { id: '11', name: 'websocket.service.ts', path: 'src/services/websocket.service.ts', type: 'file', extension: 'ts' },
  { id: '12', name: 'useDocker.ts', path: 'src/hooks/useDocker.ts', type: 'file', extension: 'ts' },
  { id: '13', name: 'useKubernetes.ts', path: 'src/hooks/useKubernetes.ts', type: 'file', extension: 'ts' },
];

const getFileIcon = (extension?: string) => {
  switch (extension) {
    case 'tsx':
    case 'ts':
    case 'js':
    case 'jsx':
      return <Code fontSize="small" sx={{ color: '#519aba' }} />;
    case 'md':
      return <Description fontSize="small" sx={{ color: '#519aba' }} />;
    case 'json':
    case 'yml':
    case 'yaml':
      return <Description fontSize="small" sx={{ color: '#cbcb41' }} />;
    case 'png':
    case 'jpg':
    case 'svg':
      return <Image fontSize="small" sx={{ color: '#a074c4' }} />;
    case 'go':
      return <Code fontSize="small" sx={{ color: '#00add8' }} />;
    default:
      return <InsertDriveFile fontSize="small" sx={{ color: '#858585' }} />;
  }
};

export const QuickOpen: React.FC<QuickOpenProps> = ({
  open,
  onClose,
  onSelect,
  items = mockItems,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fuzzy search
  const fuzzyMatch = (str: string, pattern: string): boolean => {
    const patternLower = pattern.toLowerCase();
    const strLower = str.toLowerCase();
    
    let patternIdx = 0;
    let strIdx = 0;
    
    while (patternIdx < patternLower.length && strIdx < strLower.length) {
      if (patternLower[patternIdx] === strLower[strIdx]) {
        patternIdx++;
      }
      strIdx++;
    }
    
    return patternIdx === patternLower.length;
  };

  // Filter items based on query
  const filteredItems = query
    ? items.filter((item) => fuzzyMatch(item.name, query) || fuzzyMatch(item.path, query))
    : items;

  // Reset selection when filtered items change
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
          setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            handleSelect(filteredItems[selectedIndex]);
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
  }, [open, selectedIndex, filteredItems, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (item: QuickOpenItem) => {
    if (onSelect) {
      onSelect(item);
    }
    onClose();
    setQuery('');
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const parts: { text: string; highlight: boolean }[] = [];
    let lastIndex = 0;
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    for (let i = 0; i < query.length; i++) {
      const char = queryLower[i];
      const index = textLower.indexOf(char, lastIndex);
      
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push({ text: text.substring(lastIndex, index), highlight: false });
        }
        parts.push({ text: text[index], highlight: true });
        lastIndex = index + 1;
      }
    }

    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex), highlight: false });
    }

    return (
      <>
        {parts.map((part, index) => (
          <span
            key={index}
            style={{
              color: part.highlight ? '#4ec9b0' : 'inherit',
              fontWeight: part.highlight ? 600 : 'normal',
            }}
          >
            {part.text}
          </span>
        ))}
      </>
    );
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

      {/* Quick Open */}
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
            placeholder="Search files by name..."
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

        {/* Files List */}
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
          {filteredItems.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: '#858585' }}>
              <Typography variant="body2">No files found</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredItems.map((item, index) => (
                <ListItem
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: index === selectedIndex ? '#094771' : 'transparent',
                    borderLeft: index === selectedIndex ? '2px solid #007acc' : '2px solid transparent',
                    '&:hover': {
                      bgcolor: index === selectedIndex ? '#094771' : 'rgba(255, 255, 255, 0.05)',
                    },
                    py: 1,
                    px: 2,
                  }}
                >
                  <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                    {item.type === 'folder' ? (
                      <Folder fontSize="small" sx={{ color: '#dcb67a' }} />
                    ) : (
                      getFileIcon(item.extension)
                    )}
                  </Box>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ color: '#cccccc', fontSize: '14px' }}>
                        {highlightMatch(item.name, query)}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: '#858585', fontSize: '12px' }}>
                        {highlightMatch(item.path, query)}
                      </Typography>
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
          <span>{filteredItems.length} files</span>
          <span>↑↓ Navigate • Enter Open • Esc Close</span>
        </Box>
      </Box>
    </>
  );
};

export default QuickOpen;
