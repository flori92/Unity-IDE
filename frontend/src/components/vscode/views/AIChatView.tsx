/**
 * AI Chat View - Vue de chat avec l'IA
 * Interface de conversation avec l'AI Copilot
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Add,
  Delete,
  Refresh,
  Code,
  BugReport,
  Build,
  Lightbulb,
} from '@mui/icons-material';
import { useAI } from '../../hooks/useAI';
import { AIMessage } from '../../services/ai.service';

interface MessageBubbleProps {
  message: AIMessage;
  isUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isUser }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        mb: 2,
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
      }}
    >
      <Avatar
        sx={{
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          width: 32,
          height: 32,
        }}
      >
        {isUser ? <Person sx={{ fontSize: 16 }} /> : <SmartToy sx={{ fontSize: 16 }} />}
      </Avatar>

      <Paper
        sx={{
          p: 1.5,
          maxWidth: '70%',
          bgcolor: isUser ? 'primary.main' : 'grey.800',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
          {message.content}
          {message.metadata?.reasoning && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1,
                opacity: 0.7,
                fontStyle: 'italic',
              }}
            >
              💭 {message.metadata.reasoning}
            </Typography>
          )}
        </Typography>

        {message.metadata?.tokens && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              opacity: 0.6,
              textAlign: 'right',
            }}
          >
            {message.metadata.tokens} tokens
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export const AIChatView: React.FC = () => {
  const {
    conversations,
    currentConversation,
    models,
    loading,
    streaming,
    error,
    createConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
    analyzeContext,
  } = useAI();

  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [context, setContext] = useState('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || streaming) {
      return;
    }

    const message = input.trim();
    setInput('');

    if (!currentConversation) {
      // Créer une nouvelle conversation avec le premier message
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
      await createConversation(title, context, selectedModel);
      // Le message sera envoyé après la création de la conversation
      setTimeout(() => sendMessage(message), 100);
    } else {
      await sendMessage(message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversation = () => {
    setCurrentConversation(null);
  };

  const handleDeleteConversation = async (id: string) => {
    if (confirm('Delete this conversation?')) {
      await deleteConversation(id);
    }
  };

  const handleContextAnalysis = async () => {
    const analysis = await analyzeContext(context);
    if (analysis.suggestions.length > 0) {
      const suggestion = analysis.suggestions[0];
      setInput(`Can you help me with: ${suggestion}`);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #2d2d30',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" sx={{ color: '#cccccc', fontSize: '16px' }}>
          AI Copilot
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={handleNewConversation}
            sx={{ color: '#858585' }}
            title="New Conversation"
          >
            <Add />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => window.location.reload()}
            sx={{ color: '#858585' }}
            title="Refresh"
          >
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Conversations List */}
      {conversations.length > 0 && (
        <Box sx={{ p: 1, borderBottom: '1px solid #2d2d30', maxHeight: '150px', overflowY: 'auto' }}>
          <Typography variant="caption" sx={{ color: '#858585', mb: 1, display: 'block' }}>
            Recent Conversations
          </Typography>
          {conversations.slice(0, 5).map((conv) => (
            <Box
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              sx={{
                p: 1,
                mb: 0.5,
                borderRadius: 1,
                cursor: 'pointer',
                bgcolor: currentConversation?.id === conv.id ? 'rgba(0, 122, 204, 0.2)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#cccccc',
                    fontSize: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {conv.title}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                  sx={{ color: '#858585', p: 0.5 }}
                >
                  <Delete sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
              <Typography
                variant="caption"
                sx={{ color: '#858585', fontSize: '10px' }}
              >
                {new Date(conv.updatedAt).toLocaleDateString()}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Context & Model Selection */}
      {!currentConversation && (
        <Box sx={{ p: 2, borderBottom: '1px solid #2d2d30' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: '#858585' }}>Context</InputLabel>
              <Select
                value={context}
                onChange={(e) => setContext(e.target.value)}
                sx={{
                  color: '#cccccc',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2d2d30',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#cccccc',
                  },
                }}
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="docker">Docker</MenuItem>
                <MenuItem value="kubernetes">Kubernetes</MenuItem>
                <MenuItem value="ansible">Ansible</MenuItem>
                <MenuItem value="git">Git</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: '#858585' }}>Model</InputLabel>
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                sx={{
                  color: '#cccccc',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2d2d30',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#cccccc',
                  },
                }}
              >
                {models.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Button
            variant="outlined"
            onClick={handleContextAnalysis}
            sx={{
              color: '#4ec9b0',
              borderColor: '#4ec9b0',
              '&:hover': {
                borderColor: '#4ec9b0',
                bgcolor: 'rgba(78, 201, 176, 0.1)',
              },
            }}
          >
            Get Context Suggestions
          </Button>
        </Box>
      )}

      {/* Current Conversation Info */}
      {currentConversation && (
        <Box sx={{ p: 2, borderBottom: '1px solid #2d2d30' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: '#cccccc' }}>
              {currentConversation.title}
            </Typography>
            <Chip
              label={currentConversation.context}
              size="small"
              sx={{ bgcolor: '#007acc', color: '#ffffff' }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: '#858585' }}>
            {currentConversation.messages.length} messages • {currentConversation.model}
          </Typography>
        </Box>
      )}

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1e1e1e',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#424242',
            borderRadius: '3px',
          },
        }}
      >
        {currentConversation ? (
          <>
            {currentConversation.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.role === 'user'}
              />
            ))}
            {streaming && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 5 }}>
                <CircularProgress size={16} sx={{ color: '#4ec9b0' }} />
                <Typography variant="caption" sx={{ color: '#858585' }}>
                  AI is thinking...
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: '#858585',
            }}
          >
            <SmartToy sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Welcome to AI Copilot
            </Typography>
            <Typography variant="body2">
              Ask me anything about DevOps, Docker, Kubernetes, Ansible, or coding!
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1, mt: 2 }}>
            <Typography variant="body2" sx={{ color: '#f48771' }}>
              Error: {error}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, borderTop: '1px solid #2d2d30' }}>
        {/* Quick Suggestions */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: '#858585', mb: 1, display: 'block' }}>
            Quick Actions:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Lightbulb />}
              onClick={() => setInput("Explain this code: ")}
              sx={{
                color: '#007acc',
                borderColor: '#007acc',
                fontSize: '11px',
                '&:hover': {
                  bgcolor: 'rgba(0, 122, 204, 0.1)',
                  borderColor: '#007acc',
                },
              }}
            >
              Explain Code
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<BugReport />}
              onClick={() => setInput("Debug this error: ")}
              sx={{
                color: '#ff6b6b',
                borderColor: '#ff6b6b',
                fontSize: '11px',
                '&:hover': {
                  bgcolor: 'rgba(255, 107, 107, 0.1)',
                  borderColor: '#ff6b6b',
                },
              }}
            >
              Debug Error
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Build />}
              onClick={() => setInput("Optimize this configuration: ")}
              sx={{
                color: '#4caf50',
                borderColor: '#4caf50',
                fontSize: '11px',
                '&:hover': {
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                  borderColor: '#4caf50',
                },
              }}
            >
              Optimize
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Code />}
              onClick={() => setInput("Generate code for: ")}
              sx={{
                color: '#ff9800',
                borderColor: '#ff9800',
                fontSize: '11px',
                '&:hover': {
                  bgcolor: 'rgba(255, 152, 0, 0.1)',
                  borderColor: '#ff9800',
                },
              }}
            >
              Generate Code
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading || streaming}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#cccccc',
                bgcolor: '#1e1e1e',
                '& fieldset': {
                  borderColor: '#2d2d30',
                },
                '&:hover fieldset': {
                  borderColor: '#007acc',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#007acc',
                },
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim() || loading || streaming}
            sx={{
              bgcolor: '#007acc',
              color: 'white',
              '&:hover': {
                bgcolor: '#005a9e',
              },
              '&:disabled': {
                bgcolor: '#2d2d30',
                color: '#858585',
              },
            }}
          >
            {streaming ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : (
              <Send />
            )}
          </IconButton>
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: '#858585',
            display: 'block',
            mt: 1,
            textAlign: 'center',
          }}
        >
          Press Enter to send • Shift+Enter for new line
        </Typography>
      </Box>
    </Box>
  );
};

export default AIChatView;
