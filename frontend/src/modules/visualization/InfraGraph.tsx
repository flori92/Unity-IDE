import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, CircularProgress, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip, TextField, Slider } from '@mui/material';
import { useNotificationStore } from '../../store/notificationStore';
import { localBackend } from '../../services/localBackendService';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

const nodeColors: Record<string, string> = {
  host: '#1976d2',
  docker: '#2496ed',
  k8s: '#326ce5',
  service: '#43a047',
};
// Helpers pour badges et tooltips
function getStatusColor(status: string) {
  switch (status) {
    case 'Running': return 'success';
    case 'Pending': return 'warning';
    case 'Failed': return 'error';
    case 'Stopped': return 'default';
    default: return 'default';
  }
}

function NodeBadge({ node }: { node: Node }) {
  if (node.id.startsWith('docker-') && node.data.metrics) {
    const { cpuUsage, memoryUsage, memoryLimit } = node.data.metrics;
    return (
      <Tooltip title={<>
        <div>CPU: {cpuUsage?.toFixed(1)}%</div>
        <div>Mémoire: {((memoryUsage/1024/1024)||0).toFixed(1)} Mo / {((memoryLimit/1024/1024)||0).toFixed(1)} Mo</div>
      </>}>
        <Chip size="small" label={`CPU ${cpuUsage?.toFixed(1)}%`} color="primary" sx={{ ml: 1 }} />
      </Tooltip>
    );
  }
  if (node.id.startsWith('k8s-')) {
    const status = node.data.status || 'Unknown';
    return (
      <Tooltip title={<>
        <div>Statut: {status}</div>
      </>}>
        <Chip size="small" label={status} color={getStatusColor(status)} sx={{ ml: 1 }} />
      </Tooltip>
    );
  }
  return null;
}

function makeNodesAndEdges(data: any) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  // Host node
  nodes.push({ id: 'host', data: { label: 'Host' }, position: { x: 0, y: 200 }, style: { background: nodeColors.host, color: '#fff' } });
  let x = 200;
  // Docker containers
  (data.containers || []).forEach((c: any) => {
    nodes.push({ id: 'docker-' + c.id, data: { label: c.name }, position: { x, y: 100 }, style: { background: nodeColors.docker, color: '#fff' } });
    edges.push({ id: 'e-host-docker-' + c.id, source: 'host', target: 'docker-' + c.id });
    x += 200;
  });
  // K8s pods
  x = 200;
  (data.pods || []).forEach((p: any) => {
    nodes.push({ id: 'k8s-' + p.name, data: { label: p.name }, position: { x, y: 350 }, style: { background: nodeColors.k8s, color: '#fff' } });
    edges.push({ id: 'e-host-k8s-' + p.name, source: 'host', target: 'k8s-' + p.name });
    x += 200;
  });
  // Services
  x = 200;
  (data.services || []).forEach((s: any) => {
    nodes.push({ id: 'svc-' + s.name, data: { label: s.name }, position: { x, y: 500 }, style: { background: nodeColors.service, color: '#fff' } });
    edges.push({ id: 'e-k8s-svc-' + s.name, source: 'host', target: 'svc-' + s.name });
    x += 200;
  });
  return { nodes, edges };
}


const InfraGraph: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [graph, setGraph] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });
  const metricsRef = useRef<any>({});
  const k8sStatusRef = useRef<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Node | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [logsOpen, setLogsOpen] = useState(false);
  const [execResult, setExecResult] = useState<string | null>(null);
  const [execOpen, setExecOpen] = useState(false);
  const [execCmd, setExecCmd] = useState('');
  const [scaleOpen, setScaleOpen] = useState(false);
  const [scaleValue, setScaleValue] = useState(1);
  const [rollingOpen, setRollingOpen] = useState(false);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    let unsubMetrics: (() => void) | null = null;
    let unsubK8s: (() => void) | null = null;
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sys, containers, pods, services] = await Promise.all([
          localBackend.getSystemInfo(),
          localBackend.getContainers().catch(() => []),
          localBackend.getPods().catch(() => []),
          localBackend.getServices().catch(() => []),
        ]);
        // On enrichit les nœuds avec les métriques live si dispo
        const { nodes, edges } = makeNodesAndEdges({ sys, containers, pods, services });
        nodes.forEach((node) => {
          if (node.id.startsWith('docker-') && metricsRef.current[node.id]) {
            node.data.metrics = metricsRef.current[node.id];
          }
          if (node.id.startsWith('k8s-') && k8sStatusRef.current[node.id]) {
            node.data.status = k8sStatusRef.current[node.id];
          }
        });
        if (mounted) {
          setGraph({ nodes, edges });
        }
      } catch (e: any) {
        setError(e.message || 'Erreur lors du chargement du graphe');
      }
      setLoading(false);
    };
    fetchData();

    // Abonnement aux métriques Docker
    unsubMetrics = localBackend.subscribeToMetrics((data) => {
      // Si data contient des métriques par conteneur (ex: { containers: { id: { cpuUsage, ... } } })
      if (data && typeof data === 'object' && 'containers' in data && data.containers) {
        Object.entries(data.containers).forEach(([id, metrics]: any) => {
          metricsRef.current['docker-' + id] = metrics;
        });
        setGraph((prev) => {
          const nodes = prev.nodes.map((n) =>
            n.id.startsWith('docker-') && metricsRef.current[n.id]
              ? { ...n, data: { ...n.data, metrics: metricsRef.current[n.id] } }
              : n
          );
          return { ...prev, nodes };
        });
      }
      // Sinon, ignore (structure non supportée)
    });

    // Abonnement aux events K8s (statut pod)
    unsubK8s = localBackend.subscribeToK8sEvents((event) => {
      if (!event || !event.object || !event.object.metadata) {
        return;
      }
      const podName = event.object.metadata.name;
      const status = event.object.status?.phase || 'Unknown';
      k8sStatusRef.current['k8s-' + podName] = status;
      setGraph((prev) => {
        const nodes = prev.nodes.map((n) =>
          n.id.startsWith('k8s-') && n.id === 'k8s-' + podName
            ? { ...n, data: { ...n.data, status } }
            : n
        );
        return { ...prev, nodes };
      });
    });

    return () => {
      mounted = false;
      if (unsubMetrics) {
        unsubMetrics();
      }
      if (unsubK8s) {
        unsubK8s();
      }
    };
  }, []);

  // Sélection de nœud
  const onNodeClick = (_event: any, node: Node) => {
    setSelected(node);
    setDetails(node.data);
  };

  // Actions contextuelles
  const handleShowLogs = async () => {
    setLogs(['Chargement...']);
    setLogsOpen(true);
    if (!selected) {
      return;
    }
    if (selected.id.startsWith('docker-')) {
      const id = selected.id.replace('docker-', '');
      try {
        const res = await localBackend.getContainerLogs(id, 100);
        setLogs(res.logs || []);
      } catch (e: any) {
        setLogs([e.message || 'Erreur logs']);
      }
    } else if (selected.id.startsWith('k8s-')) {
      // On suppose que le nom du pod = id, namespace = 'default', container = pod
      const pod = selected.id.replace('k8s-', '');
      try {
        const res = await localBackend.getPodLogs('default', pod, pod, 100);
        setLogs(res.logs || []);
      } catch (e: any) {
        setLogs([e.message || 'Erreur logs pod']);
      }
    } else {
      setLogs(['Pas de logs disponibles pour ce nœud.']);
    }
  };

  const handleExec = async () => {
    if (!selected) {
      return;
    }
    setExecResult('Exécution...');
    try {
      if (selected.id.startsWith('docker-')) {
        const id = selected.id.replace('docker-', '');
        const res = await localBackend.execDockerCommand(id, execCmd.split(' '));
        setExecResult(res.output || res.error || '');
      } else if (selected.id === 'host') {
        const [bin, ...args] = execCmd.split(' ');
        const res = await localBackend.execHostCommand(bin, args);
        setExecResult(res.output || res.error || '');
      } else if (selected.id.startsWith('k8s-')) {
        // Format: namespace, pod, container, commande
        const pod = selected.id.replace('k8s-', '');
        const res = await localBackend.execK8sCommand('default', pod, pod, execCmd.split(' '));
        setExecResult(res.output || res.error || '');
      } else {
        setExecResult('Exécution non supportée pour ce nœud.');
      }
    } catch (e: any) {
      setExecResult(e.message || 'Erreur exec');
    }
  };
  // Actions avancées : restart, stop, remove (Docker/K8s)
  const handleRestart = async () => {
    if (!selected) { return; }
    if (selected.id.startsWith('docker-')) {
      const id = selected.id.replace('docker-', '');
      try {
        await localBackend.restartContainer(id);
        addNotification({
          message: 'Conteneur redémarré !',
          severity: 'success',
          source: 'docker',
        });
      } catch (e: any) {
        addNotification({
          message: e.message || 'Erreur lors du redémarrage',
          severity: 'error',
          source: 'docker',
        });
      }
    } else if (selected.id.startsWith('k8s-')) {
      // Pour K8s, on simule un restart par suppression puis re-création (basique)
      const pod = selected.id.replace('k8s-', '');
      try {
        await localBackend.deletePod(pod, 'default');
        addNotification({
          message: 'Pod supprimé (restart simulé) !',
          severity: 'success',
          source: 'k8s',
        });
      } catch (e: any) {
        addNotification({
          message: e.message || 'Erreur lors du redémarrage du pod',
          severity: 'error',
          source: 'k8s',
        });
      }
    }
  };

  const handleStop = async () => {
    if (!selected) { return; }
    if (selected.id.startsWith('docker-')) {
      const id = selected.id.replace('docker-', '');
      try {
        await localBackend.stopContainer(id);
        addNotification({
          message: 'Conteneur arrêté !',
          severity: 'success',
          source: 'docker',
        });
      } catch (e: any) {
        addNotification({
          message: e.message || 'Erreur lors de l\'arrêt',
          severity: 'error',
          source: 'docker',
        });
      }
    } else if (selected.id.startsWith('k8s-')) {
      // Pour K8s, on arrête le pod (delete)
      const pod = selected.id.replace('k8s-', '');
      try {
        await localBackend.deletePod(pod, 'default');
        addNotification({
          message: 'Pod arrêté (supprimé) !',
          severity: 'success',
          source: 'k8s',
        });
      } catch (e: any) {
        addNotification({
          message: e.message || 'Erreur lors de l\'arrêt du pod',
          severity: 'error',
          source: 'k8s',
        });
      }
    }
  };

  const handleRemove = async () => {
    if (!selected) { return; }
    if (selected.id.startsWith('docker-')) {
      const id = selected.id.replace('docker-', '');
      try {
        await localBackend.removeContainer(id);
        addNotification({
          message: 'Conteneur supprimé !',
          severity: 'success',
          source: 'docker',
        });
      } catch (e: any) {
        addNotification({
          message: e.message || 'Erreur lors de la suppression',
          severity: 'error',
          source: 'docker',
        });
      }
    } else if (selected.id.startsWith('k8s-')) {
      // Pour K8s, suppression du pod
      const pod = selected.id.replace('k8s-', '');
      try {
        await localBackend.deletePod(pod, 'default');
        addNotification({
          message: 'Pod supprimé !',
          severity: 'success',
          source: 'k8s',
        });
      } catch (e: any) {
        addNotification({
          message: e.message || 'Erreur lors de la suppression du pod',
          severity: 'error',
          source: 'k8s',
        });
      }
    }
  };

  // Action scale déploiement K8s
  const handleScale = async () => {
    if (!selected) {
      return;
    }
    const name = selected.data.label;
    try {
      await localBackend.scaleDeployment(name, 'default', scaleValue);
      addNotification({
        message: `Déploiement scalé à ${scaleValue} pods !`,
        severity: 'success',
        source: 'k8s',
      });
      setScaleOpen(false);
    } catch (e: any) {
      addNotification({
        message: e.message || 'Erreur lors du scale',
        severity: 'error',
        source: 'k8s',
      });
    }
  };

  // Action rolling restart déploiement K8s
  const handleRollingRestart = async () => {
    if (!selected) {
      return;
    }
    const name = selected.data.label;
    try {
      await localBackend.rollingRestartDeployment(name, 'default');
      addNotification({
        message: `Rolling restart lancé sur ${name} !`,
        severity: 'success',
        source: 'k8s',
      });
      setRollingOpen(false);
    } catch (e: any) {
      addNotification({
        message: e.message || 'Erreur rolling restart',
        severity: 'error',
        source: 'k8s',
      });
    }
  };

  return (
    <Box sx={{ p: 3, height: 600 }}>
      <Typography variant="h5" gutterBottom>Topologie graphique de l'infrastructure</Typography>
      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && !error && (
        <Paper elevation={2} sx={{ height: 540, p: 1, position: 'relative' }}>
          <ReactFlow nodes={graph.nodes} edges={graph.edges} fitView onNodeClick={onNodeClick}>
            <MiniMap />
            <Controls />
            <Background />
            {/* Badges sur chaque nœud */}
            {graph.nodes.map((node) => (
              <foreignObject key={node.id + '-badge'} x={node.position.x + 120} y={node.position.y - 20} width={80} height={40} style={{ pointerEvents: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <NodeBadge node={node} />
                </div>
              </foreignObject>
            ))}
          </ReactFlow>
          {selected && (
            <Box sx={{ position: 'absolute', top: 16, right: 16, bgcolor: '#fff', p: 2, borderRadius: 2, boxShadow: 3, minWidth: 260 }}>
              <Typography variant="subtitle1" fontWeight={600}>{selected.data.label}</Typography>
              <Typography variant="body2" color="text.secondary">ID: {selected.id}</Typography>
              <Box sx={{ mt: 1, mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button size="small" onClick={handleShowLogs}>Logs</Button>
                <Button size="small" onClick={() => setExecOpen(true)}>Exécuter</Button>
                <Button size="small" color="warning" onClick={handleRestart}>Redémarrer</Button>
                <Button size="small" color="secondary" onClick={handleStop}>Arrêter</Button>
                <Button size="small" color="error" onClick={handleRemove}>Supprimer</Button>
                {selected.id.startsWith('k8s-') && (
                  <>
                    <Button size="small" color="info" onClick={() => setScaleOpen(true)}>Scaler</Button>
                    <Button size="small" color="info" onClick={() => setRollingOpen(true)}>Rolling Restart</Button>
                  </>
                )}
                <Button size="small" onClick={() => setSelected(null)}>Fermer</Button>
              </Box>
          {/* Dialog scale K8s */}
          <Dialog open={scaleOpen} onClose={() => setScaleOpen(false)} maxWidth="xs">
            <DialogTitle>Scaler le déploiement</DialogTitle>
            <DialogContent>
              <Typography>Nombre de pods :</Typography>
              <Slider min={1} max={20} value={scaleValue} onChange={(_, v) => setScaleValue(Number(v))} valueLabelDisplay="auto" sx={{ mt: 2, mb: 2 }} />
              <TextField type="number" label="Pods" value={scaleValue} onChange={e => setScaleValue(Number(e.target.value))} inputProps={{ min: 1, max: 20 }} fullWidth />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setScaleOpen(false)}>Annuler</Button>
              <Button onClick={handleScale} variant="contained">Valider</Button>
            </DialogActions>
          </Dialog>
          {/* Dialog rolling restart K8s */}
          <Dialog open={rollingOpen} onClose={() => setRollingOpen(false)} maxWidth="xs">
            <DialogTitle>Rolling Restart du déploiement</DialogTitle>
            <DialogContent>
              <Typography>Confirmer le rolling restart sur <b>{selected?.data.label}</b> ?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRollingOpen(false)}>Annuler</Button>
              <Button onClick={handleRollingRestart} variant="contained" color="warning">Rolling Restart</Button>
            </DialogActions>
          </Dialog>
              <pre style={{ fontSize: 12, maxHeight: 120, overflow: 'auto', background: '#f5f5f5', padding: 8 }}>{JSON.stringify(details, null, 2)}</pre>
            </Box>
          )}
          <Dialog open={logsOpen} onClose={() => setLogsOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>Logs du nœud</DialogTitle>
            <DialogContent>
              <pre style={{ fontSize: 13, maxHeight: 400, overflow: 'auto' }}>{logs.join('\n')}</pre>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setLogsOpen(false)}>Fermer</Button>
            </DialogActions>
          </Dialog>
          <Dialog open={execOpen} onClose={() => setExecOpen(false)} maxWidth="sm">
            <DialogTitle>Exécuter une commande sur {selected?.data.label}</DialogTitle>
            <DialogContent>
              <input
                style={{ width: '100%', fontSize: 15, marginBottom: 8 }}
                value={execCmd}
                onChange={e => setExecCmd(e.target.value)}
                placeholder="Commande à exécuter (ex: ls -l /)"
              />
              {execResult && <pre style={{ fontSize: 13, background: '#f5f5f5', padding: 8 }}>{execResult}</pre>}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setExecOpen(false)}>Fermer</Button>
              <Button onClick={handleExec} variant="contained">Exécuter</Button>
            </DialogActions>
          </Dialog>
        </Paper>
      )}
    </Box>
  );
};

export default InfraGraph;
