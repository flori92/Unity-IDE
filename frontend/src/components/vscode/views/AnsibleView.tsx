/**
 * Ansible View - Vue Ansible
 * Playbooks, inventaires, rôles
 */

import React, { useState } from 'react';
import { Box, Typography, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ChevronRight, PlayArrow } from '@mui/icons-material';

interface AnsiblePlaybook {
  name: string;
  path: string;
  tasks: number;
}

const mockPlaybooks: AnsiblePlaybook[] = [
  { name: 'deploy.yml', path: '/playbooks/deploy.yml', tasks: 12 },
  { name: 'setup.yml', path: '/playbooks/setup.yml', tasks: 8 },
  { name: 'backup.yml', path: '/playbooks/backup.yml', tasks: 5 },
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

const PlaybookItem: React.FC<{ playbook: AnsiblePlaybook }> = ({ playbook }) => {
  const [hovered, setHovered] = useState(false);

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
          {playbook.name}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '11px', color: '#858585' }}>
          ({playbook.tasks} tasks)
        </Typography>
      </Box>

      {hovered && (
        <IconButton size="small" sx={{ color: '#4ec9b0', padding: 0 }}>
          <PlayArrow sx={{ fontSize: 14 }} />
        </IconButton>
      )}
    </Box>
  );
};

export const AnsibleView: React.FC = () => {
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
          Ansible 2.15.0
        </Typography>
      </Box>

      {/* Playbooks */}
      <Section title="Playbooks" count={mockPlaybooks.length}>
        {mockPlaybooks.map((playbook) => (
          <PlaybookItem key={playbook.path} playbook={playbook} />
        ))}
      </Section>

      {/* Inventory */}
      <Section title="Inventory">
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#cccccc' }}>
            production
          </Typography>
          <Box sx={{ pl: 2, py: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '12px', color: '#858585' }}>
              • web-servers (3)
            </Typography>
          </Box>
          <Box sx={{ pl: 2, py: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '12px', color: '#858585' }}>
              • db-servers (2)
            </Typography>
          </Box>
        </Box>
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#cccccc' }}>
            staging
          </Typography>
          <Box sx={{ pl: 2, py: 0.5 }}>
            <Typography variant="caption" sx={{ fontSize: '12px', color: '#858585' }}>
              • web-servers (1)
            </Typography>
          </Box>
        </Box>
      </Section>

      {/* Roles */}
      <Section title="Roles" count={4} defaultExpanded={false}>
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#cccccc' }}>
            webserver
          </Typography>
        </Box>
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#cccccc' }}>
            database
          </Typography>
        </Box>
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#cccccc' }}>
            monitoring
          </Typography>
        </Box>
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#cccccc' }}>
            security
          </Typography>
        </Box>
      </Section>

      {/* Collections */}
      <Section title="Collections" count={2} defaultExpanded={false}>
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#858585' }}>
            ansible.posix
          </Typography>
        </Box>
        <Box sx={{ pl: 3, py: 0.5 }}>
          <Typography variant="caption" sx={{ fontSize: '13px', color: '#858585' }}>
            community.general
          </Typography>
        </Box>
      </Section>
    </Box>
  );
};

export default AnsibleView;
