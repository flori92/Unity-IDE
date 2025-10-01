/**
 * Status Bar - Barre de statut VS Code
 * Affiche les infos : Git, Errors, Line/Col, Language, etc.
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  ErrorOutline,
  WarningAmber,
  CheckCircleOutline,
  CloudQueue,
} from '@mui/icons-material';

interface StatusBarProps {
  onTogglePanel: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ onTogglePanel }) => {
  return (
    <Box
      sx={{
        height: 22,
        bgcolor: '#007acc',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1,
        fontSize: '12px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Left Side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Git Branch */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 },
          }}
        >
          <CloudQueue sx={{ fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontSize: '12px' }}>
            main
          </Typography>
        </Box>

        {/* Errors & Warnings */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 },
          }}
          onClick={onTogglePanel}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ErrorOutline sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontSize: '12px' }}>
              0
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <WarningAmber sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontSize: '12px' }}>
              0
            </Typography>
          </Box>
        </Box>

        {/* Docker Status */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 },
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '12px' }}>
            🐳 5 containers
          </Typography>
        </Box>

        {/* Kubernetes Status */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 },
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '12px' }}>
            ☸️ minikube
          </Typography>
        </Box>
      </Box>

      {/* Right Side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Line & Column */}
        <Box
          sx={{
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 },
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '12px' }}>
            Ln 1, Col 1
          </Typography>
        </Box>

        {/* Spaces */}
        <Box
          sx={{
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 },
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '12px' }}>
            Spaces: 2
          </Typography>
        </Box>

        {/* Encoding */}
        <Box
          sx={{
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 },
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '12px' }}>
            UTF-8
          </Typography>
        </Box>

        {/* Language */}
        <Box
          sx={{
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 },
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '12px' }}>
            YAML
          </Typography>
        </Box>

        {/* Status Icon */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 },
          }}
        >
          <CheckCircleOutline sx={{ fontSize: 16 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default StatusBar;
