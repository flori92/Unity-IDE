import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress, Tooltip, Avatar } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
function getStatusVisual(status: string) {
  switch (status?.toLowerCase()) {
    case 'running':
    case 'online':
      return { color: 'success.main', icon: <CheckCircleIcon color="success" />, label: 'En ligne' };
    case 'stopped':
    case 'exited':
      return { color: 'grey.500', icon: <PauseCircleIcon color="disabled" />, label: 'Arrêté' };
    case 'error':
    case 'failed':
      return { color: 'error.main', icon: <ErrorIcon color="error" />, label: 'Erreur' };
    case 'pending':
    case 'warning':
      return { color: 'warning.main', icon: <WarningIcon color="warning" />, label: 'Attention' };
    default:
      return { color: 'info.main', icon: <PauseCircleIcon color="info" />, label: status };
  }
}
import { localBackend } from '../../services/localBackendService';

// Pour une vraie visualisation, on pourra intégrer react-flow, vis-network ou cytoscape
// Ici, version simple "carte" pour MVP

interface Node {
  id: string;
  label: string;
  type: 'host' | 'docker' | 'k8s' | 'service';
  status: string;
  details?: any;
}

const nodeColors: Record<string, string> = {
  host: '#1976d2',
  docker: '#2496ed',
  k8s: '#326ce5',
  service: '#43a047',
};

const InfraOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Récupère les infos système, conteneurs, pods, services
        const [sys, containers, pods, services] = await Promise.all([
          localBackend.getSystemInfo(),
          localBackend.getContainers().catch(() => []),
          localBackend.getPods().catch(() => []),
          localBackend.getServices().catch(() => []),
        ]);
        const n: Node[] = [
          { id: 'host', label: sys.os + ' / ' + sys.arch, type: 'host', status: 'online', details: sys },
          ...containers.map((c: any) => ({ id: 'docker-' + c.id, label: c.name, type: 'docker' as const, status: c.state, details: c })),
          ...pods.map((p: any) => ({ id: 'k8s-' + p.name, label: p.name, type: 'k8s' as const, status: p.status, details: p })),
          ...services.map((s: any) => ({ id: 'svc-' + s.name, label: s.name, type: 'service' as const, status: 'active', details: s })),
        ];
        setNodes(n);
      } catch (e: any) {
        setError(e.message || 'Erreur lors du chargement de l’infrastructure');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Vue d'ensemble de l'infrastructure</Typography>
      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
        {nodes.map(node => {
          const visual = getStatusVisual(node.status);
          return (
            <Tooltip key={node.id} title={<pre style={{ margin: 0 }}>{JSON.stringify(node.details, null, 2)}</pre>}>
              <Paper elevation={3} sx={{ minWidth: 180, p: 2, borderLeft: `6px solid ${nodeColors[node.type] || '#888'}`, position: 'relative', transition: 'box-shadow 0.3s', boxShadow: visual.color === 'error.main' ? 6 : 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: visual.color, width: 28, height: 28 }}>{visual.icon}</Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>{node.label}</Typography>
                </Box>
                <Chip label={node.type.toUpperCase()} size="small" sx={{ bgcolor: nodeColors[node.type], color: '#fff', mt: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{visual.label}</Typography>
              </Paper>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export default InfraOverview;
