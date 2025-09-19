import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Circle as CircleIcon,
  Computer as DockerIcon,
  CloudQueue as K8sIcon,
  PlayCircleOutline as AnsibleIcon,
  Memory as MemoryIcon,
  Speed as CpuIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
} from '@mui/icons-material';
import { useConnectionStore } from '../../store/connectionStore';
import { TauriService } from '../../services/tauriService';

interface StatusBarProps {}

const StatusBar: React.FC<StatusBarProps> = () => {
  const theme = useTheme();
  const { connections } = useConnectionStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await TauriService.getSystemMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const getConnectionStatus = (service: string) => {
    const connection = connections.find(c => c.name === service);
    return connection?.status || 'disconnected';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return theme.palette.success.main;
      case 'connecting':
        return theme.palette.warning.main;
      case 'disconnected':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 32,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        px: 2,
        zIndex: theme.zIndex.drawer + 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        {/* Service Connections */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={`Docker: ${getConnectionStatus('docker')}`}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DockerIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <CircleIcon
                sx={{
                  fontSize: 8,
                  color: getStatusColor(getConnectionStatus('docker')),
                }}
              />
            </Box>
          </Tooltip>

          <Typography variant="caption" color="text.secondary">|</Typography>

          <Tooltip title={`Kubernetes: ${getConnectionStatus('kubernetes')}`}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <K8sIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <CircleIcon
                sx={{
                  fontSize: 8,
                  color: getStatusColor(getConnectionStatus('kubernetes')),
                }}
              />
            </Box>
          </Tooltip>

          <Typography variant="caption" color="text.secondary">|</Typography>

          <Tooltip title={`Ansible: ${getConnectionStatus('ansible')}`}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AnsibleIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <CircleIcon
                sx={{
                  fontSize: 8,
                  color: getStatusColor(getConnectionStatus('ansible')),
                }}
              />
            </Box>
          </Tooltip>
        </Box>

        {/* Separator */}
        <Typography variant="caption" color="text.secondary">•</Typography>

        {/* System Metrics */}
        {metrics && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={`CPU Usage: ${metrics.cpu?.usage_percent?.toFixed(1)}%`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CpuIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                <Typography variant="caption" color="text.secondary">
                  {metrics.cpu?.usage_percent?.toFixed(0)}%
                </Typography>
              </Box>
            </Tooltip>

            <Tooltip title={`Memory: ${metrics.memory?.used_mb}MB / ${metrics.memory?.total_mb}MB`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <MemoryIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                <Typography variant="caption" color="text.secondary">
                  {metrics.memory?.usage_percent?.toFixed(0)}%
                </Typography>
              </Box>
            </Tooltip>

            <Tooltip title={`Disk: ${metrics.disk?.used_gb}GB / ${metrics.disk?.total_gb}GB`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StorageIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                <Typography variant="caption" color="text.secondary">
                  {metrics.disk?.usage_percent?.toFixed(0)}%
                </Typography>
              </Box>
            </Tooltip>

            <Tooltip title={`Network: ↓${metrics.network?.rx_mb_s?.toFixed(1)}MB/s ↑${metrics.network?.tx_mb_s?.toFixed(1)}MB/s`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <NetworkIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                <Typography variant="caption" color="text.secondary">
                  ↓{metrics.network?.rx_mb_s?.toFixed(1)} ↑{metrics.network?.tx_mb_s?.toFixed(1)}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Right Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Version */}
        <Typography variant="caption" color="text.secondary">
          v1.0.0
        </Typography>

        {/* Time */}
        <Typography variant="caption" color="text.secondary">
          {time.toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatusBar;
