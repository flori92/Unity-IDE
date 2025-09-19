import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools/production';
import { SnackbarProvider } from 'notistack';

// Layout Components
import MainLayout from './components/layout/MainLayout';

// Module Components
import Dashboard from './modules/dashboard/Dashboard';
import AIAssistant from './modules/ai-assistant/AIAssistant';
import SecurityHub from './modules/security/SecurityHub';
import MultiCloudManager from './modules/cloud/MultiCloudManager';
import ObservabilitySuite from './modules/observability/ObservabilitySuite';
import PipelineDesigner from './modules/cicd/PipelineDesigner';
import GitOpsManager from './modules/gitops/GitOpsManager';
import IaCEditor from './modules/iac/IaCEditor';
import CostOptimizer from './modules/cost/CostOptimizer';
import ChaosEngineering from './modules/chaos/ChaosEngineering';

// Stores
import { useThemeStore } from './store/themeStore';
import { useConnectionStore } from './store/connectionStore';
import { useNotificationStore } from './store/notificationStore';

// Services - Commented out for development mode
// import { TauriService } from './services/tauriService';
// import { WebSocketService } from './services/websocketService';

// Types - Commented out as not used
// import { AppTheme } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

function App() {
  const { isDarkMode } = useThemeStore();
  const { initializeConnections } = useConnectionStore();
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
    // WebSocket and Tauri disabled in development mode
    // All services are mocked for demo purposes
    
    // Initialize connections (mocked)
    initializeConnections().then(() => {
      setIsLoading(false);
    });

    // Show welcome notification
    setTimeout(() => {
      addNotification({
        message: 'DevOps Unity IDE is ready',
        severity: 'success',
      });
    }, 1000);

    return () => {
      // Cleanup if needed
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
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/security" element={<SecurityHub />} />
                <Route path="/cloud" element={<MultiCloudManager />} />
                <Route path="/observability" element={<ObservabilitySuite />} />
                <Route path="/cicd" element={<PipelineDesigner />} />
                <Route path="/gitops" element={<GitOpsManager />} />
                <Route path="/iac" element={<IaCEditor />} />
                <Route path="/cost" element={<CostOptimizer />} />
                <Route path="/chaos" element={<ChaosEngineering />} />
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
