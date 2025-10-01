/**
 * Docker View - Vue Docker style VS Code
 * Liste des conteneurs, images, volumes, networks
 */

import React, { useState } from 'react';
import { Box, Typography, Collapse, IconButton } from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  PlayArrow,
  Stop,
  Delete,
  Refresh,
} from '@mui/icons-material';

interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'paused';
  ports: string[];
}

const mockContainers: DockerContainer[] = [
  {
    id: 'abc123',
    name: 'nginx-web',
    image: 'nginx:latest',
    status: 'running',
    ports: ['80:80', '443:443'],
  },
  {
    id: 'def456',
    name: 'postgres-db',
    image: 'postgres:15',
    status: 'running',
    ports: ['5432:5432'],
  },
  {
    id: 'ghi789',
    name: 'redis-cache',
    image: 'redis:7',
    status: 'stopped',
    ports: ['6379:6379'],
  },
];

interface SectionProps {
  title: string;
  count: number;
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
          {title} ({count})
        </Typography>
      </Box>
      <Collapse in={expanded}>{children}</Collapse>
    </Box>
  );
};

const ContainerItem: React.FC<{ container: DockerContainer }> = ({ container }) => {
  const [hovered, setHovered] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return '#4ec9b0';
      case 'stopped':
        return '#858585';
      case 'paused':
        return '#ce9178';
      default:
        return '#cccccc';
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
            bgcolor: getStatusColor(container.status),
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
          {container.name}
        </Typography>
      </Box>

      {hovered && (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {container.status === 'running' ? (
            <IconButton size="small" sx={{ color: '#858585', padding: 0 }}>
              <Stop sx={{ fontSize: 14 }} />
            </IconButton>
          ) : (
            <IconButton size="small" sx={{ color: '#858585', padding: 0 }}>
              <PlayArrow sx={{ fontSize: 14 }} />
            </IconButton>
          )}
          <IconButton size="small" sx={{ color: '#858585', padding: 0 }}>
            <Delete sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export const DockerView: React.FC = () => {
  return (
    <Box>
      {/* Header Actions */}
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
          Docker Desktop Connected
        </Typography>
        <IconButton size="small" sx={{ color: '#858585' }}>
          <Refresh sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Containers Section */}
      <Section title="Containers" count={mockContainers.length}>
        {mockContainers.map((container) => (
          <ContainerItem key={container.id} container={container} />
        ))}
      </Section>

      {/* Images Section */}
      <Section title="Images" count={12}>
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#858585' }}>
            nginx:latest
          </Typography>
        </Box>
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#858585' }}>
            postgres:15
          </Typography>
        </Box>
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#858585' }}>
            redis:7
          </Typography>
        </Box>
      </Section>

      {/* Volumes Section */}
      <Section title="Volumes" count={3} defaultExpanded={false}>
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#858585' }}>
            postgres_data
          </Typography>
        </Box>
      </Section>

      {/* Networks Section */}
      <Section title="Networks" count={2} defaultExpanded={false}>
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#858585' }}>
            bridge
          </Typography>
        </Box>
      </Section>
    </Box>
  );
};

export default DockerView;
