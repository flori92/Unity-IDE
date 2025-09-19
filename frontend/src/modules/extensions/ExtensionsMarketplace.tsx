import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Tab,
  Tabs,
  Badge,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Extension as ExtensionIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import ExtensionCard from './components/ExtensionCard';
import ExtensionDetails from './components/ExtensionDetails';
import InstalledExtensions from './components/InstalledExtensions';
import { useExtensionStore } from '../../store/extensionStore';
import type { Extension } from '../../types/extension';

const ExtensionsMarketplace: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const { extensions, installedExtensions, fetchExtensions, searchExtensions } = useExtensionStore();
  const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchExtensions();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchExtensions(query);
    } else {
      fetchExtensions();
    }
  };

  const handleInstall = async (extension: Extension) => {
    // Installation logic handled by store
    console.log('Installing:', extension.id);
  };

  const handleOpenDetails = (extension: Extension) => {
    setSelectedExtension(extension);
    setDetailsOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Extension Marketplace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Extend your DevOps Unity IDE with powerful extensions
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search extensions..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab 
          label="Marketplace" 
          icon={<ExtensionIcon />} 
          iconPosition="start"
        />
        <Tab 
          label={
            <Badge badgeContent={installedExtensions.length} color="primary">
              Installed
            </Badge>
          }
          icon={<DownloadIcon />}
          iconPosition="start"
        />
        <Tab 
          label="Settings" 
          icon={<SettingsIcon />}
          iconPosition="start"
        />
      </Tabs>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {extensions.map((extension) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={extension.id}>
                <ExtensionCard
                  extension={extension}
                  onInstall={() => handleInstall(extension)}
                  onDetails={() => handleOpenDetails(extension)}
                />
              </Grid>
            ))}
          </Grid>
        )}
        {activeTab === 1 && <InstalledExtensions />}
        {activeTab === 2 && (
          <Box sx={{ p: 2 }}>
            <Typography>Extension settings coming soon...</Typography>
          </Box>
        )}
      </Box>

      {/* Extension Details Dialog */}
      {selectedExtension && (
        <ExtensionDetails
          extension={selectedExtension}
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          onInstall={() => handleInstall(selectedExtension)}
        />
      )}
    </Box>
  );
};

export default ExtensionsMarketplace;
