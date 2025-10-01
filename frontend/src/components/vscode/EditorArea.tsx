/**
 * Editor Area - Zone d'édition avec Monaco Editor
 * Comme VS Code avec tabs, split view, minimap
 */

import React, { useState, useEffect } from 'react';
import { Box, Tab, Tabs, IconButton } from '@mui/material';
import { Close, MoreHoriz } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useAI } from '../../hooks/useAI';
import { languageCompletionService } from '../../services/language-completion.service';

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
  postgres_data:
`,
      isDirty: false,
    },
  ]);

  const [activeFileId, setActiveFileId] = useState('1');
  const { generateCode } = useAI();

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

  const getAICompletions = async (
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.CompletionContext,
    token: monaco.CancellationToken
  ): Promise<monaco.languages.CompletionList | null> => {
    if (!activeFile || token.isCancellationRequested) {
      return null;
    }

    const word = model.getWordUntilPosition(position);
    const range = new monaco.Range(
      position.lineNumber,
      word.startColumn,
      position.lineNumber,
      position.column
    );

    const currentLine = model.getLineContent(position.lineNumber);
    const contextText = model.getValueInRange({
      startLineNumber: Math.max(1, position.lineNumber - 10),
      endLineNumber: position.lineNumber,
      startColumn: 1,
      endColumn: position.column,
    });

    try {
      // First, get language-specific completions
      const languageSuggestions = languageCompletionService.getCompletions(activeFile.language, contextText, currentLine);

      // Convert to Monaco completion items
      const languageCompletions: monaco.languages.CompletionItem[] = languageSuggestions.map(suggestion => ({
        label: suggestion.label,
        kind: suggestion.kind === 'keyword' ? monaco.languages.CompletionItemKind.Keyword :
             suggestion.kind === 'function' ? monaco.languages.CompletionItemKind.Function :
             suggestion.kind === 'type' ? monaco.languages.CompletionItemKind.Class :
             suggestion.kind === 'variable' ? monaco.languages.CompletionItemKind.Variable :
             suggestion.kind === 'property' ? monaco.languages.CompletionItemKind.Property :
             monaco.languages.CompletionItemKind.Text,
        insertText: suggestion.insertText,
        range: range,
        documentation: suggestion.documentation,
        sortText: '1', // Higher priority than AI suggestions
      }));

      // Try to get AI completions
      let codeType: 'dockerfile' | 'kubernetes' | 'ansible' | 'script' = 'script';
      if (activeFile.language === 'yaml' && contextText.includes('services:')) {
        codeType = 'dockerfile';
      } else if (activeFile.language === 'yaml' && contextText.includes('apiVersion:')) {
        codeType = 'kubernetes';
      } else if (activeFile.language === 'yaml' && contextText.includes('hosts:')) {
        codeType = 'ansible';
      }

      const aiResponse = await generateCode(codeType, contextText, { language: activeFile.language });

      if (aiResponse && aiResponse.length > 0) {
        const aiCompletion: monaco.languages.CompletionItem = {
          label: 'AI Suggestion',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: aiResponse.trim(),
          range: range,
          documentation: {
            value: 'AI-generated completion based on context',
            isTrusted: true,
          },
          sortText: '0',
          preselect: true,
        };

        return { suggestions: [...languageCompletions, aiCompletion] };
      }

      // Return language completions if no AI response
      if (languageCompletions.length > 0) {
        return { suggestions: languageCompletions };
      }
    } catch (error) {
      console.error('AI completion error:', error);
      // Fall back to language completions
      const languageSuggestions = languageCompletionService.getCompletions(activeFile.language, contextText, currentLine);
      const languageCompletions: monaco.languages.CompletionItem[] = languageSuggestions.map(suggestion => ({
        label: suggestion.label,
        kind: suggestion.kind === 'keyword' ? monaco.languages.CompletionItemKind.Keyword :
             suggestion.kind === 'function' ? monaco.languages.CompletionItemKind.Function :
             suggestion.kind === 'type' ? monaco.languages.CompletionItemKind.Class :
             suggestion.kind === 'variable' ? monaco.languages.CompletionItemKind.Variable :
             suggestion.kind === 'property' ? monaco.languages.CompletionItemKind.Property :
             monaco.languages.CompletionItemKind.Text,
        insertText: suggestion.insertText,
        range: range,
        documentation: suggestion.documentation,
        sortText: '1',
      }));

      if (languageCompletions.length > 0) {
        return { suggestions: languageCompletions };
      }
    }

    return null;
  };

  // Register AI completion provider when Monaco loads
  useEffect(() => {
    if (activeFile) {
      // Wait for Monaco to be available
      import('monaco-editor').then((monaco) => {
        const disposable = monaco.languages.registerCompletionItemProvider(activeFile.language, {
          provideCompletionItems: getAICompletions,
          triggerCharacters: [' ', '\n', '\t', '.', ':', '-', '_'],
        });

        // Cleanup on unmount or language change
        return () => disposable.dispose();
      });
    }
  }, [activeFile?.language]);

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
