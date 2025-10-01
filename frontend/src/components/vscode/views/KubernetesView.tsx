/**
 * Kubernetes View - Vue Kubernetes style Lens
 * Contextes, namespaces, pods, deployments, services
 */

import React, { useState } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import { ExpandMore, ChevronRight } from '@mui/icons-material';

interface K8sResource {
  name: string;
  namespace?: string;
  status: 'running' | 'pending' | 'failed' | 'succeeded';
  ready?: string;
}

const mockPods: K8sResource[] = [
  { name: 'frontend-7d4b9c8f-abc12', namespace: 'default', status: 'running', ready: '1/1' },
  { name: 'backend-5f6g7h8i-def34', namespace: 'default', status: 'running', ready: '1/1' },
  { name: 'postgres-9j0k1l2m-ghi56', namespace: 'default', status: 'running', ready: '1/1' },
];

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
  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: '1px solid #2d2d30',
        }}
      >
        <Typography variant="caption" sx={{ color: '#858585', fontSize: '11px' }}>
          Context: minikube
        </Typography>
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
      <Section title="Namespaces">
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#cccccc' }}>
            default
          </Typography>
        </Box>
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#858585' }}>
            kube-system
          </Typography>
        </Box>
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#858585' }}>
            kube-public
          </Typography>
        </Box>
      </Section>

      {/* Workloads */}
      <Section title="Workloads">
        {/* Pods */}
        <Section title="Pods" count={mockPods.length}>
          {mockPods.map((pod) => (
            <ResourceItem key={pod.name} resource={pod} />
          ))}
        </Section>

        {/* Deployments */}
        <Section title="Deployments" count={3}>
          <ResourceItem
            resource={{ name: 'frontend', namespace: 'default', status: 'running', ready: '1/1' }}
          />
          <ResourceItem
            resource={{ name: 'backend', namespace: 'default', status: 'running', ready: '1/1' }}
          />
          <ResourceItem
            resource={{ name: 'postgres', namespace: 'default', status: 'running', ready: '1/1' }}
          />
        </Section>

        {/* Services */}
        <Section title="Services" count={5} defaultExpanded={false}>
          <Box sx={{ pl: 3, py: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '13px', color: '#cccccc' }}>
              frontend-service
            </Typography>
          </Box>
          <Box sx={{ pl: 3, py: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '13px', color: '#cccccc' }}>
              backend-service
            </Typography>
          </Box>
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
