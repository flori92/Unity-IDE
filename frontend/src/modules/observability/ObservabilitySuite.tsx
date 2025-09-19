import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  LinearProgress,
  Alert,
  Slider,
  Switch,
  FormControlLabel,
  Autocomplete,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Timeline as TimelineIcon,
  ShowChart as MetricsIcon,
  BugReport as LogsIcon,
  AccountTree as TracesIcon,
  NotificationsActive as AlertIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Download as ExportIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as PerformanceIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  QueryStats as QueryIcon,
} from '@mui/icons-material';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  ScatterChart, Scatter, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, 
  Legend, ResponsiveContainer, Brush, ReferenceLine 
} from 'recharts';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  source: string;
  message: string;
  metadata?: Record<string, any>;
  traceId?: string;
  spanId?: string;
}

interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  labels?: Record<string, string>;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
}

interface Trace {
  traceId: string;
  spans: Span[];
  duration: number;
  service: string;
  operation: string;
  status: 'ok' | 'error' | 'cancelled';
  startTime: Date;
}

interface Span {
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  service: string;
  duration: number;
  startTime: Date;
  tags: Record<string, any>;
  logs?: LogEntry[];
  status: 'ok' | 'error';
}

interface Alert {
  id: string;
  name: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'firing' | 'resolved' | 'pending';
  message: string;
  source: string;
  startTime: Date;
  endTime?: Date;
  labels: Record<string, string>;
}

const ObservabilitySuite: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedService, setSelectedService] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [logLevel, setLogLevel] = useState('all');
  const [metricsView, setMetricsView] = useState('combined');
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const chartRef = useRef<any>(null);

  // Mock data
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(),
      level: 'error',
      source: 'api-gateway',
      message: 'Connection timeout to database',
      metadata: { duration: 5000, endpoint: '/api/users' },
      traceId: 'trace-123',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 60000),
      level: 'warn',
      source: 'auth-service',
      message: 'High token validation latency detected',
      metadata: { latency: 250, threshold: 100 },
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 120000),
      level: 'info',
      source: 'payment-service',
      message: 'Payment processed successfully',
      metadata: { amount: 99.99, currency: 'USD' },
    },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      name: 'High CPU Usage',
      severity: 'critical',
      status: 'firing',
      message: 'CPU usage above 90% for 5 minutes',
      source: 'prometheus',
      startTime: new Date(Date.now() - 300000),
      labels: { service: 'api-gateway', instance: 'node-01' },
    },
    {
      id: '2',
      name: 'Memory Pressure',
      severity: 'warning',
      status: 'firing',
      message: 'Memory usage above 80%',
      source: 'prometheus',
      startTime: new Date(Date.now() - 600000),
      labels: { service: 'database', instance: 'db-primary' },
    },
  ]);

  // Generate time series data
  const generateTimeSeriesData = () => {
    const now = Date.now();
    const interval = 60000; // 1 minute
    return Array.from({ length: 60 }, (_, i) => ({
      time: new Date(now - (59 - i) * interval).toLocaleTimeString(),
      cpu: Math.random() * 30 + 50 + Math.sin(i / 10) * 20,
      memory: Math.random() * 20 + 60 + Math.cos(i / 8) * 15,
      requests: Math.floor(Math.random() * 500 + 1000 + Math.sin(i / 15) * 300),
      errors: Math.floor(Math.random() * 10 + Math.cos(i / 12) * 5),
      latency: Math.random() * 50 + 100 + Math.sin(i / 20) * 30,
    }));
  };

  const [metricsData, setMetricsData] = useState(generateTimeSeriesData());

  // Service health data
  const serviceHealth = [
    { service: 'API Gateway', status: 'healthy', uptime: 99.95, responseTime: 45, errorRate: 0.1 },
    { service: 'Auth Service', status: 'warning', uptime: 99.5, responseTime: 120, errorRate: 0.5 },
    { service: 'Database', status: 'critical', uptime: 98.2, responseTime: 250, errorRate: 2.1 },
    { service: 'Cache', status: 'healthy', uptime: 99.99, responseTime: 5, errorRate: 0.01 },
    { service: 'Queue', status: 'healthy', uptime: 99.9, responseTime: 30, errorRate: 0.05 },
  ];

  // Trace data
  const traces: Trace[] = [
    {
      traceId: 'trace-123',
      spans: [
        {
          spanId: 'span-1',
          operationName: 'HTTP GET /api/users',
          service: 'api-gateway',
          duration: 250,
          startTime: new Date(),
          tags: { method: 'GET', path: '/api/users' },
          status: 'ok',
        },
        {
          spanId: 'span-2',
          parentSpanId: 'span-1',
          operationName: 'DB Query',
          service: 'database',
          duration: 180,
          startTime: new Date(),
          tags: { query: 'SELECT * FROM users' },
          status: 'ok',
        },
      ],
      duration: 250,
      service: 'api-gateway',
      operation: 'GET /api/users',
      status: 'ok',
      startTime: new Date(),
    },
  ];

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setMetricsData(generateTimeSeriesData());
        // Add new log entry
        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date(),
          level: ['error', 'warn', 'info', 'debug'][Math.floor(Math.random() * 4)] as any,
          source: ['api-gateway', 'auth-service', 'database', 'cache'][Math.floor(Math.random() * 4)],
          message: 'New log entry from real-time monitoring',
          metadata: { random: Math.random() },
        };
        setLogs(prev => [newLog, ...prev].slice(0, 100));
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      case 'warn': return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case 'info': return <InfoIcon sx={{ color: theme.palette.info.main }} />;
      default: return <SuccessIcon sx={{ color: theme.palette.success.main }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'critical': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const filteredLogs = logs.filter(log => {
    if (logLevel !== 'all' && log.level !== logLevel) return false;
    if (selectedService !== 'all' && log.source !== selectedService) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Observability Suite
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Unified monitoring, logging, and tracing powered by OpenTelemetry
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />}
            label="Auto Refresh"
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} label="Time Range">
              <MenuItem value="5m">Last 5 min</MenuItem>
              <MenuItem value="15m">Last 15 min</MenuItem>
              <MenuItem value="1h">Last 1 hour</MenuItem>
              <MenuItem value="6h">Last 6 hours</MenuItem>
              <MenuItem value="24h">Last 24 hours</MenuItem>
              <MenuItem value="7d">Last 7 days</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={() => setMetricsData(generateTimeSeriesData())}>
            <RefreshIcon />
          </IconButton>
          <IconButton>
            <ExportIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="caption">
                    Error Rate
                  </Typography>
                  <Typography variant="h4">
                    0.5%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingDownIcon sx={{ fontSize: 16, color: theme.palette.success.main, mr: 0.5 }} />
                    <Typography variant="caption" color="success.main">
                      -12% from last hour
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}>
                  <ErrorIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="caption">
                    Avg Response Time
                  </Typography>
                  <Typography variant="h4">
                    125ms
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: theme.palette.warning.main, mr: 0.5 }} />
                    <Typography variant="caption" color="warning.main">
                      +5ms from baseline
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}>
                  <PerformanceIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="caption">
                    Active Alerts
                  </Typography>
                  <Typography variant="h4">
                    {alerts.filter(a => a.status === 'firing').length}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip label={`${alerts.filter(a => a.severity === 'critical').length} Critical`} size="small" color="error" />
                    <Chip label={`${alerts.filter(a => a.severity === 'warning').length} Warning`} size="small" color="warning" />
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                  <AlertIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="caption">
                    Uptime
                  </Typography>
                  <Typography variant="h4">
                    99.95%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <CheckCircle sx={{ fontSize: 16, color: theme.palette.success.main, mr: 0.5 }} />
                    <Typography variant="caption" color="success.main">
                      All systems operational
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                  <SuccessIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Metrics" icon={<MetricsIcon />} iconPosition="start" />
          <Tab label={
            <Badge badgeContent={filteredLogs.length} color="primary" max={99}>
              Logs
            </Badge>
          } icon={<LogsIcon />} iconPosition="start" />
          <Tab label="Traces" icon={<TracesIcon />} iconPosition="start" />
          <Tab label={
            <Badge badgeContent={alerts.filter(a => a.status === 'firing').length} color="error">
              Alerts
            </Badge>
          } icon={<AlertIcon />} iconPosition="start" />
          <Tab label="Service Map" icon={<DashboardIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Content */}
      {activeTab === 0 && (
        <Box>
          {/* Metrics Controls */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <ToggleButtonGroup
              value={metricsView}
              exclusive
              onChange={(_, v) => v && setMetricsView(v)}
              size="small"
            >
              <ToggleButton value="combined">Combined</ToggleButton>
              <ToggleButton value="separate">Separate</ToggleButton>
              <ToggleButton value="comparison">Comparison</ToggleButton>
            </ToggleButtonGroup>
            <Button startIcon={<ZoomInIcon />} size="small">Zoom In</Button>
            <Button startIcon={<ZoomOutIcon />} size="small">Zoom Out</Button>
            <Button startIcon={<ResetIcon />} size="small">Reset</Button>
          </Box>

          {/* Metrics Charts */}
          <Grid container spacing={3}>
            {metricsView === 'combined' ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    System Metrics
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={metricsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="cpu" stroke={theme.palette.primary.main} name="CPU %" />
                      <Line yAxisId="left" type="monotone" dataKey="memory" stroke={theme.palette.info.main} name="Memory %" />
                      <Line yAxisId="right" type="monotone" dataKey="requests" stroke={theme.palette.success.main} name="Requests/min" />
                      <Line yAxisId="right" type="monotone" dataKey="errors" stroke={theme.palette.error.main} name="Errors/min" />
                      <Brush dataKey="time" height={30} stroke={theme.palette.primary.main} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            ) : (
              <>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>CPU & Memory</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={metricsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip />
                        <Area type="monotone" dataKey="cpu" stackId="1" stroke={theme.palette.primary.main} fill={alpha(theme.palette.primary.main, 0.3)} />
                        <Area type="monotone" dataKey="memory" stackId="1" stroke={theme.palette.info.main} fill={alpha(theme.palette.info.main, 0.3)} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Request Rate & Latency</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={metricsData.slice(-20)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip />
                        <Bar dataKey="requests" fill={theme.palette.success.main} />
                        <Bar dataKey="latency" fill={theme.palette.warning.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </>
            )}

            {/* Service Health */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Service Health</Typography>
                <Grid container spacing={2}>
                  {serviceHealth.map((service) => (
                    <Grid item xs={12} sm={6} md={2.4} key={service.service}>
                      <Card sx={{ 
                        borderLeft: `4px solid ${getStatusColor(service.status)}`,
                        bgcolor: alpha(getStatusColor(service.status), 0.05),
                      }}>
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">
                            {service.service}
                          </Typography>
                          <Typography variant="h6" gutterBottom>
                            {service.uptime}%
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip label={`${service.responseTime}ms`} size="small" />
                            <Chip 
                              label={`${service.errorRate}%`} 
                              size="small"
                              color={service.errorRate > 1 ? 'error' : 'default'}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {/* Logs Filter Bar */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Level</InputLabel>
              <Select value={logLevel} onChange={(e) => setLogLevel(e.target.value)} label="Level">
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="warn">Warning</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="debug">Debug</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Service</InputLabel>
              <Select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} label="Service">
                <MenuItem value="all">All Services</MenuItem>
                <MenuItem value="api-gateway">API Gateway</MenuItem>
                <MenuItem value="auth-service">Auth Service</MenuItem>
                <MenuItem value="database">Database</MenuItem>
                <MenuItem value="cache">Cache</MenuItem>
              </Select>
            </FormControl>
            <Button startIcon={<FilterIcon />}>More Filters</Button>
          </Box>

          {/* Logs List */}
          <Paper sx={{ maxHeight: 600, overflow: 'auto' }}>
            <List>
              {filteredLogs.map((log) => (
                <ListItem key={log.id} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <ListItemAvatar>
                    {getLogIcon(log.level)}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" component="span">
                          {log.timestamp.toLocaleTimeString()}
                        </Typography>
                        <Chip label={log.source} size="small" />
                        {log.traceId && (
                          <Chip 
                            label={`trace: ${log.traceId}`} 
                            size="small" 
                            variant="outlined"
                            onClick={() => setActiveTab(2)}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {log.message}
                        </Typography>
                        {log.metadata && (
                          <Typography variant="caption" color="text.secondary" component="pre">
                            {JSON.stringify(log.metadata, null, 2)}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          {/* Alerts */}
          <Grid container spacing={3}>
            {alerts.map((alert) => (
              <Grid item xs={12} md={6} key={alert.id}>
                <Alert 
                  severity={alert.severity === 'critical' ? 'error' : alert.severity}
                  action={
                    <Box>
                      <Button size="small">Acknowledge</Button>
                      <Button size="small">Silence</Button>
                    </Box>
                  }
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {alert.name}
                  </Typography>
                  <Typography variant="body2">
                    {alert.message}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    {Object.entries(alert.labels).map(([key, value]) => (
                      <Chip key={key} label={`${key}: ${value}`} size="small" />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Started: {alert.startTime.toLocaleString()}
                  </Typography>
                </Alert>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ObservabilitySuite;
