/**
 * Editor Area - Zone d'édition avec Monaco Editor
 * Comme VS Code avec tabs, split view, minimap
 */

import React, { useState, useRef } from 'react';
import { Box, Tab, Tabs, IconButton, Button, Paper, Typography } from '@mui/material';
import { Close, MoreHoriz, Lightbulb } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useAI } from '../../hooks/useAI';

interface EditorFile {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  isDirty: boolean;
}

interface EditorAreaProps {
  height: string;
}

export const EditorArea: React.FC<EditorAreaProps> = ({ height }) => {
  const [openFiles, setOpenFiles] = useState<EditorFile[]>([
    {
      id: '1',
      name: 'docker-compose.yml',
      path: '/workspace/docker-compose.yml',
      language: 'yaml',
      content: `version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: example
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:`,
      isDirty: false,
    },
  ]);

  const [activeFileId, setActiveFileId] = useState('1');
  const [selectedCode, setSelectedCode] = useState<string>('');
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { explainCode } = useAI();

  const activeFile = openFiles.find(f => f.id === activeFileId);

  const handleCloseFile = (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenFiles(openFiles.filter(f => f.id !== fileId));
    if (activeFileId === fileId && openFiles.length > 1) {
      const index = openFiles.findIndex(f => f.id === fileId);
      const nextFile = openFiles[index + 1] || openFiles[index - 1];
      setActiveFileId(nextFile.id);
    }
  };

  const handleExplainCode = async () => {
    if (!selectedCode || !editorRef.current) return;

    try {
      const explanation = await explainCode(selectedCode, activeFile?.language);
      // Pour l'instant, afficher dans console - TODO: modal/popup
      console.log('Code explanation:', explanation);
      alert(`Explanation: ${explanation}`);
    } catch (error) {
      console.error('Failed to explain code:', error);
      alert('Erreur lors de l\'explication du code');
    }
  };

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // Écouter les changements de sélection
    editor.onDidChangeCursorSelection((e) => {
      const selection = editor.getSelection();
      if (selection && !selection.isEmpty()) {
        const selectedText = editor.getModel()?.getValueInRange(selection) || '';
        setSelectedCode(selectedText);
      } else {
        setSelectedCode('');
      }
    });
  };

  return (
    <Box
      sx={{
        height,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1e1e1e',
        overflow: 'hidden',
      }}
    >
      {/* Tabs Bar */}
      <Box
        sx={{
          height: 35,
          bgcolor: '#252526',
          borderBottom: '1px solid #2d2d30',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={activeFileId}
          onChange={(_, newValue) => setActiveFileId(newValue)}
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
              padding: '0 12px',
              minWidth: 'auto',
              '&.Mui-selected': {
                color: '#ffffff',
                bgcolor: '#1e1e1e',
              },
              '&:hover': {
                color: '#ffffff',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
              },
            },
          }}
        >
          {openFiles.map((file) => (
            <Tab
              key={file.id}
              value={file.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{file.name}</span>
                  {file.isDirty && <span style={{ fontSize: '16px' }}>●</span>}
                  <IconButton
                    size="small"
                    onClick={(e) => handleCloseFile(file.id, e)}
                    sx={{
                      padding: 0,
                      width: 16,
                      height: 16,
                      color: 'inherit',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              }
            />
          ))}
        </Tabs>

        {/* AI Tools */}
        {selectedCode && (
          <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<Lightbulb sx={{ fontSize: 16 }} />}
              onClick={handleExplainCode}
              sx={{
                color: '#007acc',
                fontSize: '12px',
                textTransform: 'none',
                bgcolor: 'rgba(0, 122, 204, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(0, 122, 204, 0.2)',
                },
              }}
            >
              Explain Code
            </Button>
          </Box>
        )}

        {/* More Options */}
        <Box sx={{ ml: 'auto', mr: 1 }}>
          <IconButton size="small" sx={{ color: '#858585' }}>
            <MoreHoriz fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Editor */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {activeFile ? (
          <Editor
            height="100%"
            language={activeFile.language}
            value={activeFile.content}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
              fontLigatures: true,
              lineNumbers: 'on',
              rulers: [80, 120],
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: 'on',
              renderWhitespace: 'selection',
              bracketPairColorization: {
                enabled: true,
              },
            }}
            onMount={handleEditorDidMount}
            onChange={(value) => {
              // Handle content change
              console.log('Content changed:', value);
            }}
          />
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#858585',
            }}
          >
            No file open
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EditorArea;
