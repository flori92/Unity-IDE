import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SnackbarProvider } from 'notistack';

// Layout Components
import MainLayout from './components/layout/MainLayout';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';

// Module Components
import Dashboard from './modules/dashboard/Dashboard';
import DockerModule from './modules/docker/DockerModule';
import KubernetesModule from './modules/kubernetes/KubernetesModule';
import AnsibleModule from './modules/ansible/AnsibleModule';
import WorkflowBuilder from './modules/workflows/WorkflowBuilder';
import ExtensionsMarketplace from './modules/extensions/ExtensionsMarketplace';
import MonitoringDashboard from './modules/monitoring/MonitoringDashboard';
import Settings from './modules/settings/Settings';

// Stores
import { useThemeStore } from './store/themeStore';
import { useConnectionStore } from './store/connectionStore';
import { useNotificationStore } from './store/notificationStore';

// Services
import { TauriService } from './services/tauriService';
import { WebSocketService } from './services/websocketService';

// Types
import { AppTheme } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

function App() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { connections, initializeConnections } = useConnectionStore();
  const { addNotification } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(true);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
      },
      secondary: {
        main: '#f50057',
        light: '#ff5983',
        dark: '#c51162',
      },
      success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
      },
      error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f',
      },
      background: {
        default: isDarkMode ? '#0a0e27' : '#f5f5f5',
        paper: isDarkMode ? '#151932' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDarkMode 
              ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
              : '0 2px 4px rgba(0, 0, 0, 0.1)',
            borderRadius: 12,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  useEffect(() => {
    // Initialize Tauri connection
    TauriService.initialize();
    
    // Initialize WebSocket connection
    WebSocketService.connect('ws://localhost:8080/ws');
    
    // Subscribe to WebSocket events
    WebSocketService.on('notification', (data) => {
      addNotification({
        message: data.message,
        severity: data.severity || 'info',
      });
    });

    WebSocketService.on('metrics_update', (data) => {
      // Update metrics in store
      console.log('Metrics updated:', data);
    });

    // Initialize connections
    initializeConnections().then(() => {
      setIsLoading(false);
    });

    // Listen for Tauri events
    TauriService.listen('app_ready', (event) => {
      console.log('App ready:', event);
      addNotification({
        message: 'DevOps Unity IDE is ready',
        severity: 'success',
      });
    });

    TauriService.listen('monitoring_update', (event) => {
      console.log('Monitoring update:', event);
    });

    return () => {
      WebSocketService.disconnect();
    };
  }, []);

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: theme.palette.background.default,
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: theme.palette.primary.main }}>DevOps Unity IDE</h1>
            <p style={{ color: theme.palette.text.secondary }}>Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider 
          maxSnack={3}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <Router>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/docker/*" element={<DockerModule />} />
                <Route path="/kubernetes/*" element={<KubernetesModule />} />
                <Route path="/ansible/*" element={<AnsibleModule />} />
                <Route path="/workflows/*" element={<WorkflowBuilder />} />
                <Route path="/extensions" element={<ExtensionsMarketplace />} />
                <Route path="/monitoring" element={<MonitoringDashboard />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </MainLayout>
          </Router>
        </SnackbarProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
