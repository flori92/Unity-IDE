import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Paper,
  Tab,
  Tabs,
  Avatar,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Slider,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  BugReport as ChaosIcon,
  PlayArrow as RunIcon,
  Stop as StopIcon,
  Schedule as ScheduleIcon,
  CheckCircle as SuccessIcon,
  Memory as MemoryIcon,
  Speed as CpuIcon,
  NetworkCheck as NetworkIcon,
  Storage as DiskIcon,
  CloudOff as ServiceIcon,
  Security as SecurityIcon,
  Psychology as AiIcon,
  Timeline as TimelineIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChaosExperiment {
  id: string;
  name: string;
  type: 'cpu' | 'memory' | 'network' | 'disk' | 'pod' | 'service';
  target: string;
  status: 'ready' | 'running' | 'completed' | 'failed';
  config: {
    duration: number;
    intensity: number;
    delay?: number;
  };
  results?: {
    startTime: Date;
    endTime?: Date;
    impact: 'low' | 'medium' | 'high';
    recovered: boolean;
    metrics?: any[];
  };
}

interface GameDay {
  id: string;
  name: string;
  description: string;
  experiments: string[];
  scheduled: Date;
  status: 'planned' | 'running' | 'completed';
  participants: string[];
}

const ChaosEngineering: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [safetyEnabled, setSafetyEnabled] = useState(true);
  
  const [experiments] = useState<ChaosExperiment[]>([
    {
      id: '1',
      name: 'CPU Stress Test',
      type: 'cpu',
      target: 'production-api',
      status: 'completed',
      config: { duration: 300, intensity: 80 },
      results: {
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() - 3000000),
        impact: 'low',
        recovered: true,
      },
    },
    {
      id: '2',
      name: 'Network Latency Injection',
      type: 'network',
      target: 'payment-service',
      status: 'running',
      config: { duration: 600, intensity: 50, delay: 200 },
      results: {
        startTime: new Date(),
        impact: 'medium',
        recovered: false,
      },
    },
    {
      id: '3',
      name: 'Pod Termination',
      type: 'pod',
      target: 'frontend-deployment',
      status: 'ready',
      config: { duration: 60, intensity: 30 },
    },
  ]);

  const [gameDays] = useState<GameDay[]>([
    {
      id: '1',
      name: 'Q1 Resilience Test',
      description: 'Quarterly chaos testing for critical services',
      experiments: ['1', '2', '3'],
      scheduled: new Date(Date.now() + 86400000),
      status: 'planned',
      participants: ['DevOps Team', 'SRE Team', 'Development Team'],
    },
  ]);

  const experimentTemplates = [
    { type: 'cpu', name: 'CPU Stress', icon: <CpuIcon />, description: 'Consume CPU resources' },
    { type: 'memory', name: 'Memory Pressure', icon: <MemoryIcon />, description: 'Fill memory' },
    { type: 'network', name: 'Network Chaos', icon: <NetworkIcon />, description: 'Add latency, packet loss' },
    { type: 'disk', name: 'Disk I/O', icon: <DiskIcon />, description: 'Stress disk operations' },
    { type: 'pod', name: 'Pod Killer', icon: <ServiceIcon />, description: 'Randomly terminate pods' },
    { type: 'service', name: 'Service Down', icon: <ServiceIcon />, description: 'Disable services' },
  ];

  const resilienceScore = 85;
  const experimentsRun = experiments.filter(e => e.status === 'completed').length;
  const successRate = 75;

  const impactData = [
    { name: 'Low Impact', value: 60, color: theme.palette.success.main },
    { name: 'Medium Impact', value: 30, color: theme.palette.warning.main },
    { name: 'High Impact', value: 10, color: theme.palette.error.main },
  ];

  const resilienceTrend = [
    { month: 'Jan', score: 70 },
    { month: 'Feb', score: 75 },
    { month: 'Mar', score: 78 },
    { month: 'Apr', score: 82 },
    { month: 'May', score: 85 },
  ];

  const getExperimentIcon = (type: string) => {
    switch (type) {
      case 'cpu': return <CpuIcon />;
      case 'memory': return <MemoryIcon />;
      case 'network': return <NetworkIcon />;
      case 'disk': return <DiskIcon />;
      case 'pod': return <ServiceIcon />;
      default: return <ChaosIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return theme.palette.info.main;
      case 'running': return theme.palette.warning.main;
      case 'completed': return theme.palette.success.main;
      case 'failed': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const runExperiment = (experiment: ChaosExperiment) => {
    if (!safetyEnabled) {
      alert('Enable safety checks before running experiments!');
      return;
    }
    console.log('Running experiment:', experiment.name);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Chaos Engineering
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Test system resilience through controlled failures
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch 
                checked={safetyEnabled} 
                onChange={(e) => setSafetyEnabled(e.target.checked)}
                color="success"
              />
            }
            label="Safety Checks"
          />
          <Button startIcon={<ScheduleIcon />}>Schedule</Button>
          <Button 
            variant="contained" 
            startIcon={<ChaosIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            New Experiment
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {resilienceScore}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Resilience Score
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <SecurityIcon />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={resilienceScore} 
                sx={{ mt: 1 }}
                color={resilienceScore > 80 ? 'success' : resilienceScore > 60 ? 'warning' : 'error'}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {experimentsRun}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Experiments Run
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <ChaosIcon />
                </Avatar>
              </Box>
              <Typography variant="caption">
                This month: {experiments.filter(e => e.status === 'running').length} running
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {successRate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Recovery Rate
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <SuccessIcon />
                </Avatar>
              </Box>
              <Typography variant="caption">
                Auto-recovery successful
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {gameDays.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Game Days
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <TimelineIcon />
                </Avatar>
              </Box>
              <Typography variant="caption">
                Next: {gameDays[0]?.scheduled.toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Safety Alert */}
      {!safetyEnabled && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Safety Checks Disabled</AlertTitle>
          Chaos experiments will not run without safety checks enabled. This prevents accidental damage to production systems.
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Experiments" />
        <Tab label="Game Days" />
        <Tab label="Analytics" />
        <Tab label="AI Insights" />
      </Tabs>

      {/* Experiments */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {experiments.map(experiment => (
            <Grid item xs={12} md={6} lg={4} key={experiment.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: getStatusColor(experiment.status) }}>
                        {getExperimentIcon(experiment.type)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{experiment.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Target: {experiment.target}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={experiment.status}
                      size="small"
                      sx={{ 
                        bgcolor: alpha(getStatusColor(experiment.status), 0.1),
                        color: getStatusColor(experiment.status),
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Duration: {experiment.config.duration}s
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Intensity: {experiment.config.intensity}%
                    </Typography>
                    {experiment.config.delay && (
                      <Typography variant="body2">
                        Delay: {experiment.config.delay}ms
                      </Typography>
                    )}
                  </Box>

                  {experiment.results && (
                    <Box sx={{ p: 1, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Impact: <Chip label={experiment.results.impact} size="small" />
                      </Typography>
                      <Typography variant="caption" display="block">
                        Recovery: {experiment.results.recovered ? '✅ Successful' : '⚠️ In Progress'}
                      </Typography>
                    </Box>
                  )}

                  {experiment.status === 'running' && (
                    <LinearProgress sx={{ mt: 2 }} />
                  )}
                </CardContent>
                <CardActions>
                  {experiment.status === 'ready' && (
                    <Button 
                      size="small" 
                      startIcon={<RunIcon />}
                      onClick={() => runExperiment(experiment)}
                    >
                      Run
                    </Button>
                  )}
                  {experiment.status === 'running' && (
                    <Button size="small" startIcon={<StopIcon />} color="error">
                      Stop
                    </Button>
                  )}
                  {experiment.status === 'completed' && (
                    <Button size="small" startIcon={<ReportIcon />}>
                      Report
                    </Button>
                  )}
                  <Button size="small">Details</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Game Days */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {gameDays.map(gameDay => (
            <Grid item xs={12} key={gameDay.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h5">{gameDay.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {gameDay.description}
                      </Typography>
                    </Box>
                    <Chip 
                      label={gameDay.status}
                      color={gameDay.status === 'completed' ? 'success' : 'default'}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" gutterBottom>
                        Scheduled
                      </Typography>
                      <Typography variant="body2">
                        {gameDay.scheduled.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" gutterBottom>
                        Experiments ({gameDay.experiments.length})
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {gameDay.experiments.map(id => (
                          <Chip key={id} label={`Exp #${id}`} size="small" />
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" gutterBottom>
                        Participants
                      </Typography>
                      {gameDay.participants.map(p => (
                        <Chip key={p} label={p} size="small" sx={{ mr: 0.5 }} />
                      ))}
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions>
                  <Button size="small">View Plan</Button>
                  <Button size="small">Edit</Button>
                  <Button size="small" startIcon={<RunIcon />}>
                    Start Game Day
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Analytics */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Impact Distribution</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={impactData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {impactData.map((entry, index) => (
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
              <Typography variant="h6" gutterBottom>Resilience Trend</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={resilienceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke={theme.palette.primary.main} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* AI Insights */}
      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <AiIcon />
            </Avatar>
            <Typography variant="h5">AI-Powered Insights</Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Alert severity="info">
                <AlertTitle>Recommendation</AlertTitle>
                Your payment service shows vulnerability to network latency. Consider implementing circuit breakers.
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <Alert severity="warning">
                <AlertTitle>Risk Detected</AlertTitle>
                Database failover hasn't been tested in 45 days. Schedule a controlled test soon.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="success">
                <AlertTitle>Improvement Noted</AlertTitle>
                System resilience improved by 15% after implementing retry mechanisms suggested last month.
              </Alert>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Create Experiment Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Chaos Experiment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Experiment Name" />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Experiment Type</InputLabel>
                <Select label="Experiment Type">
                  {experimentTemplates.map(template => (
                    <MenuItem key={template.type} value={template.type}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {template.icon}
                        <Box>
                          <Typography>{template.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {template.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Target Service" />
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Duration (seconds)</Typography>
              <Slider defaultValue={300} min={60} max={3600} valueLabelDisplay="auto" />
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Intensity (%)</Typography>
              <Slider defaultValue={50} min={10} max={100} valueLabelDisplay="auto" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<ChaosIcon />}>
            Create Experiment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChaosEngineering;
