import { useState, useEffect } from 'react';
// ...import principal déjà présent en haut du fichier...
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools/production';
import { SnackbarProvider } from 'notistack';
import { useThemeStore } from './store/themeStore';
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

function Terminal() {
  const [output, setOutput] = useState<string[]>([]);
  const [command, setCommand] = useState('');

  function handleRun() {
    // Simulation locale, à remplacer par une vraie exécution backend
    setOutput([...output, `$ ${command}`, `Résultat : commande '${command}' exécutée.`]);
    setCommand('');
  }

  return (
    <div className="terminal">
      <h3>Terminal intégré</h3>
      <div className="terminal-output">
  {output.map((line: string, i: number) => <div key={i}>{line}</div>)}
      </div>
      <input
        type="text"
        value={command}
        onChange={e => setCommand(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleRun()}
        placeholder="Entrez une commande..."
      />
      <button onClick={handleRun}>Exécuter</button>
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
      }
      setLoading(false);
    };
    fetchDockerData();
  }, []);

  async function handleStart(id: string) {
    try {
  await localBackend.startContainer(id);
  setContainers(await localBackend.getContainers());
    } catch (err: any) {
      setError(err.message || 'Erreur démarrage');
    }
  }

  async function handleStop(id: string) {
    try {
  await localBackend.stopContainer(id);
  setContainers(await localBackend.getContainers());
    } catch (err: any) {
      setError(err.message || 'Erreur arrêt');
    }
  }

  if (loading) return <div>Chargement Docker...</div>;
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
  // Exemple statique, à remplacer par une vraie API backend
  const pipelines = [
    { id: 'pipe1', name: 'Build & Deploy', status: 'success', jobs: [
      { id: 'job1', name: 'Build', status: 'success' },
      { id: 'job2', name: 'Test', status: 'success' },
      { id: 'job3', name: 'Deploy', status: 'success' },
    ] },
    { id: 'pipe2', name: 'Release', status: 'failed', jobs: [
      { id: 'job4', name: 'Build', status: 'success' },
      { id: 'job5', name: 'Test', status: 'failed' },
      { id: 'job6', name: 'Publish', status: 'pending' },
    ] },
  ];
  return (
    <div className="cicd-module">
      <h2>CI/CD Pipelines</h2>
      {pipelines.map(pipe => (
        <div key={pipe.id} className="pipeline">
          <h3>{pipe.name} <span className={pipe.status}>{pipe.status}</span></h3>
          <ul>
            {pipe.jobs.map(job => (
              <li key={job.id} className={job.status}>
                {job.name} <span>[{job.status}]</span>
                <button>Logs</button>
                <button>Relancer</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function MonitoringModule() {
  // Exemple statique, à remplacer par une vraie API backend
  const metrics = {
    cpu: 42,
    ram: 68,
    disk: 80,
    net: 12,
  };
  const alerts = [
    { id: 1, type: 'CPU', message: 'CPU élevé', severity: 'warning' },
    { id: 2, type: 'RAM', message: 'RAM saturée', severity: 'critical' },
  ];
  return (
    <div className="monitoring-module">
      <h2>Monitoring & Alertes</h2>
      <section>
        <h3>Métriques système</h3>
        <ul>
          <li>CPU : {metrics.cpu}%</li>
          <li>RAM : {metrics.ram}%</li>
          <li>Disque : {metrics.disk}%</li>
          <li>Réseau : {metrics.net} Mo/s</li>
        </ul>
      </section>
      <section>
        <h3>Alertes</h3>
        <ul>
          {alerts.map(a => (
            <li key={a.id} className={a.severity}>
              <strong>{a.type}</strong> : {a.message} [{a.severity}]
              <button>Ack</button>
            </li>
          ))}
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
            <div className="main-layout">
              <aside className="sidebar">
                <ul>
                  {['Dashboard', 'Projets', 'Docker', 'Kubernetes', 'Ansible', 'CI/CD', 'Monitoring', 'Extensions', 'Paramètres'].map((m) => (
                    <li key={m} className={selectedModule === m ? 'active' : ''} onClick={() => handleModuleSelect(m)}>
                      {m}
                    </li>
                  ))}
                </ul>
              </aside>
              <main className="main-content">
                {selectedModule === 'Dashboard' && (
                  <div className="dashboard-placeholder">
                    <h2>Dashboard</h2>
                    <p>Bienvenue sur le tableau de bord Unity DevOps IDE.</p>
                  </div>
                )}
                {selectedModule === 'Projets' && <FileExplorer />}
                {selectedModule === 'Terminal' && <Terminal />}
                {selectedModule === 'Docker' && <DockerModule />}
                {selectedModule === 'CI/CD' && <CICDModule />}
                {selectedModule === 'Monitoring' && <MonitoringModule />}
                {/* Modules à venir : Monitoring, etc. */}
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
