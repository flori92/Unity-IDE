/**
 * AI Side Panel - Panneau latéral droit pour l'assistant IA
 * Inspiré de Windsurf / Cursor
 */

import React, { useState } from 'react';
import { Box, IconButton, Typography, TextField, Paper, Avatar, Chip } from '@mui/material';
import {
  Close,
  SmartToy,
  Send,
  AttachFile,
  Code,
  BugReport,
  Lightbulb,
  AutoAwesome,
  Refresh,
} from '@mui/icons-material';
import { useAI } from '../../hooks/useAI';

interface AISidePanelProps {
  width?: number;
  onClose: () => void;
}

const AISidePanel: React.FC<AISidePanelProps> = ({ width = 400, onClose }) => {
  const {
    currentConversation,
    sendMessage,
    streaming,
  } = useAI();

  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'chat' | 'code' | 'debug'>('chat');

  const handleSend = async () => {
    if (!input.trim()) return;

    await sendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { icon: <Code />, label: 'Générer code', action: 'code' },
    { icon: <BugReport />, label: 'Débugger', action: 'debug' },
    { icon: <Lightbulb />, label: 'Suggérer', action: 'suggest' },
    { icon: <AutoAwesome />, label: 'Optimiser', action: 'optimize' },
  ];

  return (
    <Box
      sx={{
        width,
        height: '100%',
        bgcolor: '#252526',
        borderLeft: '1px solid #3c3c3c',
        display: 'flex',
        flexDirection: 'column',
        color: '#cccccc',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          borderBottom: '1px solid #3c3c3c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToy sx={{ color: '#007acc', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            AI Copilot
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={() => {}}>
            <Refresh sx={{ fontSize: 18, color: '#858585' }} />
          </IconButton>
          <IconButton size="small" onClick={onClose}>
            <Close sx={{ fontSize: 18, color: '#858585' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Mode selector */}
      <Box sx={{ p: 1, borderBottom: '1px solid #3c3c3c' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[
            { value: 'chat', label: 'Chat' },
            { value: 'code', label: 'Code Gen' },
            { value: 'debug', label: 'Debug' },
          ].map((m) => (
            <Chip
              key={m.value}
              label={m.label}
              size="small"
              onClick={() => setMode(m.value as any)}
              sx={{
                bgcolor: mode === m.value ? '#007acc' : '#3c3c3c',
                color: mode === m.value ? '#ffffff' : '#cccccc',
                fontSize: '11px',
                height: '24px',
                '&:hover': {
                  bgcolor: mode === m.value ? '#0098ff' : '#4c4c4c',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ p: 1.5, borderBottom: '1px solid #3c3c3c' }}>
        <Typography variant="caption" sx={{ color: '#858585', mb: 1, display: 'block' }}>
          Actions rapides
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          {quickActions.map((action) => (
            <Paper
              key={action.action}
              sx={{
                p: 1,
                bgcolor: '#2d2d30',
                border: '1px solid #3c3c3c',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: '#37373d',
                  borderColor: '#007acc',
                },
              }}
            >
              {React.cloneElement(action.icon, {
                sx: { fontSize: 16, color: '#007acc' },
              })}
              <Typography variant="caption" sx={{ fontSize: '10px' }}>
                {action.label}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {currentConversation?.messages.map((msg, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'flex-start',
            }}
          >
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: msg.role === 'user' ? '#007acc' : '#4caf50',
                fontSize: '12px',
              }}
            >
              {msg.role === 'user' ? 'U' : 'AI'}
            </Avatar>
            <Paper
              sx={{
                flex: 1,
                p: 1.5,
                bgcolor: msg.role === 'user' ? '#2d2d30' : '#1e1e1e',
                border: '1px solid #3c3c3c',
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </Typography>
              {msg.content.includes('```') && (
                <Paper
                  sx={{
                    mt: 1,
                    p: 1,
                    bgcolor: '#1e1e1e',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    border: '1px solid #3c3c3c',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <code>{msg.content.split('```')[1]?.split('```')[0] || ''}</code>
                </Paper>
              )}
            </Paper>
          </Box>
        ))}

        {streaming && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, bgcolor: '#4caf50' }}>AI</Avatar>
            <Typography variant="caption" sx={{ color: '#858585' }}>
              En train d'écrire...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 1.5,
          borderTop: '1px solid #3c3c3c',
        }}
      >
        <Paper
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 1,
            p: 1,
            bgcolor: '#1e1e1e',
            border: '1px solid #3c3c3c',
          }}
        >
          <IconButton size="small" sx={{ color: '#858585' }}>
            <AttachFile sx={{ fontSize: 18 }} />
          </IconButton>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Demandez à l'IA..."
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                color: '#cccccc',
                fontSize: '13px',
                '& textarea': {
                  '&::placeholder': {
                    color: '#858585',
                    opacity: 1,
                  },
                },
              },
            }}
          />
          <IconButton
            size="small"
            onClick={handleSend}
            disabled={!input.trim() || streaming}
            sx={{
              color: input.trim() ? '#007acc' : '#858585',
            }}
          >
            <Send sx={{ fontSize: 18 }} />
          </IconButton>
        </Paper>
        <Typography variant="caption" sx={{ color: '#858585', fontSize: '10px', mt: 0.5, display: 'block' }}>
          Ctrl+Enter pour envoyer • Shift+Enter pour nouvelle ligne
        </Typography>
      </Box>
    </Box>
  );
};

export default AISidePanel;
