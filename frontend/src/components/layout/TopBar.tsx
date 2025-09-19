import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  Avatar,
  useTheme,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Sync as SyncIcon,
  Terminal as TerminalIcon,
  NavigateNext as NavigateNextIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useThemeStore } from '../../store/themeStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useLocation, useNavigate } from 'react-router-dom';

const TopBar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { notifications, unreadCount } = useNotificationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);

  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchor(null);
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      return { label, url };
    });
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      console.log('Search:', searchQuery);
      // Implement search functionality
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: 2,
      }}
    >
      {/* Left Section - Breadcrumbs */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            Home
          </Link>
          {getBreadcrumbs().map((crumb, index) => (
            <Link
              key={index}
              underline="hover"
              color={index === getBreadcrumbs().length - 1 ? 'text.primary' : 'inherit'}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate(crumb.url);
              }}
              sx={{
                fontWeight: index === getBreadcrumbs().length - 1 ? 600 : 400,
              }}
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>

      {/* Center Section - Search */}
      <Box sx={{ flexGrow: 1, maxWidth: 500 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search containers, pods, playbooks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.default,
              borderRadius: 2,
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        />
      </Box>

      {/* Right Section - Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Sync Status */}
        <Tooltip title="Sync Status">
          <Chip
            icon={<SyncIcon sx={{ fontSize: 16 }} />}
            label="Synced"
            size="small"
            color="success"
            variant="outlined"
            sx={{
              height: 28,
              '& .MuiChip-icon': {
                animation: 'spin 2s linear infinite',
              },
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
        </Tooltip>

        {/* Terminal */}
        <Tooltip title="Open Terminal">
          <IconButton size="small">
            <TerminalIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton size="small" onClick={handleNotifOpen}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip title="Toggle Theme">
          <IconButton size="small" onClick={toggleTheme}>
            {isDarkMode ? (
              <LightModeIcon fontSize="small" />
            ) : (
              <DarkModeIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={handleNotifClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
            mt: 1.5,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.slice(0, 5).map((notif, index) => (
            <MenuItem key={index} onClick={handleNotifClose}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%' }}>
                <CircleIcon
                  sx={{
                    fontSize: 8,
                    mt: 0.75,
                    color: 
                      notif.severity === 'error' ? theme.palette.error.main :
                      notif.severity === 'warning' ? theme.palette.warning.main :
                      notif.severity === 'success' ? theme.palette.success.main :
                      theme.palette.info.main,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">{notif.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notif.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
};

export default TopBar;
