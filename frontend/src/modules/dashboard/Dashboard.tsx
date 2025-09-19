import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Divider,
  Avatar,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import {
  Computer as DockerIcon,
  CloudQueue as K8sIcon,
  PlayCircleOutline as AnsibleIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { localBackend, SystemInfo, Container } from '../../services/localBackendService';

interface MetricsData {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}


const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [containers, setContainers] = useState<Container[]>([]);
  const [metrics, setMetrics] = useState<MetricsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendHealth, setBackendHealth] = useState(false);
  const [expandedContainers, setExpandedContainers] = useState<Set<string>>(new Set());
  const [containerActions, setContainerActions] = useState<Map<string, boolean>>(new Map());
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: { rx: 0, tx: 0 }
  });

  // WebSocket connection for real-time metrics
  useEffect(() => {
    if (backendHealth) {
      localBackend.connectWebSocket();
      const unsubscribe = localBackend.subscribeToMetrics((data) => {
        setRealTimeMetrics({
          cpu: data.cpu || 0,
          memory: data.memory || 0,
          disk: data.disk || 0,
          network: data.network || { rx: 0, tx: 0 }
        });
        
        // Add to metrics history
        setMetrics(prev => {
          const newMetrics = [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            cpu: data.cpu || 0,
            memory: data.memory || 0,
            disk: data.disk || 0,
            network: (data.network?.rx || 0) + (data.network?.tx || 0)
          }].slice(-20); // Keep last 20 points
          return newMetrics;
        });
      });

      return () => {
        unsubscribe();
        localBackend.disconnectWebSocket();
      };
    }
  }, [backendHealth]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000); // More frequent updates
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check backend health
      const healthy = await localBackend.checkHealth();
      setBackendHealth(healthy);

      if (healthy) {
        // Load system info
        const sysInfo = await localBackend.getSystemInfo();
        setSystemInfo(sysInfo);

        // Load Docker containers if available
        if (sysInfo.dockerRunning) {
          try {
            const dockerContainers = await localBackend.getContainers();
            setContainers(dockerContainers);
          } catch (error) {
            console.warn('Docker not available:', error);
          }
        }

        // Load system metrics
        try {
          const systemMetrics = await localBackend.getSystemMetrics();
          setRealTimeMetrics({
            cpu: systemMetrics.cpu || 0,
            memory: systemMetrics.memory || 0,
            disk: systemMetrics.disk || 0,
            network: systemMetrics.network || { rx: 0, tx: 0 }
          });
        } catch (error) {
          console.warn('System metrics not available:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setBackendHealth(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleContainerAction = async (containerId: string, action: 'start' | 'stop' | 'restart') => {
    setContainerActions(prev => new Map(prev.set(containerId, true)));
    
    try {
      switch (action) {
        case 'start':
          await localBackend.startContainer(containerId);
          break;
        case 'stop':
          await localBackend.stopContainer(containerId);
          break;
        case 'restart':
          await localBackend.stopContainer(containerId);
          await new Promise(resolve => setTimeout(resolve, 2000));
          await localBackend.startContainer(containerId);
          break;
      }
      
      // Refresh containers list
      await loadDashboardData();
    } catch (error) {
      console.error(`Failed to ${action} container:`, error);
    } finally {
      setContainerActions(prev => {
        const newMap = new Map(prev);
        newMap.delete(containerId);
        return newMap;
      });
    }
  };

  const toggleContainerExpansion = (containerId: string) => {
    setExpandedContainers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(containerId)) {
        newSet.delete(containerId);
      } else {
        newSet.add(containerId);
      }
      return newSet;
    });
  };

  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <LinearProgress sx={{ width: '100%', mb: 2 }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          🚀 Initialisation du DevOps Unity IDE...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connexion au backend local et chargement des données
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      {/* Header avec status en temps réel */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ 
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              🚀 DevOps Unity IDE
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Centre de contrôle unifié pour votre infrastructure DevOps
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Actualiser les données">
              <IconButton 
                onClick={loadDashboardData}
                color="primary"
                sx={{ 
                  backgroundColor: theme.palette.primary.main + '20',
                  '&:hover': { backgroundColor: theme.palette.primary.main + '30' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Paramètres">
              <IconButton color="default">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Status global */}
        <Alert 
          severity={backendHealth ? "success" : "error"} 
          sx={{ 
            mb: 3,
            '& .MuiAlert-icon': { fontSize: '1.5rem' },
            borderRadius: 2,
            boxShadow: theme.shadows[2]
          }}
          action={
            <Chip 
              label={backendHealth ? "OPÉRATIONNEL" : "HORS LIGNE"}
              color={backendHealth ? "success" : "error"}
              size="small"
              variant="filled"
            />
          }
        >
          {backendHealth 
            ? "🟢 Backend local connecté - Toutes les fonctionnalités sont disponibles" 
            : "🔴 Backend local non disponible - Vérifiez que le serveur Go est démarré sur le port 9090"
          }
        </Alert>
      </Box>

      {/* Métriques système en temps réel */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
            border: `1px solid ${theme.palette.primary.main}30`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              boxShadow: theme.shadows[8] 
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Avatar sx={{ 
                  backgroundColor: theme.palette.primary.main,
                  width: 48,
                  height: 48
                }}>
                  <SpeedIcon />
                </Avatar>
                <Chip
                  size="small"
                  label={realTimeMetrics.cpu > 80 ? "ÉLEVÉ" : realTimeMetrics.cpu > 50 ? "MOYEN" : "NORMAL"}
                  color={realTimeMetrics.cpu > 80 ? "error" : realTimeMetrics.cpu > 50 ? "warning" : "success"}
                  variant="outlined"
                />
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {realTimeMetrics.cpu.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Utilisation CPU
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {systemInfo?.cpuCores || 0} cœurs disponibles
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.main}05 100%)`,
            border: `1px solid ${theme.palette.success.main}30`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              boxShadow: theme.shadows[8] 
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Avatar sx={{ 
                  backgroundColor: theme.palette.success.main,
                  width: 48,
                  height: 48
                }}>
                  <MemoryIcon />
                </Avatar>
                <Chip
                  size="small"
                  label={realTimeMetrics.memory > 80 ? "ÉLEVÉ" : "NORMAL"}
                  color={realTimeMetrics.memory > 80 ? "error" : "success"}
                  variant="outlined"
                />
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {(realTimeMetrics.memory / 1024).toFixed(1)}GB
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Mémoire utilisée
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {systemInfo?.memoryGB?.toFixed(1) || 0}GB total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${theme.palette.warning.main}15 0%, ${theme.palette.warning.main}05 100%)`,
            border: `1px solid ${theme.palette.warning.main}30`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              boxShadow: theme.shadows[8] 
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Avatar sx={{ 
                  backgroundColor: theme.palette.warning.main,
                  width: 48,
                  height: 48
                }}>
                  <StorageIcon />
                </Avatar>
                <Chip
                  size="small"
                  label="DISPONIBLE"
                  color="success"
                  variant="outlined"
                />
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {realTimeMetrics.disk.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Stockage utilisé
              </Typography>
              <Typography variant="caption" color="text.secondary">
                SSD/HDD système
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}05 100%)`,
            border: `1px solid ${theme.palette.info.main}30`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              boxShadow: theme.shadows[8] 
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Avatar sx={{ 
                  backgroundColor: theme.palette.info.main,
                  width: 48,
                  height: 48
                }}>
                  <NetworkIcon />
                </Avatar>
                <Chip
                  size="small"
                  label="ACTIF"
                  color="info"
                  variant="outlined"
                />
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {((realTimeMetrics.network.rx + realTimeMetrics.network.tx) / 1024).toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Réseau MB/s
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ↓{(realTimeMetrics.network.rx / 1024).toFixed(1)} ↑{(realTimeMetrics.network.tx / 1024).toFixed(1)} MB/s
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Services et Infrastructure */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Docker Management */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ backgroundColor: theme.palette.primary.main }}>
                  <DockerIcon />
                </Avatar>
              }
              title="Gestion Docker"
              subheader={`${containers.length} containers • ${containers.filter(c => c.state === 'running').length} actifs`}
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={systemInfo?.dockerRunning ? "CONNECTÉ" : "DÉCONNECTÉ"}
                    color={systemInfo?.dockerRunning ? "success" : "error"}
                    size="small"
                  />
                  <IconButton onClick={loadDashboardData}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
              }
            />
            <CardContent>
              {containers.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Container</TableCell>
                        <TableCell>Image</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {containers.slice(0, 8).map((container) => (
                        <TableRow key={container.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {container.state === 'running' ? (
                                <CheckCircleIcon color="success" fontSize="small" />
                              ) : (
                                <ErrorIcon color="error" fontSize="small" />
                              )}
                              <Typography variant="body2" fontWeight="medium">
                                {container.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {container.image}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={container.state}
                              color={container.state === 'running' ? 'success' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title={container.state === 'running' ? 'Arrêter' : 'Démarrer'}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleContainerAction(
                                    container.id, 
                                    container.state === 'running' ? 'stop' : 'start'
                                  )}
                                  disabled={containerActions.get(container.id)}
                                  color={container.state === 'running' ? 'error' : 'success'}
                                >
                                  {container.state === 'running' ? <StopIcon /> : <PlayIcon />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Redémarrer">
                                <IconButton
                                  size="small"
                                  onClick={() => handleContainerAction(container.id, 'restart')}
                                  disabled={containerActions.get(container.id)}
                                >
                                  <RefreshIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Voir les détails">
                                <IconButton
                                  size="small"
                                  onClick={() => toggleContainerExpansion(container.id)}
                                >
                                  {expandedContainers.has(container.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <DockerIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Aucun container Docker détecté
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vérifiez que Docker est démarré et accessible
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Services Status */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Services DevOps"
              subheader="État des services connectés"
            />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DockerIcon color={systemInfo?.dockerRunning ? 'primary' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Docker Engine"
                    secondary={systemInfo?.dockerVersion || 'Non disponible'}
                  />
                  <Chip
                    size="small"
                    label={systemInfo?.dockerRunning ? 'ACTIF' : 'INACTIF'}
                    color={systemInfo?.dockerRunning ? 'success' : 'error'}
                    variant="outlined"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <K8sIcon color={systemInfo?.k8sConnected ? 'primary' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Kubernetes"
                    secondary={systemInfo?.k8sVersion || 'Configuration non trouvée'}
                  />
                  <Chip
                    size="small"
                    label={systemInfo?.k8sConnected ? 'CONFIGURÉ' : 'NON CONFIGURÉ'}
                    color={systemInfo?.k8sConnected ? 'success' : 'default'}
                    variant="outlined"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <AnsibleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Ansible"
                    secondary="Prêt pour l'automatisation"
                  />
                  <Chip
                    size="small"
                    label="DISPONIBLE"
                    color="info"
                    variant="outlined"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Graphiques de performance */}
      {metrics.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardHeader
                title="Métriques système en temps réel"
                subheader="Évolution des performances sur les 20 dernières minutes"
                action={
                  <Chip
                    icon={<TimelineIcon />}
                    label="TEMPS RÉEL"
                    color="primary"
                    variant="outlined"
                  />
                }
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cpu" stroke="#2196F3" strokeWidth={2} name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="#4CAF50" strokeWidth={2} name="Mémoire %" />
                    <Line type="monotone" dataKey="network" stroke="#FF9800" strokeWidth={2} name="Réseau MB/s" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title="Répartition des ressources"
                subheader="Utilisation actuelle"
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'CPU', value: realTimeMetrics.cpu, fill: COLORS[0] },
                        { name: 'Mémoire', value: realTimeMetrics.memory, fill: COLORS[1] },
                        { name: 'Stockage', value: realTimeMetrics.disk, fill: COLORS[2] },
                        { name: 'Libre', value: Math.max(0, 100 - realTimeMetrics.cpu - realTimeMetrics.memory - realTimeMetrics.disk), fill: COLORS[3] }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    >
                      {[0, 1, 2, 3].map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Actions rapides et modules */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="🎯 Centre de contrôle DevOps"
              subheader="Accès rapide aux modules et fonctionnalités"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={<DockerIcon />}
                    sx={{ 
                      py: 2, 
                      flexDirection: 'column', 
                      gap: 1,
                      '&:hover': { backgroundColor: theme.palette.primary.main + '10' }
                    }}
                  >
                    <Typography variant="subtitle2">Docker</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Gestion des containers
                    </Typography>
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={<K8sIcon />}
                    sx={{ 
                      py: 2, 
                      flexDirection: 'column', 
                      gap: 1,
                      '&:hover': { backgroundColor: theme.palette.success.main + '10' }
                    }}
                  >
                    <Typography variant="subtitle2">Kubernetes</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Orchestration
                    </Typography>
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={<AnsibleIcon />}
                    sx={{ 
                      py: 2, 
                      flexDirection: 'column', 
                      gap: 1,
                      '&:hover': { backgroundColor: theme.palette.warning.main + '10' }
                    }}
                  >
                    <Typography variant="subtitle2">Ansible</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Automatisation
                    </Typography>
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={<SecurityIcon />}
                    sx={{ 
                      py: 2, 
                      flexDirection: 'column', 
                      gap: 1,
                      '&:hover': { backgroundColor: theme.palette.error.main + '10' }
                    }}
                  >
                    <Typography variant="subtitle2">Sécurité</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Audit & Scan
                    </Typography>
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
