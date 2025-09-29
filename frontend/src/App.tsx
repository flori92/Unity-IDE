import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import './styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools/production';
import { SnackbarProvider } from 'notistack';
import { useThemeStore } from './store/themeStore';
import AnimatedLoader from './components/AnimatedLoader';
import ContextualTerminal from './components/ContextualTerminal';
import InfraOverview from './modules/visualization/InfraOverview';
import InfraGraph from './modules/visualization/InfraGraph';
import ThemeSettings from './modules/settings/ThemeSettings';
import NotificationCenter from './components/NotificationCenter';
import { useConnectionStore } from './store/connectionStore';
import { useNotificationStore } from './store/notificationStore';

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

function FileExplorer() {
  // Exemple statique, à remplacer par une vraie API
  const files = [
    'main.go',
    'docker_manager.go',
    'k8s_manager.go',
    'App.tsx',
    'index.html',
  ];
  const [selectedFile, setSelectedFile] = useState(files[0]);
  return (
    <div className="file-explorer">
      <aside>
        <h3>Fichiers du projet</h3>
        <ul>
          {files.map(f => (
            <li key={f} className={selectedFile === f ? 'active' : ''} onClick={() => setSelectedFile(f)}>{f}</li>
          ))}
        </ul>
      </aside>
      <CodeEditor file={selectedFile} />
    </div>
  );
}

function CodeEditor({ file }: { file: string }) {
  // Exemple de contenu statique
  const codeSamples: Record<string, string> = {
    'main.go': '// Code Go du serveur\npackage main\nfunc main() {\n  // ...\n}',
    'docker_manager.go': '// Gestion Docker\npackage docker\n// ...',
    'k8s_manager.go': '// Gestion Kubernetes\npackage k8s\n// ...',
    'App.tsx': '// Composant principal React\nexport default function App() {\n  // ...\n}',
    'index.html': '<!DOCTYPE html>\n<html>...</html>',
  };
  return (
    <div className="code-editor">
      <h3>Éditeur : {file}</h3>
      <pre><code>{codeSamples[file] || '// Fichier vide'}</code></pre>
    </div>
  );
}


// ...import inutile supprimé : JSX automatique activé...
import { localBackend, Container } from './services/localBackendService';

function DockerModule() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const fetchDockerData = async () => {
      setLoading(true);
      setError(null);
      try {
        const cts = await localBackend.getContainers();
        const imgs = await localBackend.getImages();
        setContainers(cts);
        setImages(imgs);
      } catch (err: any) {
        setError(err.message || 'Erreur Docker');
        addNotification({
          message: `Erreur Docker : ${err.message || 'Erreur inconnue'}`,
          severity: 'error',
          source: 'docker',
        });
      }
      setLoading(false);
    };
    fetchDockerData();
  }, [addNotification]);

  async function handleStart(id: string) {
    try {
      await localBackend.startContainer(id);
      setContainers(await localBackend.getContainers());
    } catch (err: any) {
      setError(err.message || 'Erreur démarrage');
      addNotification({
        message: `Erreur démarrage conteneur : ${err.message || id}`,
        severity: 'error',
        source: 'docker',
      });
    }
  }

  async function handleStop(id: string) {
    try {
      await localBackend.stopContainer(id);
      setContainers(await localBackend.getContainers());
    } catch (err: any) {
      setError(err.message || 'Erreur arrêt');
      addNotification({
        message: `Erreur arrêt conteneur : ${err.message || id}`,
        severity: 'error',
        source: 'docker',
      });
    }
  }

  if (loading) return <AnimatedLoader text="Chargement Docker..." />;
  if (error) return <div style={{color:'red'}}>Erreur : {error}</div>;

  return (
    <div className="docker-module">
      <h2>Gestion Docker</h2>
      <section>
        <h3>Conteneurs</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Nom</th><th>Image</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {containers.map((c: Container) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.image}</td>
                <td>{c.status}</td>
                <td>
                  <button onClick={() => handleStart(c.id)}>Start</button>
                  <button onClick={() => handleStop(c.id)}>Stop</button>
                  {/* <button>Logs</button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h3>Images</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Repo</th><th>Taille</th></tr>
          </thead>
          <tbody>
            {images.map((img: any) => (
              <tr key={img.id}>
                <td>{img.id}</td>
                <td>{img.repo_tags?.join(', ')}</td>
                <td>{img.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function CICDModule() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const fetchWorkflows = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await localBackend.getWorkflows();
        setPipelines(data.workflows || []);
      } catch (err: any) {
        setError(err.message || 'Erreur CI/CD');
        addNotification({
          message: `Erreur CI/CD : ${err.message || 'Erreur inconnue'}`,
          severity: 'error',
          source: 'cicd',
        });
      }
      setLoading(false);
    };
    fetchWorkflows();
  }, [addNotification]);

  if (loading) return <AnimatedLoader text="Chargement CI/CD..." />;
  if (error) return <div style={{color:'red'}}>Erreur : {error}</div>;

  return (
    <div className="cicd-module">
      <h2>CI/CD Pipelines</h2>
      {pipelines.length === 0 ? (
        <p>Aucun pipeline trouvé.</p>
      ) : (
        pipelines.map((pipe: any) => (
          <div key={pipe.id} className="pipeline">
            <h3>{pipe.name} <span className={pipe.status}>{pipe.status}</span></h3>
            <ul>
              {pipe.jobs?.map((job: any) => (
                <li key={job.id} className={job.status}>
                  {job.name} <span>[{job.status}]</span>
                  <button>Logs</button>
                  <button>Relancer</button>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}


function MonitoringModule() {
  const [metrics, setMetrics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const fetchMonitoring = async () => {
      setLoading(true);
      setError(null);
      try {
        const m = await localBackend.getSystemMetrics();
        const a = await localBackend.getAlerts();
        setMetrics(m);
        setAlerts(a);
        // Notification critique si alerte critique détectée
        const critical = (a || []).find((al: any) => al.severity === 'critical' && al.status === 'firing');
        if (critical) {
          addNotification({
            message: `Alerte critique : ${critical.name || critical.type || 'Incident'} - ${critical.message}`,
            severity: 'error',
            source: 'monitoring',
          });
        }
      } catch (err: any) {
        setError(err.message || 'Erreur monitoring');
      }
      setLoading(false);
    };
    fetchMonitoring();
  }, [addNotification]);

  if (loading) return <AnimatedLoader text="Chargement Monitoring..." />;
  if (error) return <div style={{color:'red'}}>Erreur : {error}</div>;

  return (
    <div className="monitoring-module">
      <h2>Monitoring & Alertes</h2>
      <section>
        <h3>Métriques système</h3>
        <ul>
          <li>CPU : {metrics?.cpu?.usage ?? 'N/A'}%</li>
          <li>RAM : {metrics?.memory?.usage ?? 'N/A'}%</li>
          <li>Disque : {metrics?.disk?.usage ?? 'N/A'}%</li>
          <li>Réseau : {metrics?.network?.rx ?? 'N/A'} Mo/s</li>
        </ul>
      </section>
      <section>
        <h3>Alertes</h3>
        <ul>
          {alerts.length === 0 ? (
            <li>Aucune alerte</li>
          ) : (
            alerts.map((a: any) => (
              <li key={a.id} className={a.severity}>
                <strong>{a.type || a.source}</strong> : {a.message} [{a.severity}]
                <button>Ack</button>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

function App() {
  const { isDarkMode } = useThemeStore();
  const { initializeConnections } = useConnectionStore();
  const { addNotification } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState('Dashboard');

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

  const handleModuleSelect = (module: string) => {
    setSelectedModule(module);
  };

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
          <div className="app-container">
            <div style={{ position: 'fixed', top: 12, right: 24, zIndex: 2000 }}>
              <NotificationCenter />
            </div>
            <div className="main-layout">
              <aside className="sidebar" role="navigation" aria-label="Navigation principale">
                <ul>
                  {['Dashboard', 'Vue Infra', 'Vue Graphique', 'Projets', 'Docker', 'Kubernetes', 'Ansible', 'CI/CD', 'Monitoring', 'Extensions', 'Paramètres'].map((m) => (
                    <li key={m} className={selectedModule === m ? 'active' : ''} onClick={() => handleModuleSelect(m)}>
                      {m}
                    </li>
                  ))}
                </ul>
              </aside>
              <main className="main-content" style={{ position: 'relative', minHeight: 400 }} role="main" aria-live="polite">
                <div
                  key={selectedModule}
                  style={{
                    animation: 'fadein 0.5s',
                    position: 'absolute',
                    width: '100%',
                  }}
                >
                  {selectedModule === 'Dashboard' && (
                    <div className="dashboard-placeholder">
                      <h2>Dashboard</h2>
                      <p>Bienvenue sur le tableau de bord Unity DevOps IDE.</p>
                    </div>
                  )}
                  {selectedModule === 'Vue Graphique' && <InfraGraph />}
                  {selectedModule === 'Vue Infra' && <InfraOverview />}
                  {selectedModule === 'Projets' && <FileExplorer />}
                  {selectedModule === 'Terminal' && <ContextualTerminal />}
                  {selectedModule === 'Docker' && <DockerModule />}
                  {selectedModule === 'CI/CD' && <CICDModule />}
                  {selectedModule === 'Monitoring' && <MonitoringModule />}
                  {selectedModule === 'Paramètres' && <ThemeSettings />}
                  {/* Modules à venir : Monitoring, etc. */}
                </div>
                <style>{`
                  @keyframes fadein {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: none; }
                  }
                `}</style>
              </main>
            </div>
            <footer className="footer">
              <span>Logs | État backend | Version 1.0.0 | Terminal</span>
            </footer>
          </div>
        </SnackbarProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
