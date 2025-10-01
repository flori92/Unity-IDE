import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// ...imports inchangés...
import { localBackend } from '../../../services/localBackendService';
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
  const [search, setSearch] = useState('');

  // Agrégation temps réel des événements Docker, K8s, Ansible
  useEffect(() => {
    // Mapping des événements en Activity
    const mapDockerLog = (data: any): Activity => ({
      id: `docker-${data.id || Date.now()}`,
      type: 'docker',
      action: data.action || 'Docker Event',
      message: data.message || data.log || JSON.stringify(data),
      status: data.status || 'info',
      timestamp: new Date(data.timestamp || Date.now()),
      user: data.user || 'system',
      details: data.details,
    });
    const mapK8sEvent = (data: any): Activity => ({
      id: `k8s-${data.uid || data.id || Date.now()}`,
      type: 'kubernetes',
      action: data.reason || data.action || 'K8s Event',
      message: data.message || data.note || JSON.stringify(data),
      status: data.type === 'Warning' ? 'warning' : 'info',
      timestamp: new Date(data.timestamp || data.eventTime || Date.now()),
      user: data.reportingComponent || data.user || 'system',
      details: data.details,
    });
    const mapAnsibleExec = (data: any): Activity => ({
      id: `ansible-${data.id || Date.now()}`,
      type: 'ansible',
      action: data.play || data.action || 'Ansible Exec',
      message: data.msg || data.message || JSON.stringify(data),
      status: data.status || (data.failed ? 'error' : 'success'),
      timestamp: new Date(data.timestamp || Date.now()),
      user: data.user || 'system',
      details: data.details,
    });

    // Abonnements WebSocket
    const unsubDocker = localBackend.subscribeToDockerLogs((data: any) => {
      const activity = mapDockerLog(data);
      setActivities(prev => [activity, ...prev].slice(0, 50));
    });
    const unsubK8s = localBackend.subscribeToK8sEvents((data: any) => {
      const activity = mapK8sEvent(data);
      setActivities(prev => [activity, ...prev].slice(0, 50));
    });
    const unsubAnsible = localBackend.subscribeToAnsibleExec((data: any) => {
      const activity = mapAnsibleExec(data);
      setActivities(prev => [activity, ...prev].slice(0, 50));
    });

    return () => {
      unsubDocker();
      unsubK8s();
      unsubAnsible();
    };
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


  // UX : timestamp lisible, FR, tooltip si > 1j
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) {
      return 'À l’instant';
    }
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h`;
    }
    const days = Math.floor(hours / 24);
    return `${days}j`;
  };

  const filteredActivities = activities.filter(a => {
    const typeOk = filter === 'all' || a.type === filter;
    const searchOk =
      !search ||
      a.action.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase()) ||
      (a.user && a.user.toLowerCase().includes(search.toLowerCase())) ||
      (a.details && a.details.toLowerCase().includes(search.toLowerCase()));
    return typeOk && searchOk;
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 2 }}>
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
        <TextField
          size="small"
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 180 }}
        />
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
                    <Typography variant="caption" color="text.secondary" title={activity.timestamp.toLocaleString('fr-FR')}>
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
