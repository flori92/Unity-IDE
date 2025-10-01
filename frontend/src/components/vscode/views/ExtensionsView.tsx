/**
 * Extensions View - Marketplace d'extensions style VS Code
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Rating,
  InputAdornment,
} from '@mui/material';
import { Search, Download, CheckCircle } from '@mui/icons-material';

interface Extension {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  downloads: number;
  rating: number;
  installed: boolean;
  category: string;
}

const mockExtensions: Extension[] = [
  {
    id: 'aws-toolkit',
    name: 'AWS Toolkit',
    description: 'Manage AWS resources directly from Unity IDE',
    author: 'Amazon Web Services',
    version: '1.0.0',
    downloads: 50000,
    rating: 4.5,
    installed: false,
    category: 'Cloud',
  },
  {
    id: 'terraform',
    name: 'Terraform',
    description: 'Infrastructure as Code support for Terraform',
    author: 'HashiCorp',
    version: '2.1.0',
    downloads: 75000,
    rating: 4.8,
    installed: false,
    category: 'IaC',
  },
  {
    id: 'helm',
    name: 'Helm Charts',
    description: 'Kubernetes Helm charts management',
    author: 'CNCF',
    version: '1.5.0',
    downloads: 30000,
    rating: 4.3,
    installed: false,
    category: 'Kubernetes',
  },
  {
    id: 'azure-devops',
    name: 'Azure DevOps',
    description: 'Azure DevOps integration',
    author: 'Microsoft',
    version: '3.0.0',
    downloads: 40000,
    rating: 4.6,
    installed: false,
    category: 'Cloud',
  },
  {
    id: 'gcp-tools',
    name: 'Google Cloud Tools',
    description: 'Google Cloud Platform integration',
    author: 'Google',
    version: '1.2.0',
    downloads: 25000,
    rating: 4.4,
    installed: false,
    category: 'Cloud',
  },
];

export const ExtensionsView: React.FC = () => {
  const [extensions, setExtensions] = useState<Extension[]>(mockExtensions);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExtensions = extensions.filter(
    (ext) =>
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInstall = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) => (ext.id === id ? { ...ext, installed: true } : ext))
    );
  };

  const handleUninstall = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) => (ext.id === id ? { ...ext, installed: false } : ext))
    );
  };

  return (
    <Box sx={{ p: 3, color: '#cccccc' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Extensions Marketplace
      </Typography>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search extensions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            color: '#cccccc',
            bgcolor: '#1e1e1e',
            '& fieldset': { borderColor: '#2d2d30' },
            '&:hover fieldset': { borderColor: '#007acc' },
            '&.Mui-focused fieldset': { borderColor: '#007acc' },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: '#858585' }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Extensions Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
        {filteredExtensions.map((ext) => (
          <Card
            key={ext.id}
            sx={{
              bgcolor: '#252526',
              color: '#cccccc',
              border: '1px solid #2d2d30',
              '&:hover': {
                borderColor: '#007acc',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>
                  {ext.name}
                </Typography>
                {ext.installed && <CheckCircle sx={{ color: '#4ec9b0', fontSize: 20 }} />}
              </Box>

              <Typography variant="caption" sx={{ color: '#858585', display: 'block', mb: 1 }}>
                by {ext.author}
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, minHeight: 40 }}>
                {ext.description}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Rating value={ext.rating} precision={0.1} size="small" readOnly />
                <Typography variant="caption" sx={{ color: '#858585' }}>
                  ({ext.rating})
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Download sx={{ fontSize: 16, color: '#858585' }} />
                <Typography variant="caption" sx={{ color: '#858585' }}>
                  {ext.downloads.toLocaleString()} downloads
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={ext.category} size="small" sx={{ bgcolor: '#007acc', color: '#fff' }} />
                <Chip label={`v${ext.version}`} size="small" sx={{ bgcolor: '#2d2d30', color: '#858585' }} />
              </Box>
            </CardContent>

            <CardActions>
              {ext.installed ? (
                <Button
                  size="small"
                  onClick={() => handleUninstall(ext.id)}
                  sx={{ color: '#f48771' }}
                >
                  Uninstall
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleInstall(ext.id)}
                  sx={{ bgcolor: '#007acc', '&:hover': { bgcolor: '#005a9e' } }}
                >
                  Install
                </Button>
              )}
            </CardActions>
          </Card>
        ))}
      </Box>

      {filteredExtensions.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" sx={{ color: '#858585' }}>
            No extensions found
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ExtensionsView;
