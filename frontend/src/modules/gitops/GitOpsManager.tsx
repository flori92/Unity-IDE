import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Paper,
  Tab,
  Tabs,
  Avatar,
  Badge,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Sync as SyncIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  AutoMode as AutoSyncIcon,
  ManageSearch as DriftIcon,
  Speed as MetricsIcon,
  PlayArrow as DeployIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GitOpsApp {
  id: string;
  name: string;
  namespace: string;
  repo: string;
  branch: string;
  path: string;
  syncStatus: 'Synced' | 'OutOfSync' | 'Unknown';
  health: 'Healthy' | 'Degraded' | 'Missing';
  autoSync: boolean;
  lastSync: Date;
  resources: number;
}

const GitOpsManager: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<GitOpsApp | null>(null);

  const [apps] = useState<GitOpsApp[]>([
    {
      id: '1',
      name: 'frontend-prod',
      namespace: 'production',
      repo: 'github.com/company/frontend',
      branch: 'main',
      path: '/k8s/prod',
      syncStatus: 'Synced',
      health: 'Healthy',
      autoSync: true,
      lastSync: new Date(),
      resources: 12,
    },
    {
      id: '2',
      name: 'backend-prod',
      namespace: 'production',
      repo: 'github.com/company/backend',
      branch: 'main',
      path: '/deploy',
      syncStatus: 'OutOfSync',
      health: 'Degraded',
      autoSync: false,
      lastSync: new Date(Date.now() - 3600000),
      resources: 8,
    },
    {
      id: '3',
      name: 'monitoring',
      namespace: 'monitoring',
      repo: 'github.com/company/infra',
      branch: 'main',
      path: '/monitoring',
      syncStatus: 'Synced',
      health: 'Healthy',
      autoSync: true,
      lastSync: new Date(),
      resources: 15,
    },
  ]);

  const syncData = [
    { name: 'Synced', value: apps.filter(a => a.syncStatus === 'Synced').length, color: theme.palette.success.main },
    { name: 'OutOfSync', value: apps.filter(a => a.syncStatus === 'OutOfSync').length, color: theme.palette.warning.main },
    { name: 'Unknown', value: apps.filter(a => a.syncStatus === 'Unknown').length, color: theme.palette.grey[500] },
  ];

  const trendData = [
    { time: '00:00', syncs: 5, failures: 0 },
    { time: '06:00', syncs: 12, failures: 1 },
    { time: '12:00', syncs: 18, failures: 2 },
    { time: '18:00', syncs: 15, failures: 1 },
    { time: '24:00', syncs: 8, failures: 0 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Synced': return <SuccessIcon fontSize="small" />;
      case 'OutOfSync': return <WarningIcon fontSize="small" />;
      default: return <ErrorIcon fontSize="small" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Healthy': return theme.palette.success.main;
      case 'Degraded': return theme.palette.warning.main;
      default: return theme.palette.error.main;
    }
  };

  const handleSync = (app: GitOpsApp) => {
    setSelectedApp(app);
    setSyncDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            GitOps Manager
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Continuous deployment with Git as source of truth
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Application
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4">{apps.length}</Typography>
              <Typography variant="caption" color="text.secondary">
                Total Apps
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.05) }}>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {apps.filter(a => a.syncStatus === 'Synced').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Synced
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {apps.filter(a => a.syncStatus === 'OutOfSync').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Out of Sync
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4">
                {apps.filter(a => a.autoSync).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Auto-Sync
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label={<Badge badgeContent={apps.length} color="primary">Applications</Badge>} />
        <Tab label="Analytics" />
      </Tabs>

      {/* Applications */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {apps.map(app => (
            <Grid item xs={12} md={6} lg={4} key={app.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: getHealthColor(app.health), width: 32, height: 32 }}>
                        <GitHubIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{app.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {app.namespace}
                        </Typography>
                      </Box>
                    </Box>
                    {app.autoSync && <Chip icon={<AutoSyncIcon />} label="Auto" size="small" />}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(app.syncStatus)}
                      <Typography variant="body2">
                        {app.syncStatus}
                      </Typography>
                      <Chip 
                        label={app.health}
                        size="small"
                        sx={{ 
                          bgcolor: alpha(getHealthColor(app.health), 0.1),
                          color: getHealthColor(app.health),
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {app.resources} resources • Last sync: {app.lastSync.toLocaleTimeString()}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="caption" color="text.secondary" display="block">
                    {app.repo.split('/').slice(-2).join('/')} • {app.branch}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Path: {app.path}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<SyncIcon />} onClick={() => handleSync(app)}>
                    Sync
                  </Button>
                  <Button size="small">Details</Button>
                  <IconButton size="small">
                    <RefreshIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Analytics */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Sync Status</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={syncData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {syncData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Sync Trend (24h)</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="syncs" stroke={theme.palette.success.main} />
                  <Line type="monotone" dataKey="failures" stroke={theme.palette.error.main} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Sync Dialog */}
      <Dialog open={syncDialogOpen} onClose={() => setSyncDialogOpen(false)}>
        <DialogTitle>Sync Application: {selectedApp?.name}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Sync to match the desired state in Git
          </Alert>
          <FormControlLabel control={<Switch defaultChecked />} label="Prune resources" />
          <FormControlLabel control={<Switch />} label="Force sync" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyncDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<SyncIcon />}>Sync Now</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GitOpsManager;
