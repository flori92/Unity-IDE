import React, { useState, useEffect } from 'react';
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
  Avatar,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Tooltip,
  Badge,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Collapse,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Cloud as CloudIcon,
  Computer as ComputeIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Security as SecurityIcon,
  AttachMoney as CostIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CloudQueue as AWSIcon,
  CloudCircle as AzureIcon,
  CloudOutlined as GCPIcon,
  CloudOff as OnPremIcon,
  Dns as DNSIcon,
  VpnKey as KeyIcon,
  Speed as PerformanceIcon,
  Warning as WarningIcon,
  CheckCircle as HealthyIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Treemap, RadialBarChart, RadialBar, Legend } from 'recharts';

interface CloudResource {
  id: string;
  name: string;
  type: 'compute' | 'storage' | 'network' | 'database' | 'function' | 'container';
  provider: 'aws' | 'azure' | 'gcp' | 'ovh' | 'onprem';
  region: string;
  status: 'running' | 'stopped' | 'pending' | 'error';
  cost: number;
  specs?: {
    cpu?: number;
    memory?: number;
    storage?: number;
    network?: string;
  };
  tags: Record<string, string>;
  created: Date;
  metrics?: {
    cpu: number;
    memory: number;
    network: number;
  };
}

interface CloudProvider {
  id: string;
  name: string;
  type: 'aws' | 'azure' | 'gcp' | 'ovh' | 'onprem';
  connected: boolean;
  resources: {
    compute: number;
    storage: number;
    network: number;
    database: number;
  };
  monthlyCost: number;
  status: 'healthy' | 'warning' | 'error' | 'disconnected';
  lastSync?: Date;
  credentials?: {
    configured: boolean;
    expiresAt?: Date;
  };
}

const MultiCloudManager: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [providers, setProviders] = useState<CloudProvider[]>([
    {
      id: 'aws-prod',
      name: 'AWS Production',
      type: 'aws',
      connected: true,
      resources: { compute: 25, storage: 10, network: 5, database: 3 },
      monthlyCost: 3250,
      status: 'healthy',
      lastSync: new Date(),
      credentials: { configured: true, expiresAt: new Date('2024-12-31') },
    },
    {
      id: 'azure-dev',
      name: 'Azure Development',
      type: 'azure',
      connected: true,
      resources: { compute: 15, storage: 8, network: 3, database: 2 },
      monthlyCost: 1850,
      status: 'warning',
      lastSync: new Date(),
      credentials: { configured: true },
    },
    {
      id: 'gcp-staging',
      name: 'GCP Staging',
      type: 'gcp',
      connected: true,
      resources: { compute: 10, storage: 5, network: 2, database: 1 },
      monthlyCost: 950,
      status: 'healthy',
      lastSync: new Date(),
      credentials: { configured: true },
    },
    {
      id: 'onprem',
      name: 'On-Premise DC1',
      type: 'onprem',
      connected: false,
      resources: { compute: 50, storage: 20, network: 10, database: 5 },
      monthlyCost: 5000,
      status: 'disconnected',
    },
  ]);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<CloudResource | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadResources();
  }, [selectedProvider]);

  const loadResources = async () => {
    setLoading(true);
    // Simulate loading resources
    setTimeout(() => {
      setResources([
        {
          id: '1',
          name: 'web-server-01',
          type: 'compute',
          provider: 'aws',
          region: 'us-east-1',
          status: 'running',
          cost: 125.50,
          specs: { cpu: 4, memory: 16, storage: 100 },
          tags: { environment: 'production', team: 'frontend' },
          created: new Date('2024-01-01'),
          metrics: { cpu: 65, memory: 78, network: 45 },
        },
        {
          id: '2',
          name: 'db-cluster-main',
          type: 'database',
          provider: 'aws',
          region: 'us-east-1',
          status: 'running',
          cost: 450.00,
          specs: { cpu: 8, memory: 32, storage: 500 },
          tags: { environment: 'production', team: 'backend' },
          created: new Date('2024-01-02'),
          metrics: { cpu: 45, memory: 82, network: 30 },
        },
        {
          id: '3',
          name: 'ml-training-node',
          type: 'compute',
          provider: 'gcp',
          region: 'us-central1',
          status: 'stopped',
          cost: 0,
          specs: { cpu: 16, memory: 64, storage: 1000 },
          tags: { environment: 'development', team: 'ml' },
          created: new Date('2024-01-05'),
        },
        {
          id: '4',
          name: 'storage-bucket-assets',
          type: 'storage',
          provider: 'azure',
          region: 'eastus',
          status: 'running',
          cost: 25.00,
          specs: { storage: 5000 },
          tags: { environment: 'production', team: 'media' },
          created: new Date('2024-01-03'),
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'aws': return <AWSIcon />;
      case 'azure': return <AzureIcon />;
      case 'gcp': return <GCPIcon />;
      case 'onprem': return <OnPremIcon />;
      default: return <CloudIcon />;
    }
  };

  const getProviderColor = (type: string) => {
    switch (type) {
      case 'aws': return '#FF9900';
      case 'azure': return '#0078D4';
      case 'gcp': return '#4285F4';
      case 'ovh': return '#123F6D';
      case 'onprem': return theme.palette.grey[600];
      default: return theme.palette.primary.main;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'error':
      case 'stopped': return theme.palette.error.main;
      case 'pending': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const handleResourceAction = (action: string, resource: CloudResource) => {
    console.log(`Action ${action} on resource ${resource.id}`);
    // Implement resource actions
  };

  const totalCost = providers.reduce((sum, p) => sum + p.monthlyCost, 0);
  const totalResources = providers.reduce((sum, p) => 
    sum + p.resources.compute + p.resources.storage + p.resources.network + p.resources.database, 0
  );

  const costByProvider = providers.map(p => ({
    name: p.name,
    value: p.monthlyCost,
    color: getProviderColor(p.type),
  }));

  const resourceDistribution = [
    { name: 'Compute', value: providers.reduce((sum, p) => sum + p.resources.compute, 0) },
    { name: 'Storage', value: providers.reduce((sum, p) => sum + p.resources.storage, 0) },
    { name: 'Network', value: providers.reduce((sum, p) => sum + p.resources.network, 0) },
    { name: 'Database', value: providers.reduce((sum, p) => sum + p.resources.database, 0) },
  ];

  const speedDialActions = [
    { icon: <ComputeIcon />, name: 'New Instance', action: 'create_instance' },
    { icon: <StorageIcon />, name: 'New Storage', action: 'create_storage' },
    { icon: <NetworkIcon />, name: 'New Network', action: 'create_network' },
    { icon: <CloudIcon />, name: 'Connect Provider', action: 'connect_provider' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Multi-Cloud Manager
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Unified management for all your cloud resources
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadResources}>
            Sync All
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
            Add Resource
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})` }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {providers.filter(p => p.connected).length}/{providers.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Connected Clouds
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <CloudIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {totalResources}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Resources
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <ComputeIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    ${totalCost.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Monthly Cost
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <CostIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    98.5%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Uptime
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <PerformanceIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cloud Providers */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Cloud Providers
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {providers.map(provider => (
          <Grid item xs={12} md={6} lg={3} key={provider.id}>
            <Card 
              sx={{ 
                position: 'relative',
                border: selectedProvider === provider.id ? `2px solid ${getProviderColor(provider.type)}` : 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
              }}
              onClick={() => setSelectedProvider(provider.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ bgcolor: getProviderColor(provider.type), color: 'white' }}>
                    {getProviderIcon(provider.type)}
                  </Avatar>
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip 
                      label={provider.status}
                      size="small"
                      sx={{ 
                        bgcolor: alpha(getStatusColor(provider.status), 0.1),
                        color: getStatusColor(provider.status),
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  {provider.name}
                </Typography>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Monthly Cost
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ${provider.monthlyCost.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Tooltip title="Compute">
                    <Chip 
                      icon={<ComputeIcon />} 
                      label={provider.resources.compute} 
                      size="small" 
                      variant="outlined"
                    />
                  </Tooltip>
                  <Tooltip title="Storage">
                    <Chip 
                      icon={<StorageIcon />} 
                      label={provider.resources.storage} 
                      size="small" 
                      variant="outlined"
                    />
                  </Tooltip>
                  <Tooltip title="Network">
                    <Chip 
                      icon={<NetworkIcon />} 
                      label={provider.resources.network} 
                      size="small" 
                      variant="outlined"
                    />
                  </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {provider.lastSync ? `Synced ${provider.lastSync.toLocaleTimeString()}` : 'Not synced'}
                  </Typography>
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCards({ ...expandedCards, [provider.id]: !expandedCards[provider.id] });
                    }}
                  >
                    {expandedCards[provider.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                <Collapse in={expandedCards[provider.id]}>
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><KeyIcon fontSize="small" /></ListItemIcon>
                        <ListItemText 
                          primary="Credentials"
                          secondary={provider.credentials?.configured ? 'Configured' : 'Not configured'}
                        />
                        <ListItemSecondaryAction>
                          <Switch checked={provider.connected} size="small" />
                        </ListItemSecondaryAction>
                      </ListItem>
                      {provider.credentials?.expiresAt && (
                        <ListItem>
                          <ListItemText 
                            inset
                            secondary={`Expires: ${provider.credentials.expiresAt.toLocaleDateString()}`}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Analytics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Cost Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={costByProvider}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${value}`}
                >
                  {costByProvider.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resource Types
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={resourceDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <Bar dataKey="value" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Resources Table */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab label="All Resources" />
        <Tab label="Compute" icon={<ComputeIcon />} iconPosition="start" />
        <Tab label="Storage" icon={<StorageIcon />} iconPosition="start" />
        <Tab label="Network" icon={<NetworkIcon />} iconPosition="start" />
        <Tab label="Cost Analysis" icon={<CostIcon />} iconPosition="start" />
      </Tabs>

      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Resource</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Cost/Month</TableCell>
                <TableCell>Metrics</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resources.map(resource => (
                <TableRow key={resource.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {resource.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {resource.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={resource.type} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: getProviderColor(resource.provider) }}>
                        {getProviderIcon(resource.provider)}
                      </Avatar>
                      <Typography variant="caption">
                        {resource.provider.toUpperCase()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{resource.region}</TableCell>
                  <TableCell>
                    <Chip
                      label={resource.status}
                      size="small"
                      sx={{
                        bgcolor: alpha(getStatusColor(resource.status), 0.1),
                        color: getStatusColor(resource.status),
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={resource.cost > 100 ? 'bold' : 'normal'}>
                      ${resource.cost.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {resource.metrics && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={`CPU: ${resource.metrics.cpu}%`}>
                          <Box sx={{ width: 40 }}>
                            <LinearProgress
                              variant="determinate"
                              value={resource.metrics.cpu}
                              color={resource.metrics.cpu > 80 ? 'error' : 'primary'}
                            />
                          </Box>
                        </Tooltip>
                        <Tooltip title={`Memory: ${resource.metrics.memory}%`}>
                          <Box sx={{ width: 40 }}>
                            <LinearProgress
                              variant="determinate"
                              value={resource.metrics.memory}
                              color={resource.metrics.memory > 80 ? 'error' : 'info'}
                            />
                          </Box>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {resource.status === 'running' ? (
                        <IconButton size="small" onClick={() => handleResourceAction('stop', resource)}>
                          <StopIcon />
                        </IconButton>
                      ) : (
                        <IconButton size="small" onClick={() => handleResourceAction('start', resource)}>
                          <StartIcon />
                        </IconButton>
                      )}
                      <IconButton size="small" onClick={() => setSelectedResource(resource)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleResourceAction('delete', resource)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      )}

      {/* Speed Dial for quick actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {speedDialActions.map(action => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => console.log(action.action)}
          />
        ))}
      </SpeedDial>

      {/* Create Resource Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Resource</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Provider</InputLabel>
                <Select label="Provider">
                  <MenuItem value="aws">AWS</MenuItem>
                  <MenuItem value="azure">Azure</MenuItem>
                  <MenuItem value="gcp">GCP</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Resource Type</InputLabel>
                <Select label="Resource Type">
                  <MenuItem value="compute">Compute Instance</MenuItem>
                  <MenuItem value="storage">Storage</MenuItem>
                  <MenuItem value="database">Database</MenuItem>
                  <MenuItem value="network">Network</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Resource Name" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Region" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Instance Type" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<AddIcon />}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MultiCloudManager;
