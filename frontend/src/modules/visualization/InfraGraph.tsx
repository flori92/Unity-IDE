import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { localBackend } from '../../services/localBackendService';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

const nodeColors: Record<string, string> = {
  host: '#1976d2',
  docker: '#2496ed',
  k8s: '#326ce5',
  service: '#43a047',
};

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
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Node | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [logsOpen, setLogsOpen] = useState(false);
  const [execResult, setExecResult] = useState<string | null>(null);
  const [execOpen, setExecOpen] = useState(false);
  const [execCmd, setExecCmd] = useState('');

  useEffect(() => {
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
        setGraph(makeNodesAndEdges({ sys, containers, pods, services }));
      } catch (e: any) {
        setError(e.message || 'Erreur lors du chargement du graphe');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Sélection de nœud
  const onNodeClick = (_: any, node: Node) => {
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
        alert('Conteneur redémarré !');
      } catch (e: any) {
        alert(e.message || 'Erreur lors du redémarrage');
      }
    } else if (selected.id.startsWith('k8s-')) {
      // Pour K8s, on simule un restart par suppression puis re-création (basique)
      const pod = selected.id.replace('k8s-', '');
      try {
        await localBackend.deletePod(pod, 'default');
        alert('Pod supprimé (restart simulé) !');
      } catch (e: any) {
        alert(e.message || 'Erreur lors du redémarrage du pod');
      }
    }
  };

  const handleStop = async () => {
    if (!selected) { return; }
    if (selected.id.startsWith('docker-')) {
      const id = selected.id.replace('docker-', '');
      try {
        await localBackend.stopContainer(id);
        alert('Conteneur arrêté !');
      } catch (e: any) {
        alert(e.message || 'Erreur lors de l\'arrêt');
      }
    } else if (selected.id.startsWith('k8s-')) {
      // Pour K8s, on arrête le pod (delete)
      const pod = selected.id.replace('k8s-', '');
      try {
        await localBackend.deletePod(pod, 'default');
        alert('Pod arrêté (supprimé) !');
      } catch (e: any) {
        alert(e.message || 'Erreur lors de l\'arrêt du pod');
      }
    }
  };

  const handleRemove = async () => {
    if (!selected) { return; }
    if (selected.id.startsWith('docker-')) {
      const id = selected.id.replace('docker-', '');
      try {
        await localBackend.removeContainer(id);
        alert('Conteneur supprimé !');
      } catch (e: any) {
        alert(e.message || 'Erreur lors de la suppression');
      }
    } else if (selected.id.startsWith('k8s-')) {
      // Pour K8s, suppression du pod
      const pod = selected.id.replace('k8s-', '');
      try {
        await localBackend.deletePod(pod, 'default');
        alert('Pod supprimé !');
      } catch (e: any) {
        alert(e.message || 'Erreur lors de la suppression du pod');
      }
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
                <Button size="small" onClick={() => setSelected(null)}>Fermer</Button>
              </Box>
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
