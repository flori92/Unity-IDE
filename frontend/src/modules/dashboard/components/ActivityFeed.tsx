import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Avatar,
  useTheme,
  IconButton,
  Divider,
  alpha,
} from '@mui/material';
import {
  Build as BuildIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Computer as DockerIcon,
  CloudQueue as K8sIcon,
  PlayCircleOutline as AnsibleIcon,
} from '@mui/icons-material';

interface Activity {
  id: string;
  type: 'docker' | 'kubernetes' | 'ansible' | 'workflow' | 'system';
  action: string;
  message: string;
  status: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  user?: string;
  details?: string;
}

const ActivityFeed: React.FC = () => {
  const theme = useTheme();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Generate mock activities
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'docker',
        action: 'Container Started',
        message: 'nginx container started successfully',
        status: 'success',
        timestamp: new Date(Date.now() - 2 * 60000),
        user: 'admin',
      },
      {
        id: '2',
        type: 'kubernetes',
        action: 'Pod Deployed',
        message: 'Deployed app-pod-1 to production namespace',
        status: 'success',
        timestamp: new Date(Date.now() - 5 * 60000),
        details: 'Image: app:v2.1.0',
      },
      {
        id: '3',
        type: 'ansible',
        action: 'Playbook Executed',
        message: 'site.yml completed with warnings',
        status: 'warning',
        timestamp: new Date(Date.now() - 10 * 60000),
        user: 'devops',
        details: '2 changed, 1 skipped',
      },
      {
        id: '4',
        type: 'workflow',
        action: 'Pipeline Failed',
        message: 'CI/CD pipeline failed at test stage',
        status: 'error',
        timestamp: new Date(Date.now() - 15 * 60000),
        details: 'Unit tests failed: 3/45',
      },
      {
        id: '5',
        type: 'docker',
        action: 'Image Built',
        message: 'Built image backend:latest',
        status: 'info',
        timestamp: new Date(Date.now() - 20 * 60000),
        user: 'ci-bot',
      },
      {
        id: '6',
        type: 'kubernetes',
        action: 'Service Updated',
        message: 'Updated app-service configuration',
        status: 'info',
        timestamp: new Date(Date.now() - 25 * 60000),
      },
      {
        id: '7',
        type: 'system',
        action: 'High CPU Alert',
        message: 'CPU usage exceeded 80% threshold',
        status: 'warning',
        timestamp: new Date(Date.now() - 30 * 60000),
        details: 'Current: 85%',
      },
      {
        id: '8',
        type: 'ansible',
        action: 'Inventory Updated',
        message: 'Added 3 new hosts to production inventory',
        status: 'success',
        timestamp: new Date(Date.now() - 35 * 60000),
        user: 'admin',
      },
    ];

    setActivities(mockActivities);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newActivity: Activity = {
        id: `new-${Date.now()}`,
        type: ['docker', 'kubernetes', 'ansible', 'workflow', 'system'][Math.floor(Math.random() * 5)] as Activity['type'],
        action: 'New Activity',
        message: 'A new activity has occurred',
        status: ['success', 'error', 'warning', 'info'][Math.floor(Math.random() * 4)] as Activity['status'],
        timestamp: new Date(),
        user: 'system',
      };
      setActivities(prev => [newActivity, ...prev].slice(0, 20));
    }, 30000); // Add new activity every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'docker':
        return <DockerIcon />;
      case 'kubernetes':
        return <K8sIcon />;
      case 'ansible':
        return <AnsibleIcon />;
      case 'workflow':
        return <BuildIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getStatusIcon = (status: Activity['status']) => {
    switch (status) {
      case 'success':
        return <SuccessIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
      case 'error':
        return <ErrorIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
      case 'warning':
        return <WarningIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />;
      default:
        return <InfoIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
    }
  };


  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="All"
            size="small"
            variant={filter === 'all' ? 'filled' : 'outlined'}
            onClick={() => setFilter('all')}
            color={filter === 'all' ? 'primary' : 'default'}
          />
          {['docker', 'kubernetes', 'ansible'].map(type => (
            <Chip
              key={type}
              label={type}
              size="small"
              variant={filter === type ? 'filled' : 'outlined'}
              onClick={() => setFilter(type)}
              color={filter === type ? 'primary' : 'default'}
              sx={{ textTransform: 'capitalize' }}
            />
          ))}
        </Box>
        <IconButton size="small">
          <RefreshIcon />
        </IconButton>
      </Box>

      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {filteredActivities.map((activity, index) => (
          <React.Fragment key={activity.id}>
            <ListItem
              sx={{
                px: 0,
                py: 1,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: alpha(
                      activity.type === 'docker' ? theme.palette.info.main :
                      activity.type === 'kubernetes' ? theme.palette.success.main :
                      activity.type === 'ansible' ? theme.palette.warning.main :
                      theme.palette.grey[500],
                      0.1
                    ),
                    color: 
                      activity.type === 'docker' ? theme.palette.info.main :
                      activity.type === 'kubernetes' ? theme.palette.success.main :
                      activity.type === 'ansible' ? theme.palette.warning.main :
                      theme.palette.grey[500],
                  }}
                >
                  {getIcon(activity.type)}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(activity.status)}
                    <Typography variant="body2" fontWeight={500}>
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(activity.timestamp)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {activity.message}
                    </Typography>
                    {activity.details && (
                      <Typography variant="caption" color="text.secondary">
                        {activity.details}
                      </Typography>
                    )}
                    {activity.user && (
                      <Chip
                        label={activity.user}
                        size="small"
                        sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
            {index < filteredActivities.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default ActivityFeed;
