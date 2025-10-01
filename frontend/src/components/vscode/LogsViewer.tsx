/**
 * Logs Viewer - Visualiseur de logs temps réel
 * Streaming WebSocket pour Docker et Kubernetes
 */

import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, IconButton, TextField } from '@mui/material';
import { Close, Clear, Download } from '@mui/icons-material';
import { wsService } from '../../services/websocket.service';

interface LogsViewerProps {
  type: 'docker' | 'kubernetes';
  containerId?: string;
  podName?: string;
  namespace?: string;
  onClose: () => void;
}

export const LogsViewer: React.FC<LogsViewerProps> = ({
  type,
  containerId,
  podName,
  namespace = 'default',
  onClose,
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connexion WebSocket
    wsService.connect().catch((error) => {
      console.error('WebSocket connection failed:', error);
    });

    // Subscribe aux logs
    let unsubscribe: (() => void) | undefined;

    if (type === 'docker' && containerId) {
      const handler = (data: any) => {
        setLogs((prev) => [...prev, data.log]);
      };
      wsService.subscribeDockerLogs(containerId, handler);
      unsubscribe = () => wsService.unsubscribeDockerLogs(containerId, handler);
    } else if (type === 'kubernetes' && podName) {
      const handler = (data: any) => {
        setLogs((prev) => [...prev, data.log]);
      };
      wsService.subscribeK8sLogs(podName, namespace, handler);
      unsubscribe = () => wsService.unsubscribeK8sLogs(podName, namespace, handler);
    }

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [type, containerId, podName, namespace]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Handle manual scroll
  const handleScroll = () => {
    if (logsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const downloadLogs = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${type}-${containerId || podName}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = filter
    ? logs.filter((log) => log.toLowerCase().includes(filter.toLowerCase()))
    : logs;

  const title = type === 'docker' 
    ? `Docker Logs: ${containerId}` 
    : `Kubernetes Logs: ${podName} (${namespace})`;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1e1e1e',
        color: '#cccccc',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          height: 40,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #2d2d30',
          bgcolor: '#252526',
        }}
      >
        <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 600 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={clearLogs} sx={{ color: '#858585' }}>
            <Clear fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={downloadLogs} sx={{ color: '#858585' }}>
            <Download fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onClose} sx={{ color: '#858585' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Filter */}
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #2d2d30' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Filter logs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#cccccc',
              fontSize: '13px',
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
      </Box>

      {/* Logs */}
      <Box
        ref={logsContainerRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontSize: '13px',
          lineHeight: 1.6,
          '&::-webkit-scrollbar': {
            width: '10px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1e1e1e',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#424242',
            borderRadius: '5px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#4e4e4e',
          },
        }}
      >
        {filteredLogs.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#858585', fontStyle: 'italic' }}>
            {logs.length === 0 ? 'Waiting for logs...' : 'No logs match the filter'}
          </Typography>
        ) : (
          filteredLogs.map((log, index) => (
            <Box
              key={index}
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <span style={{ color: '#858585', marginRight: '8px' }}>
                {String(index + 1).padStart(4, ' ')}
              </span>
              <span>{log}</span>
            </Box>
          ))
        )}
        <div ref={logsEndRef} />
      </Box>

      {/* Footer */}
      <Box
        sx={{
          height: 24,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #2d2d30',
          bgcolor: '#252526',
          fontSize: '11px',
          color: '#858585',
        }}
      >
        <span>{filteredLogs.length} lines {filter && `(filtered from ${logs.length})`}</span>
        <span style={{ color: autoScroll ? '#4ec9b0' : '#858585' }}>
          {autoScroll ? '● Auto-scroll' : '○ Auto-scroll'}
        </span>
      </Box>
    </Box>
  );
};

export default LogsViewer;
