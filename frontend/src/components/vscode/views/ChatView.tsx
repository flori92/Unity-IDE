/**
 * ChatView - Vue de chat pour la collaboration
 * Chat en temps réel entre les membres de l'équipe
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Paper,
  Chip,
} from '@mui/material';
import { Send, AttachFile, EmojiEmotions, Code } from '@mui/icons-material';
import { usePresence } from '../../../hooks/usePresence';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'code' | 'file';
  metadata?: any;
}

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'user-1',
      userName: 'Current User',
      content: 'Hey team! Ready to start working on this feature?',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
    },
    {
      id: '2',
      userId: 'user-2',
      userName: 'Alice',
      content: "Yes! I've already started on the backend API.",
      timestamp: new Date(Date.now() - 3000000),
      type: 'text',
    },
    {
      id: '3',
      userId: 'user-3',
      userName: 'Bob',
      content: 'Great! I can handle the frontend components.',
      timestamp: new Date(Date.now() - 2400000),
      type: 'text',
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { setTyping, allPresences } = usePresence();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    if (input.length > 0 && !isTyping) {
      setIsTyping(true);
      setTyping(true);
    } else if (input.length === 0 && isTyping) {
      setIsTyping(false);
      setTyping(false);
    }
  }, [input, isTyping, setTyping]);

  const handleSend = () => {
    if (!input.trim()) {
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'user-1',
      userName: 'Current User',
      content: input.trim(),
      timestamp: new Date(),
      type: 'text',
    };

    setMessages([...messages, newMessage]);
    setInput('');
    setIsTyping(false);
    setTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) {
      return 'Just now';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getUserColor = (userId: string): string => {
    const presence = allPresences.find((p) => p.userId === userId);
    return presence?.userId === 'user-1' ? '#007acc' : '#4caf50';
  };

  const getTypingUsers = (): string[] => {
    return allPresences
      .filter((p) => p.isTyping && p.userId !== 'user-1')
      .map((p) => p.userId);
  };

  const typingUsers = getTypingUsers();

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
          Team Chat
        </Typography>
        <Chip
          label={`${allPresences.length} online`}
          size="small"
          sx={{ bgcolor: '#4caf50', color: 'white', height: 20 }}
        />
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
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
        {messages.map((message) => {
          const isCurrentUser = message.userId === 'user-1';

          return (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                gap: 1,
                flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: getUserColor(message.userId),
                  fontSize: '14px',
                }}
              >
                {message.userName.charAt(0).toUpperCase()}
              </Avatar>

              <Box
                sx={{
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#cccccc',
                      fontWeight: 500,
                      fontSize: '12px',
                    }}
                  >
                    {message.userName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#858585',
                      fontSize: '10px',
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </Box>

                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: isCurrentUser ? '#007acc' : '#2d2d30',
                    color: '#ffffff',
                    borderRadius: 2,
                    wordBreak: 'break-word',
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '14px' }}>
                    {message.content}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          );
        })}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 5 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                p: 1,
                bgcolor: '#2d2d30',
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#858585',
                  animation: 'typing 1.4s infinite',
                  '@keyframes typing': {
                    '0%, 60%, 100%': { opacity: 0.3 },
                    '30%': { opacity: 1 },
                  },
                }}
              />
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#858585',
                  animation: 'typing 1.4s infinite 0.2s',
                }}
              />
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#858585',
                  animation: 'typing 1.4s infinite 0.4s',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#858585', fontSize: '11px' }}>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid #2d2d30',
          display: 'flex',
          gap: 1,
          alignItems: 'flex-end',
        }}
      >
        <IconButton size="small" sx={{ color: '#858585' }}>
          <AttachFile fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ color: '#858585' }}>
          <Code fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ color: '#858585' }}>
          <EmojiEmotions fontSize="small" />
        </IconButton>

        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#cccccc',
              bgcolor: '#1e1e1e',
              fontSize: '14px',
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
          disabled={!input.trim()}
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
          <Send fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatView;
