import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PlayArrow as RunIcon,
  Add as AddIcon,
  CloudUpload as DeployIcon,
  Build as BuildIcon,
  RestartAlt as RestartIcon,
  Terminal as TerminalIcon,
  FolderOpen as BrowseIcon,
  Sync as SyncIcon,
  Settings as ConfigIcon,
  Extension as ExtensionIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

const QuickActions: React.FC = () => {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [formData, setFormData] = useState<any>({});

  const handleActionClick = (actionId: string) => {
    setSelectedAction(actionId);
    setDialogOpen(true);
    setFormData({});
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAction('');
    setFormData({});
  };

  const handleExecute = () => {
    console.log('Executing action:', selectedAction, formData);
    handleDialogClose();
  };

  const quickActions: QuickAction[] = [
    {
      id: 'run-container',
      title: 'Run Container',
      description: 'Start a new Docker container',
      icon: <RunIcon />,
      color: theme.palette.info.main,
      action: () => handleActionClick('run-container'),
    },
    {
      id: 'deploy-app',
      title: 'Deploy App',
      description: 'Deploy to Kubernetes cluster',
      icon: <DeployIcon />,
      color: theme.palette.success.main,
      action: () => handleActionClick('deploy-app'),
    },
    {
      id: 'run-playbook',
      title: 'Run Playbook',
      description: 'Execute Ansible playbook',
      icon: <RunIcon />,
      color: theme.palette.warning.main,
      action: () => handleActionClick('run-playbook'),
    },
    {
      id: 'build-image',
      title: 'Build Image',
      description: 'Build Docker image',
      icon: <BuildIcon />,
      color: theme.palette.primary.main,
      action: () => handleActionClick('build-image'),
    },
    {
      id: 'restart-service',
      title: 'Restart Service',
      description: 'Restart a running service',
      icon: <RestartIcon />,
      color: theme.palette.error.main,
      action: () => handleActionClick('restart-service'),
    },
    {
      id: 'open-terminal',
      title: 'Terminal',
      description: 'Open integrated terminal',
      icon: <TerminalIcon />,
      color: theme.palette.grey[700],
      action: () => handleActionClick('open-terminal'),
    },
    {
      id: 'browse-registry',
      title: 'Browse Registry',
      description: 'Explore image registry',
      icon: <BrowseIcon />,
      color: theme.palette.secondary.main,
      action: () => handleActionClick('browse-registry'),
    },
    {
      id: 'sync-cluster',
      title: 'Sync Cluster',
      description: 'Sync with K8s cluster',
      icon: <SyncIcon />,
      color: theme.palette.info.dark,
      action: () => handleActionClick('sync-cluster'),
    },
    {
      id: 'configure',
      title: 'Configure',
      description: 'System configuration',
      icon: <ConfigIcon />,
      color: theme.palette.grey[600],
      action: () => handleActionClick('configure'),
    },
    {
      id: 'install-extension',
      title: 'Extensions',
      description: 'Browse extensions',
      icon: <ExtensionIcon />,
      color: theme.palette.primary.dark,
      action: () => handleActionClick('install-extension'),
    },
    {
      id: 'schedule-task',
      title: 'Schedule',
      description: 'Schedule a task',
      icon: <ScheduleIcon />,
      color: theme.palette.warning.dark,
      action: () => handleActionClick('schedule-task'),
    },
    {
      id: 'security-scan',
      title: 'Security Scan',
      description: 'Run security scan',
      icon: <SecurityIcon />,
      color: theme.palette.error.dark,
      action: () => handleActionClick('security-scan'),
    },
  ];

  const getDialogContent = () => {
    switch (selectedAction) {
      case 'run-container':
        return (
          <>
            <TextField
              fullWidth
              label="Image Name"
              variant="outlined"
              margin="normal"
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="nginx:latest"
            />
            <TextField
              fullWidth
              label="Container Name"
              variant="outlined"
              margin="normal"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Port Mapping"
              variant="outlined"
              margin="normal"
              value={formData.ports || ''}
              onChange={(e) => setFormData({ ...formData, ports: e.target.value })}
              placeholder="8080:80"
            />
          </>
        );

      case 'deploy-app':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Namespace</InputLabel>
              <Select
                value={formData.namespace || 'default'}
                onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
                label="Namespace"
              >
                <MenuItem value="default">default</MenuItem>
                <MenuItem value="production">production</MenuItem>
                <MenuItem value="staging">staging</MenuItem>
                <MenuItem value="development">development</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Deployment Name"
              variant="outlined"
              margin="normal"
              value={formData.deployment || ''}
              onChange={(e) => setFormData({ ...formData, deployment: e.target.value })}
            />
            <TextField
              fullWidth
              label="Image"
              variant="outlined"
              margin="normal"
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="myapp:v1.0.0"
            />
          </>
        );

      case 'run-playbook':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Playbook</InputLabel>
              <Select
                value={formData.playbook || ''}
                onChange={(e) => setFormData({ ...formData, playbook: e.target.value })}
                label="Playbook"
              >
                <MenuItem value="site.yml">site.yml</MenuItem>
                <MenuItem value="deploy.yml">deploy.yml</MenuItem>
                <MenuItem value="configure.yml">configure.yml</MenuItem>
                <MenuItem value="update.yml">update.yml</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Inventory"
              variant="outlined"
              margin="normal"
              value={formData.inventory || './inventory'}
              onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
            />
            <TextField
              fullWidth
              label="Tags (optional)"
              variant="outlined"
              margin="normal"
              value={formData.tags || ''}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="web,database"
            />
          </>
        );

      default:
        return (
          <Typography variant="body1" color="text.secondary">
            Configuration for this action is coming soon...
          </Typography>
        );
    }
  };

  return (
    <>
      <Grid container spacing={1.5} sx={{ overflow: 'auto', maxHeight: '100%' }}>
        {quickActions.map((action) => (
          <Grid item xs={6} sm={4} key={action.id}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                  backgroundColor: alpha(action.color, 0.05),
                },
              }}
            >
              <CardActionArea onClick={action.action} sx={{ height: '100%' }}>
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: alpha(action.color, 0.1),
                      color: action.color,
                      mb: 1,
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {quickActions.find(a => a.id === selectedAction)?.title}
        </DialogTitle>
        <DialogContent>
          {getDialogContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleExecute} variant="contained" color="primary">
            Execute
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuickActions;
