import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  IconButton,
  Chip,
  LinearProgress,
  useTheme,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Computer as DockerIcon,
  CloudQueue as K8sIcon,
  PlayCircleOutline as AnsibleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import InfrastructureTopology from './components/InfrastructureTopology';
import MetricsChart from './components/MetricsChart';
import ActivityFeed from './components/ActivityFeed';
import QuickActions from './components/QuickActions';
import { useConnectionStore } from '../../store/connectionStore';
import { TauriService } from '../../services/tauriService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { connections } = useConnectionStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dockerStats, setDockerStats] = useState({
    containers: { running: 0, stopped: 0, total: 0 },
    images: 0,
    volumes: 0,
    networks: 0,
  });
  const [k8sStats, setK8sStats] = useState({
    nodes: { ready: 0, total: 0 },
    pods: { running: 0, pending: 0, failed: 0, total: 0 },
    deployments: 0,
    services: 0,
  });
  const [ansibleStats, setAnsibleStats] = useState({
    playbooks: 0,
    hosts: 0,
    roles: 0,
    tasks: { success: 0, failed: 0, skipped: 0 },
  });

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load system metrics
      const metricsData = await TauriService.getSystemMetrics();
      setMetrics(metricsData);

      // Load Docker stats
      if (connections.find(c => c.type === 'docker' && c.status === 'connected')) {
        const containers = await TauriService.getDockerContainers();
        setDockerStats({
          containers: {
            running: containers.filter(c => c.state === 'running').length,
            stopped: containers.filter(c => c.state === 'stopped').length,
            total: containers.length,
          },
          images: 20, // Mock data
          volumes: 10,
          networks: 5,
        });
      }

      // Load K8s stats
      if (connections.find(c => c.type === 'kubernetes' && c.status === 'connected')) {
        const pods = await TauriService.getK8sPods();
        setK8sStats({
          nodes: { ready: 3, total: 3 }, // Mock data
          pods: {
            running: pods.filter(p => p.status === 'Running').length,
            pending: pods.filter(p => p.status === 'Pending').length,
            failed: pods.filter(p => p.status === 'Failed').length,
            total: pods.length,
          },
          deployments: 12,
          services: 8,
        });
      }

      // Load Ansible stats (mock data)
      setAnsibleStats({
        playbooks: 15,
        hosts: 25,
        roles: 10,
        tasks: { success: 150, failed: 5, skipped: 20 },
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: number;
    color?: string;
  }> = ({ title, value, subtitle, icon, trend, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: color ? `${color}15` : theme.palette.primary.main + '15',
              color: color || theme.palette.primary.main,
            }}
          >
            {icon}
          </Box>
          {trend !== undefined && (
            <Chip
              size="small"
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              icon={trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              color={trend > 0 ? 'success' : 'error'}
              variant="outlined"
            />
          )}
        </Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const ServiceHealthCard: React.FC<{
    service: string;
    icon: React.ReactNode;
    stats: any;
    color: string;
  }> = ({ service, icon, stats, color }) => {
    const isConnected = connections.find(c => c.type === service.toLowerCase() && c.status === 'connected');

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {icon}
              <Typography variant="h6">{service}</Typography>
            </Box>
            <Chip
              size="small"
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'error'}
              variant={isConnected ? 'filled' : 'outlined'}
            />
          </Box>
          
          {isConnected && (
            <Box>
              {Object.entries(stats).map(([key, value]) => (
                <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {typeof value === 'object' ? JSON.stringify(value) : value}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Infrastructure Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time overview of your DevOps infrastructure
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadDashboardData}
          >
            Refresh
          </Button>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="CPU Usage"
            value={`${metrics?.cpu?.usage_percent?.toFixed(0) || 0}%`}
            subtitle={`${metrics?.cpu?.cores || 0} cores`}
            icon={<SpeedIcon />}
            trend={5}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Memory Usage"
            value={`${metrics?.memory?.usage_percent?.toFixed(0) || 0}%`}
            subtitle={`${((metrics?.memory?.used_mb || 0) / 1024).toFixed(1)}GB / ${((metrics?.memory?.total_mb || 0) / 1024).toFixed(1)}GB`}
            icon={<MemoryIcon />}
            trend={-2}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Storage"
            value={`${metrics?.disk?.usage_percent?.toFixed(0) || 0}%`}
            subtitle={`${metrics?.disk?.used_gb || 0}GB / ${metrics?.disk?.total_gb || 0}GB`}
            icon={<StorageIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Network I/O"
            value={`${((metrics?.network?.rx_mb_s || 0) + (metrics?.network?.tx_mb_s || 0)).toFixed(1)} MB/s`}
            subtitle={`↓${metrics?.network?.rx_mb_s?.toFixed(1) || 0} ↑${metrics?.network?.tx_mb_s?.toFixed(1) || 0} MB/s`}
            icon={<NetworkIcon />}
            trend={12}
            color={theme.palette.error.main}
          />
        </Grid>
      </Grid>

      {/* Service Health */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <ServiceHealthCard
            service="Docker"
            icon={<DockerIcon />}
            stats={dockerStats}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ServiceHealthCard
            service="Kubernetes"
            icon={<K8sIcon />}
            stats={k8sStats}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ServiceHealthCard
            service="Ansible"
            icon={<AnsibleIcon />}
            stats={ansibleStats}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Infrastructure Topology */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Infrastructure Topology
            </Typography>
            <InfrastructureTopology />
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <QuickActions />
          </Paper>
        </Grid>

        {/* Metrics Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              System Metrics
            </Typography>
            <MetricsChart />
          </Paper>
        </Grid>

        {/* Activity Feed */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, height: 350, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <ActivityFeed />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
