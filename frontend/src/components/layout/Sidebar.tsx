import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  IconButton,
  Tooltip,
  Collapse,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Computer as DockerIcon,
  CloudQueue as KubernetesIcon,
  PlayCircleOutline as AnsibleIcon,
  AccountTree as WorkflowIcon,
  Extension as ExtensionIcon,
  Assessment as MonitoringIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  ExpandMore,
  FiberManualRecord as StatusIcon,
} from '@mui/icons-material';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  status?: 'connected' | 'disconnected' | 'warning';
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    id: 'docker',
    title: 'Docker',
    icon: <DockerIcon />,
    path: '/docker',
    status: 'connected',
    subItems: [
      { id: 'containers', title: 'Containers', icon: null, path: '/docker/containers' },
      { id: 'images', title: 'Images', icon: null, path: '/docker/images' },
      { id: 'volumes', title: 'Volumes', icon: null, path: '/docker/volumes' },
      { id: 'networks', title: 'Networks', icon: null, path: '/docker/networks' },
    ],
  },
  {
    id: 'kubernetes',
    title: 'Kubernetes',
    icon: <KubernetesIcon />,
    path: '/kubernetes',
    status: 'disconnected',
    subItems: [
      { id: 'pods', title: 'Pods', icon: null, path: '/kubernetes/pods' },
      { id: 'deployments', title: 'Deployments', icon: null, path: '/kubernetes/deployments' },
      { id: 'services', title: 'Services', icon: null, path: '/kubernetes/services' },
      { id: 'nodes', title: 'Nodes', icon: null, path: '/kubernetes/nodes' },
    ],
  },
  {
    id: 'ansible',
    title: 'Ansible',
    icon: <AnsibleIcon />,
    path: '/ansible',
    status: 'connected',
    subItems: [
      { id: 'playbooks', title: 'Playbooks', icon: null, path: '/ansible/playbooks' },
      { id: 'inventory', title: 'Inventory', icon: null, path: '/ansible/inventory' },
      { id: 'roles', title: 'Roles', icon: null, path: '/ansible/roles' },
      { id: 'vault', title: 'Vault', icon: null, path: '/ansible/vault' },
    ],
  },
  {
    id: 'workflows',
    title: 'Workflows',
    icon: <WorkflowIcon />,
    path: '/workflows',
    badge: 3,
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    icon: <MonitoringIcon />,
    path: '/monitoring',
    status: 'warning',
  },
  {
    id: 'extensions',
    title: 'Extensions',
    icon: <ExtensionIcon />,
    path: '/extensions',
    badge: 2,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [openSubMenus, setOpenSubMenus] = React.useState<string[]>([]);

  const handleToggleSubMenu = (id: string) => {
    setOpenSubMenus((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'connected':
        return theme.palette.success.main;
      case 'disconnected':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isActive = location.pathname.startsWith(item.path);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isOpen = openSubMenus.includes(item.id);

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ display: 'block', px: depth > 0 ? 2 : 0 }}>
          <ListItemButton
            onClick={() => {
              if (hasSubItems) {
                handleToggleSubMenu(item.id);
              } else {
                navigate(item.path);
              }
            }}
            selected={isActive}
            sx={{
              minHeight: 48,
              justifyContent: collapsed ? 'center' : 'initial',
              px: 2.5,
              pl: depth > 0 ? 4 : 2.5,
              backgroundColor: isActive ? `${theme.palette.primary.main}15` : 'transparent',
              '&:hover': {
                backgroundColor: `${theme.palette.primary.main}08`,
              },
              '&.Mui-selected': {
                backgroundColor: `${theme.palette.primary.main}15`,
                borderLeft: `3px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.main}20`,
                },
              },
            }}
          >
            {item.icon && (
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 'auto' : 3,
                  justifyContent: 'center',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                }}
              >
                {collapsed ? (
                  <Tooltip title={item.title} placement="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {item.icon}
                      {item.status && (
                        <StatusIcon
                          sx={{
                            fontSize: 8,
                            color: getStatusColor(item.status),
                            position: 'absolute',
                            top: 5,
                            right: 5,
                          }}
                        />
                      )}
                    </Box>
                  </Tooltip>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {item.icon}
                  </Box>
                )}
              </ListItemIcon>
            )}
            <ListItemText
              primary={item.title}
              sx={{
                opacity: collapsed ? 0 : 1,
                color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
              }}
            />
            {!collapsed && (
              <>
                {item.status && (
                  <StatusIcon
                    sx={{
                      fontSize: 10,
                      color: getStatusColor(item.status),
                      mr: 1,
                    }}
                  />
                )}
                {item.badge && (
                  <Box
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      borderRadius: '12px',
                      px: 1,
                      py: 0.25,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      mr: 1,
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
                {hasSubItems && (isOpen ? <ExpandLess /> : <ExpandMore />)}
              </>
            )}
          </ListItemButton>
        </ListItem>
        {!collapsed && hasSubItems && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems!.map((subItem) => renderMenuItem(subItem, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: theme.palette.primary.main,
                fontSize: '0.875rem',
                fontWeight: 700,
              }}
            >
              DU
            </Avatar>
            <Typography variant="h6" fontWeight={700} color="primary">
              DevOps Unity
            </Typography>
          </Box>
        )}
        <IconButton size="small" onClick={onToggleCollapse}>
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {menuItems.map((item) => renderMenuItem(item))}
      </List>

      {/* Settings */}
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate('/settings')}
            sx={{
              minHeight: 48,
              justifyContent: collapsed ? 'center' : 'initial',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 'auto' : 3,
                justifyContent: 'center',
              }}
            >
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              sx={{ opacity: collapsed ? 0 : 1 }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* User Info */}
      {!collapsed && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Admin User
              </Typography>
              <Typography variant="caption" color="text.secondary">
                admin@devops-unity.io
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;
