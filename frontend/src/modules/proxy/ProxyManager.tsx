import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  List as LogsIcon,
  Cloud as CloudIcon,
  Save as SaveIcon,
  RocketLaunch as ApplyIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { localBackend, ProxyHost, ProxyStatus } from '../../services/localBackendService';

const emptyHost: Omit<ProxyHost, 'id'> & { id?: string } = {
  id: undefined,
  serverName: '',
  targetUrl: '',
  sslMode: 'none',
  enabled: true,
};

const ProxyManager: React.FC = () => {
  const [status, setStatus] = useState<ProxyStatus | null>(null);
  const [hosts, setHosts] = useState<ProxyHost[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState(emptyHost);
  const [submitting, setSubmitting] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [logs, setLogs] = useState('');

  const columns = useMemo<GridColDef<ProxyHost>[]>(() => [
    { field: 'serverName', headerName: 'Domaine', flex: 1, minWidth: 180 },
    { field: 'targetUrl', headerName: 'Cible', flex: 1, minWidth: 220 },
    { field: 'sslMode', headerName: 'SSL', width: 140, valueFormatter: p => ({ none: 'Aucun', letsencrypt: "Let's Encrypt", custom: 'Custom' }[p.value as string] || p.value as string) },
    { field: 'enabled', headerName: 'Activé', width: 120, renderCell: (p) => p.value ? <Chip size="small" label="Oui" color="success"/> : <Chip size="small" label="Non"/> },
    {
      field: 'actions', headerName: 'Actions', width: 180, sortable: false, filterable: false,
      renderCell: (p) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Modifier">
            <IconButton size="small" onClick={() => onEdit(p.row)}><EditIcon/></IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton size="small" color="error" onClick={() => onDelete(p.row.id)}><DeleteIcon/></IconButton>
          </Tooltip>
        </Box>
      )
    },
  ], []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, h] = await Promise.all([
        localBackend.getProxyStatus(),
        localBackend.getProxyHosts(),
      ]);
      setStatus(s);
      setHosts(h);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const onEdit = (h?: ProxyHost) => {
    if (h) setForm(h);
    else setForm(emptyHost);
    setOpenForm(true);
  };

  const onDelete = async (id: string) => {
    setLoading(true);
    try {
      await localBackend.deleteProxyHost(id);
      await loadAll();
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    if (!form.serverName || !form.targetUrl) return;
    setSubmitting(true);
    try {
      if (form.id) await localBackend.updateProxyHost(form.id, form);
      else await localBackend.createProxyHost(form);
      setOpenForm(false);
      setForm(emptyHost);
      await loadAll();
    } finally {
      setSubmitting(false);
    }
  };

  const onApply = async () => {
    setLoading(true);
    try {
      await localBackend.applyProxyConfig();
      await loadAll();
    } finally {
      setLoading(false);
    }
  };

  const onReload = async () => {
    setLoading(true);
    try {
      await localBackend.reloadProxy();
      await loadAll();
    } finally {
      setLoading(false);
    }
  };

  const openLogs = async () => {
    setLogsOpen(true);
    const txt = await localBackend.getProxyLogs();
    setLogs(txt || '');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Nginx Proxy Manager</Typography>
          <Typography variant="body2" color="text.secondary">Gérez vos hôtes virtuels et le reverse proxy local</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<LogsIcon/>} onClick={openLogs}>Logs</Button>
          <Button variant="outlined" startIcon={<RefreshIcon/>} onClick={loadAll}>Rafraîchir</Button>
          <Button variant="contained" startIcon={<ApplyIcon/>} onClick={onApply}>Appliquer</Button>
          <Button variant="contained" color="secondary" onClick={() => onEdit()} startIcon={<AddIcon/>}>Nouvel hôte</Button>
        </Box>
      </Box>

      {/* Status */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Statut du Proxy" avatar={<CloudIcon/>} />
            <CardContent>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip size="small" label={status?.dockerAvailable ? 'Docker: OK' : 'Docker: Indispo'} color={status?.dockerAvailable ? 'success' : 'error'} />
                <Chip size="small" label={status?.containerExists ? 'Conteneur: OK' : 'Conteneur: Absent'} color={status?.containerExists ? 'success' : 'warning'} />
                <Chip size="small" label={status?.containerRunning ? 'Running' : 'Stopped'} color={status?.containerRunning ? 'success' : 'default'} />
                <Chip size="small" label={`Hôtes: ${status?.hostsCount ?? 0}`} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Image: {status?.image || 'nginx:alpine'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button size="small" variant="outlined" onClick={onReload}>Reload Nginx</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 120 }}>
            <Typography variant="subtitle1">Instructions rapides</Typography>
            <Typography variant="body2" color="text.secondary">
              Ajoutez un hôte avec un domaine local (ex: dev.local) et une cible (ex: http://host.docker.internal:3000), puis cliquez sur « Appliquer » pour générer la configuration et recharger Nginx.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Hosts list */}
      <Card>
        <CardHeader title="Hôtes configurés" action={<Typography variant="caption" color="text.secondary">{hosts.length} hôtes</Typography>} />
        <CardContent>
          <div style={{ height: 420, width: '100%' }}>
            <DataGrid
              rows={hosts}
              columns={columns}
              getRowId={(r) => r.id}
              loading={loading}
              disableRowSelectionOnClick
              pageSizeOptions={[5, 10, 25]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{form.id ? 'Modifier un hôte' : 'Nouvel hôte'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Domaine (server_name)" value={form.serverName} onChange={(e) => setForm({ ...form, serverName: e.target.value })} placeholder="ex: dev.local" fullWidth />
            <TextField label="Cible (proxy_pass)" value={form.targetUrl} onChange={(e) => setForm({ ...form, targetUrl: e.target.value })} placeholder="ex: http://host.docker.internal:3000" fullWidth />
            <TextField label="SSL Mode" value={form.sslMode} onChange={(e) => setForm({ ...form, sslMode: e.target.value as any })} placeholder="none | letsencrypt | custom" fullWidth />
            <FormControlLabel control={<Switch checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />} label="Activé" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Annuler</Button>
          <Button onClick={onSubmit} variant="contained" startIcon={<SaveIcon/>} disabled={submitting}>
            {form.id ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logs dialog */}
      <Dialog open={logsOpen} onClose={() => setLogsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Logs Nginx Proxy</DialogTitle>
        <DialogContent>
          <Box component="pre" sx={{ maxHeight: 480, overflow: 'auto', backgroundColor: '#0b0b0b', color: '#c8e6c9', p: 2, borderRadius: 1 }}>
            {logs || 'Aucun log.'}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogsOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProxyManager;
