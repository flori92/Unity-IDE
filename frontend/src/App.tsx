/**
 * App.tsx - Point d'entrée principal de Unity DevOps IDE
 * Charge l'interface VS Code avec tous les modules intégrés
 */

import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import './styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools/production';
import { SnackbarProvider } from 'notistack';
import { useConnectionStore } from './store/connectionStore';
import { useNotificationStore } from './store/notificationStore';
import VSCodeLayout from './layouts/VSCodeLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

function App() {
  const { initializeConnections } = useConnectionStore();
  const { addNotification } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(true);

  // Thème VS Code
  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#007acc',
      },
      background: {
        default: '#1e1e1e',
        paper: '#252526',
      },
      text: {
        primary: '#cccccc',
        secondary: '#858585',
      },
    },
    typography: {
      fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
          },
          '#root': {
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
          },
        },
      },
    },
  });

  useEffect(() => {
    // Initialiser les connexions
    initializeConnections().then(() => {
      setIsLoading(false);
    });

    // Notification de bienvenue
    setTimeout(() => {
      addNotification({
        message: 'Unity DevOps IDE is ready',
        severity: 'success',
      });
    }, 1000);
  }, [initializeConnections, addNotification]);

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#1e1e1e',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: '#007acc', fontFamily: 'Segoe UI, sans-serif' }}>
              Unity DevOps IDE
            </h1>
            <p style={{ color: '#cccccc' }}>Loading...</p>
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
          <VSCodeLayout />
        </SnackbarProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
