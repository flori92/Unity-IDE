/**
 * Kubernetes View - Vue Kubernetes style Lens
 * Contextes, namespaces, pods, deployments, services
 * Intégré avec useKubernetes pour actions temps réel
 */

import React, { useState } from 'react';
import { Box, Typography, Collapse, IconButton, CircularProgress, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { ExpandMore, ChevronRight, Delete, Refresh, ZoomOutMap } from '@mui/icons-material';
import { useKubernetes } from '../../../hooks/useKubernetes';
import { useSnackbar } from 'notistack';

interface K8sResource {
  name: string;
  namespace?: string;
  status: 'running' | 'pending' | 'failed' | 'succeeded';
  ready?: string;
}

interface SectionProps {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, count, children, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Box sx={{ mb: 1 }}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 22,
          px: 1,
          cursor: 'pointer',
          color: '#cccccc',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        {expanded ? (
          <ExpandMore sx={{ fontSize: 16, mr: 0.5 }} />
        ) : (
          <ChevronRight sx={{ fontSize: 16, mr: 0.5 }} />
        )}
        <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
          {title} {count !== undefined && `(${count})`}
        </Typography>
      </Box>
      <Collapse in={expanded}>{children}</Collapse>
    </Box>
  );
};

interface PodItemProps {
  pod: any;
  onDelete: (name: string) => Promise<void>;
}

const PodItem: React.FC<PodItemProps> = ({ pod, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running':
        return '#4ec9b0';
      case 'Pending':
        return '#ce9178';
      case 'Failed':
        return '#f48771';
      case 'Succeeded':
        return '#608b4e';
      default:
        return '#858585';
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete pod ${pod.name}?`)) {
      setLoading(true);
      await onDelete(pod.name);
      setLoading(false);
    }
  };

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 22,
        pl: 3,
        pr: 1,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, overflow: 'hidden' }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: getStatusColor(pod.status),
            flexShrink: 0,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontSize: '13px',
            color: '#cccccc',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {pod.name}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {pod.ready && (
          <Typography variant="caption" sx={{ fontSize: '11px', color: '#858585' }}>
            {pod.ready}
          </Typography>
        )}
        {loading ? (
          <CircularProgress size={14} sx={{ color: '#858585' }} />
        ) : (
          hovered && (
            <IconButton size="small" sx={{ color: '#858585', padding: 0 }} onClick={handleDelete}>
              <Delete sx={{ fontSize: 14 }} />
            </IconButton>
          )
        )}
      </Box>
    </Box>
  );
};

interface DeploymentItemProps {
  deployment: any;
  onScale: (name: string, replicas: number) => Promise<void>;
}

const DeploymentItem: React.FC<DeploymentItemProps> = ({ deployment, onScale }) => {
  const [hovered, setHovered] = useState(false);
  const [showScaleDialog, setShowScaleDialog] = useState(false);
  const [replicas, setReplicas] = useState(deployment.replicas || 1);
  const [loading, setLoading] = useState(false);

  const handleScale = async () => {
    setLoading(true);
    await onScale(deployment.name, replicas);
    setLoading(false);
    setShowScaleDialog(false);
  };

  return (
    <>
      <Box
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 22,
          pl: 3,
          pr: 1,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, overflow: 'hidden' }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#4ec9b0',
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontSize: '13px',
              color: '#cccccc',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {deployment.name}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ fontSize: '11px', color: '#858585' }}>
            {deployment.ready}/{deployment.replicas}
          </Typography>
          {hovered && (
            <IconButton
              size="small"
              sx={{ color: '#858585', padding: 0 }}
              onClick={() => setShowScaleDialog(true)}
            >
              <ZoomOutMap sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>
      </Box>

      <Dialog open={showScaleDialog} onClose={() => setShowScaleDialog(false)}>
        <DialogTitle sx={{ bgcolor: '#252526', color: '#cccccc' }}>Scale Deployment</DialogTitle>
        <DialogContent sx={{ bgcolor: '#1e1e1e', color: '#cccccc', minWidth: 300 }}>
          <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
            Scale {deployment.name} to:
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={replicas}
            onChange={(e) => setReplicas(parseInt(e.target.value) || 1)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#cccccc',
                '& fieldset': { borderColor: '#2d2d30' },
                '&:hover fieldset': { borderColor: '#007acc' },
                '&.Mui-focused fieldset': { borderColor: '#007acc' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#252526' }}>
          <Button onClick={() => setShowScaleDialog(false)} sx={{ color: '#858585' }}>
            Cancel
          </Button>
          <Button onClick={handleScale} disabled={loading} sx={{ color: '#007acc' }}>
            {loading ? 'Scaling...' : 'Scale'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const ResourceItem: React.FC<{ resource: K8sResource }> = ({ resource }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return '#4ec9b0';
      case 'pending':
        return '#ce9178';
      case 'failed':
        return '#f48771';
      case 'succeeded':
        return '#608b4e';
      default:
        return '#858585';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 22,
        pl: 3,
        pr: 1,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, overflow: 'hidden' }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: getStatusColor(resource.status),
            flexShrink: 0,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontSize: '13px',
            color: '#cccccc',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {resource.name}
        </Typography>
      </Box>
      {resource.ready && (
        <Typography variant="caption" sx={{ fontSize: '11px', color: '#858585' }}>
          {resource.ready}
        </Typography>
      )}
    </Box>
  );
};

export const KubernetesView: React.FC = () => {
  const [selectedNamespace, setSelectedNamespace] = useState('default');
  const {
    pods,
    deployments,
    services,
    namespaces,
    loading,
    error,
    loadPods,
    loadDeployments,
    loadServices,
    deletePod,
    scaleDeployment,
  } = useKubernetes(selectedNamespace);

  const { enqueueSnackbar } = useSnackbar();

  const handleDeletePod = async (name: string) => {
    const success = await deletePod(name);
    if (success) {
      enqueueSnackbar('Pod deleted successfully', { variant: 'success' });
    } else {
      enqueueSnackbar('Failed to delete pod', { variant: 'error' });
    }
  };

  const handleScaleDeployment = async (name: string, replicas: number) => {
    const success = await scaleDeployment(name, replicas);
    if (success) {
      enqueueSnackbar(`Deployment scaled to ${replicas} replicas`, { variant: 'success' });
    } else {
      enqueueSnackbar('Failed to scale deployment', { variant: 'error' });
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 2, color: '#f48771' }}>
        <Typography variant="body2">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #2d2d30',
        }}
      >
        <Typography variant="caption" sx={{ color: '#858585', fontSize: '11px' }}>
          {loading ? 'Loading...' : `Namespace: ${selectedNamespace} (${pods.length} pods)`}
        </Typography>
        <IconButton
          size="small"
          sx={{ color: '#858585' }}
          onClick={() => {
            loadPods();
            loadDeployments();
            loadServices();
          }}
          disabled={loading}
        >
          <Refresh sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Contexts */}
      <Section title="Contexts">
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#4ec9b0', fontWeight: 600 }}>
            ● minikube (active)
          </Typography>
        </Box>
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#858585' }}>
            docker-desktop
          </Typography>
        </Box>
      </Section>

      {/* Namespaces */}
      <Section title="Namespaces" count={namespaces.length}>
        {namespaces.map((ns) => (
          <Box
            key={ns}
            onClick={() => setSelectedNamespace(ns)}
            sx={{
              pl: 3,
              py: 0.5,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '13px',
                color: ns === selectedNamespace ? '#4ec9b0' : '#858585',
                fontWeight: ns === selectedNamespace ? 600 : 'normal',
              }}
            >
              {ns === selectedNamespace && '● '}{ns}
            </Typography>
          </Box>
        ))}
      </Section>

      {/* Workloads */}
      <Section title="Workloads">
        {/* Pods */}
        <Section title="Pods" count={pods.length}>
          {pods.map((pod) => (
            <PodItem key={pod.name} pod={pod} onDelete={handleDeletePod} />
          ))}
        </Section>

        {/* Deployments */}
        <Section title="Deployments" count={deployments.length}>
          {deployments.map((deployment) => (
            <DeploymentItem
              key={deployment.name}
              deployment={deployment}
              onScale={handleScaleDeployment}
            />
          ))}
        </Section>

        {/* Services */}
        <Section title="Services" count={services.length} defaultExpanded={false}>
          {services.map((service) => (
            <Box key={service.name} sx={{ pl: 3, py: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: '13px', color: '#cccccc' }}>
                {service.name}
              </Typography>
            </Box>
          ))}
        </Section>
      </Section>

      {/* Config & Storage */}
      <Section title="Config & Storage" defaultExpanded={false}>
        <Section title="ConfigMaps" count={2}>
          <Box sx={{ pl: 3, py: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '13px', color: '#858585' }}>
              app-config
            </Typography>
          </Box>
        </Section>
        <Section title="Secrets" count={1}>
          <Box sx={{ pl: 3, py: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '13px', color: '#858585' }}>
              db-credentials
            </Typography>
          </Box>
        </Section>
      </Section>
    </Box>
  );
};

export default KubernetesView;
