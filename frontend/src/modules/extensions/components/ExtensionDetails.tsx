import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Link,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Info as InfoIcon,
  Description as ReadmeIcon,
  History as ChangelogIcon,
  Security as SecurityIcon,
  Star as StarIcon,
  Download as DownloadIcon,
  GitHub as GitHubIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as VerifiedIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import type { Extension } from '../../../types/extension';

interface ExtensionDetailsProps {
  extension: Extension;
  open: boolean;
  onClose: () => void;
  onInstall: () => void;
}

const ExtensionDetails: React.FC<ExtensionDetailsProps> = ({
  extension,
  open,
  onClose,
  onInstall,
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const formatDownloads = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M downloads`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K downloads`;
    return `${count} downloads`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h2" sx={{ fontSize: 36 }}>
            {extension.icon || '📦'}
          </Typography>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5">{extension.displayName}</Typography>
              {extension.author.verified && (
                <VerifiedIcon sx={{ color: theme.palette.info.main }} />
              )}
              {extension.hasUpdate && (
                <Chip
                  icon={<UpdateIcon />}
                  label="Update Available"
                  size="small"
                  color="info"
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              by {extension.author.name} • v{extension.version}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Stats Bar */}
        <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Rating value={extension.rating} precision={0.1} size="small" readOnly />
            <Typography variant="body2">
              {extension.rating} ({extension.reviews} reviews)
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {formatDownloads(extension.downloads)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {extension.size}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
          <Tab label="Overview" icon={<InfoIcon />} iconPosition="start" />
          <Tab label="README" icon={<ReadmeIcon />} iconPosition="start" />
          <Tab label="Changelog" icon={<ChangelogIcon />} iconPosition="start" />
          <Tab label="Permissions" icon={<SecurityIcon />} iconPosition="start" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ minHeight: 300 }}>
          {activeTab === 0 && (
            <Box>
              <Typography paragraph>{extension.description}</Typography>
              
              <Typography variant="h6" gutterBottom>
                Categories
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {extension.categories.map(cat => (
                  <Chip key={cat} label={cat} variant="outlined" />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {extension.tags.map(tag => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                Resources
              </Typography>
              <List>
                {extension.repository && (
                  <ListItem>
                    <ListItemIcon>
                      <GitHubIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Link href={extension.repository} target="_blank" rel="noopener">
                          Repository <OpenInNewIcon sx={{ fontSize: 14, ml: 0.5 }} />
                        </Link>
                      }
                    />
                  </ListItem>
                )}
                {extension.homepage && (
                  <ListItem>
                    <ListItemIcon>
                      <OpenInNewIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Link href={extension.homepage} target="_blank" rel="noopener">
                          Homepage <OpenInNewIcon sx={{ fontSize: 14, ml: 0.5 }} />
                        </Link>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {extension.readme || 'No README available for this extension.'}
              </Typography>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {extension.changelog || 'No changelog available for this extension.'}
              </Typography>
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                This extension will have access to the following permissions:
              </Alert>
              <List>
                {extension.permissions.map(permission => (
                  <ListItem key={permission}>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={permission}
                      secondary={getPermissionDescription(permission)}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {extension.installed ? (
          extension.hasUpdate ? (
            <Button variant="contained" color="info" startIcon={<UpdateIcon />} onClick={onInstall}>
              Update to v2.0.0
            </Button>
          ) : (
            <Button variant="outlined" disabled>
              Installed
            </Button>
          )
        ) : (
          <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={onInstall}>
            {extension.pricing === 'free' ? 'Install' : `Install for $${extension.price}`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

function getPermissionDescription(permission: string): string {
  const descriptions: Record<string, string> = {
    filesystem: 'Read and write access to your files',
    network: 'Make network requests to external services',
    credentials: 'Access to stored credentials and secrets',
    terminal: 'Execute commands in the terminal',
    docker: 'Interact with Docker containers and images',
    kubernetes: 'Access Kubernetes clusters and resources',
    ansible: 'Execute Ansible playbooks and commands',
    system: 'Access system information and resources',
    clipboard: 'Read and write to the clipboard',
    notifications: 'Show desktop notifications',
  };
  return descriptions[permission] || 'Unknown permission';
}

export default ExtensionDetails;
