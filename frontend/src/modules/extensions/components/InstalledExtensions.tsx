import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  IconButton,
  Switch,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Avatar,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Extension as ExtensionIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Update as UpdateIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  CheckCircle as EnabledIcon,
  Cancel as DisabledIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useExtensionStore } from '../../../store/extensionStore';
import ExtensionDetails from './ExtensionDetails';

const InstalledExtensions: React.FC = () => {
  const theme = useTheme();
  const { installedExtensions, enableExtension, disableExtension, uninstallExtension, updateExtension } = useExtensionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedExtension, setSelectedExtension] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, extension: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedExtension(extension);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExtension(null);
  };

  const handleToggleExtension = (extensionId: string, enabled: boolean) => {
    if (enabled) {
      disableExtension(extensionId);
    } else {
      enableExtension(extensionId);
    }
  };

  const handleUninstall = (extensionId: string) => {
    uninstallExtension(extensionId);
    handleMenuClose();
  };

  const handleUpdate = (extensionId: string) => {
    updateExtension(extensionId);
    handleMenuClose();
  };

  const handleShowDetails = () => {
    setDetailsOpen(true);
    handleMenuClose();
  };

  const filteredExtensions = installedExtensions.filter(ext =>
    ext.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ext.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enabledCount = installedExtensions.filter(ext => ext.enabled).length;
  const updateCount = installedExtensions.filter(ext => ext.hasUpdate).length;

  return (
    <Box>
      {/* Header Stats */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Alert 
          severity="info" 
          sx={{ flex: 1 }}
          icon={<ExtensionIcon />}
        >
          <Typography variant="body2">
            <strong>{installedExtensions.length}</strong> extensions installed • 
            <strong> {enabledCount}</strong> enabled
            {updateCount > 0 && (
              <> • <strong>{updateCount}</strong> updates available</>
            )}
          </Typography>
        </Alert>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search installed extensions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Extensions List */}
      {filteredExtensions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ExtensionIcon sx={{ fontSize: 64, color: theme.palette.action.disabled, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No installed extensions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visit the marketplace to install extensions
          </Typography>
        </Box>
      ) : (
        <List>
          {filteredExtensions.map((extension) => (
            <ListItem
              key={extension.id}
              sx={{
                mb: 1,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <ListItemIcon>
                <Avatar
                  sx={{
                    backgroundColor: extension.enabled
                      ? alpha(theme.palette.success.main, 0.1)
                      : theme.palette.action.disabledBackground,
                    color: extension.enabled
                      ? theme.palette.success.main
                      : theme.palette.action.disabled,
                  }}
                >
                  {extension.icon || <ExtensionIcon />}
                </Avatar>
              </ListItemIcon>

              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">
                      {extension.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      v{extension.version}
                    </Typography>
                    {extension.hasUpdate && (
                      <Chip
                        icon={<UpdateIcon />}
                        label="Update"
                        size="small"
                        color="info"
                        onClick={() => handleUpdate(extension.id)}
                      />
                    )}
                    {extension.author.verified && (
                      <Chip
                        label="Verified"
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {extension.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {extension.categories.slice(0, 3).map((category) => (
                        <Chip
                          key={category}
                          label={category}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </Box>
                }
              />

              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Switch
                    checked={extension.enabled}
                    onChange={() => handleToggleExtension(extension.id, extension.enabled)}
                    color="primary"
                  />
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, extension)}
                    size="small"
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleShowDetails}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => console.log('Settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        {selectedExtension?.hasUpdate && (
          <MenuItem onClick={() => handleUpdate(selectedExtension.id)}>
            <ListItemIcon>
              <UpdateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Update</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleUninstall(selectedExtension?.id)} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Uninstall</ListItemText>
        </MenuItem>
      </Menu>

      {/* Extension Details Dialog */}
      {selectedExtension && (
        <ExtensionDetails
          extension={selectedExtension}
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          onInstall={() => updateExtension(selectedExtension.id)}
        />
      )}
    </Box>
  );
};

export default InstalledExtensions;
