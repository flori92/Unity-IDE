import React, { useState, useEffect } from 'react';
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
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Computer as DockerIcon,
  CloudQueue as K8sIcon,
  PlayCircleOutline as AnsibleIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { localBackend } from '../../services/localBackendService';

const Dashboard: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [containers, setContainers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendHealth, setBackendHealth] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
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
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setBackendHealth(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement du tableau de bord...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🚀 DevOps Unity IDE
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tableau de bord de votre infrastructure DevOps
        </Typography>
      </Box>

      {/* Backend Status */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Alert 
            severity={backendHealth ? "success" : "error"} 
            sx={{ mb: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={loadDashboardData}
                startIcon={<RefreshIcon />}
              >
                Actualiser
              </Button>
            }
          >
            {backendHealth 
              ? "✅ Backend local connecté et opérationnel" 
              : "❌ Backend local non disponible - Vérifiez que le serveur est démarré"
            }
          </Alert>
        </Grid>
      </Grid>

      {/* System Info */}
      {systemInfo && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <InfoIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Système</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  OS: {systemInfo.os} ({systemInfo.arch})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  CPU: {systemInfo.cpuCores} cœurs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DockerIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Docker</Typography>
                  <Chip 
                    size="small" 
                    label={systemInfo.dockerRunning ? "Connecté" : "Déconnecté"}
                    color={systemInfo.dockerRunning ? "success" : "error"}
                    sx={{ ml: 'auto' }}
                  />
                </Box>
                {systemInfo.dockerVersion && (
                  <Typography variant="body2" color="text.secondary">
                    Version: {systemInfo.dockerVersion}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Containers: {containers.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <K8sIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Kubernetes</Typography>
                  <Chip 
                    size="small" 
                    label={systemInfo.k8sConnected ? "Config trouvée" : "Non configuré"}
                    color={systemInfo.k8sConnected ? "success" : "default"}
                    sx={{ ml: 'auto' }}
                  />
                </Box>
                {systemInfo.k8sVersion && (
                  <Typography variant="body2" color="text.secondary">
                    Version: {systemInfo.k8sVersion}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Docker Containers */}
      {containers.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                🐳 Containers Docker ({containers.length})
              </Typography>
              <List>
                {containers.slice(0, 5).map((container) => (
                  <ListItem key={container.id}>
                    <ListItemIcon>
                      {container.state === 'running' ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <ErrorIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={container.name}
                      secondary={`${container.image} - ${container.status}`}
                    />
                    <Chip
                      size="small"
                      label={container.state}
                      color={container.state === 'running' ? 'success' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
              {containers.length > 5 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  ... et {containers.length - 5} autres containers
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              🎯 Actions rapides
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="outlined" startIcon={<DockerIcon />}>
                Gérer Docker
              </Button>
              <Button variant="outlined" startIcon={<K8sIcon />}>
                Kubernetes
              </Button>
              <Button variant="outlined" startIcon={<AnsibleIcon />}>
                Ansible
              </Button>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadDashboardData}>
                Actualiser
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
