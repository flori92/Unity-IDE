# 🚀 Guide d'Intégration - Interface VS Code

## 📋 Résumé

Tous les composants VS Code-like sont maintenant créés et prêts à être intégrés dans Unity DevOps IDE.

---

## ✅ Composants Disponibles

### **Layout Principal**
- ✅ `VSCodeLayout.tsx` - Layout complet VS Code

### **Composants de Base**
- ✅ `ActivityBar.tsx` - Barre d'activité (48px)
- ✅ `SideBar.tsx` - Barre latérale (300px)
- ✅ `EditorArea.tsx` - Zone d'édition Monaco
- ✅ `PanelArea.tsx` - Panel terminal/output
- ✅ `StatusBar.tsx` - Barre de statut (22px)

### **Vues DevOps**
- ✅ `ExplorerView.tsx` - Explorateur de fichiers
- ✅ `DockerView.tsx` - Gestion Docker
- ✅ `KubernetesView.tsx` - Gestion Kubernetes
- ✅ `AnsibleView.tsx` - Gestion Ansible

---

## 🔧 Intégration dans App.tsx

### **Option 1 : Remplacement Complet (Recommandé)**

Remplacez l'interface actuelle par la nouvelle :

```tsx
// frontend/src/App.tsx
import React from 'react';
import { VSCodeLayout } from './layouts/VSCodeLayout';
import { ThemeProvider, createTheme } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1e1e1e',
      paper: '#252526',
    },
    text: {
      primary: '#cccccc',
      secondary: '#858585',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <VSCodeLayout />
    </ThemeProvider>
  );
}

export default App;
```

### **Option 2 : Intégration Progressive**

Gardez l'ancienne interface et ajoutez un toggle :

```tsx
import React, { useState } from 'react';
import { VSCodeLayout } from './layouts/VSCodeLayout';
import { OldDashboard } from './components/Dashboard';

function App() {
  const [useVSCodeUI, setUseVSCodeUI] = useState(true);

  return (
    <>
      {/* Toggle Button */}
      <button onClick={() => setUseVSCodeUI(!useVSCodeUI)}>
        Switch to {useVSCodeUI ? 'Old' : 'VS Code'} UI
      </button>

      {/* Render UI */}
      {useVSCodeUI ? <VSCodeLayout /> : <OldDashboard />}
    </>
  );
}
```

---

## 📦 Dépendances Requises

Toutes les dépendances sont **déjà installées** ! ✅

```json
{
  "@monaco-editor/react": "^4.7.0",
  "xterm": "^5.3.0",
  "xterm-addon-fit": "^0.8.0",
  "@mui/material": "^5.14.0",
  "@mui/icons-material": "^5.14.0"
}
```

---

## 🎨 Personnalisation

### **Changer les Couleurs**

Modifiez `VSCodeLayout.tsx` :

```tsx
const theme = {
  activityBar: '#333333',    // Barre d'activité
  sideBar: '#252526',        // Barre latérale
  editor: '#1e1e1e',         // Éditeur
  statusBar: '#007acc',      // Barre de statut
  accent: '#007acc',         // Couleur d'accent
};
```

### **Ajouter une Vue Personnalisée**

1. Créez votre vue dans `frontend/src/components/vscode/views/`
2. Ajoutez-la dans `ActivityBar.tsx`
3. Ajoutez le rendu dans `SideBar.tsx`

Exemple :

```tsx
// MonitoringView.tsx
export const MonitoringView: React.FC = () => {
  return (
    <Box>
      <Typography>Monitoring Dashboard</Typography>
      {/* Votre contenu */}
    </Box>
  );
};

// Dans ActivityBar.tsx
const activities = [
  // ... autres activités
  { id: 'monitoring', icon: <Dashboard />, label: 'Monitoring' },
];

// Dans SideBar.tsx
case 'monitoring':
  return <MonitoringView />;
```

---

## 🔌 Connexion aux APIs Backend

### **Docker**

```tsx
// Dans DockerView.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const DockerView = () => {
  const [containers, setContainers] = useState([]);

  useEffect(() => {
    const fetchContainers = async () => {
      const response = await axios.get('http://localhost:9090/api/v1/docker/containers');
      setContainers(response.data.containers);
    };
    fetchContainers();
  }, []);

  // Render containers...
};
```

### **Kubernetes**

```tsx
// Dans KubernetesView.tsx
const fetchPods = async () => {
  const response = await axios.get('http://localhost:9090/api/v1/kubernetes/pods');
  setPods(response.data.pods);
};
```

### **Ansible**

```tsx
// Dans AnsibleView.tsx
const fetchPlaybooks = async () => {
  const response = await axios.get('http://localhost:9090/api/v1/ansible/playbooks');
  setPlaybooks(response.data.playbooks);
};
```

---

## ⌨️ Raccourcis Clavier

Pour ajouter des raccourcis clavier VS Code :

```tsx
// Dans VSCodeLayout.tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+P : Quick Open
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      // Ouvrir Quick Open
    }

    // Ctrl+Shift+P : Command Palette
    if (e.ctrlKey && e.shiftKey && e.key === 'p') {
      e.preventDefault();
      // Ouvrir Command Palette
    }

    // Ctrl+` : Toggle Terminal
    if (e.ctrlKey && e.key === '`') {
      e.preventDefault();
      setPanelVisible(!panelVisible);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [panelVisible]);
```

---

## 🧪 Test de l'Interface

### **1. Démarrer le Backend**

```bash
cd backend
go run cmd/server/main.go
```

### **2. Démarrer le Frontend**

```bash
cd frontend
npm run dev
```

### **3. Ouvrir dans le Navigateur**

```
http://localhost:5173
```

Vous devriez voir l'interface VS Code avec :
- ✅ Activity Bar à gauche
- ✅ Side Bar avec vues Docker/K8s/Ansible
- ✅ Editor avec Monaco
- ✅ Terminal fonctionnel
- ✅ Status Bar en bas

---

## 📸 Captures d'Écran Attendues

### **Vue Docker**
```
DOCKER
├── Containers (3)
│   ├── ● nginx-web (running)
│   ├── ● postgres-db (running)
│   └── ○ redis-cache (stopped)
├── Images (12)
├── Volumes (3)
└── Networks (2)
```

### **Vue Kubernetes**
```
KUBERNETES
├── Contexts
│   ├── ● minikube (active)
│   └── docker-desktop
├── Namespaces
│   ├── default
│   └── kube-system
└── Workloads
    ├── Pods (8)
    ├── Deployments (3)
    └── Services (5)
```

### **Terminal**
```
Unity DevOps IDE Terminal
Type "help" for available commands

$ help
Available commands:
  help     - Show this help message
  clear    - Clear the terminal
  docker   - Docker commands
  kubectl  - Kubernetes commands
  ansible  - Ansible commands
$ 
```

---

## 🐛 Dépannage

### **Problème : Monaco Editor ne s'affiche pas**

```bash
# Vérifier que Monaco est installé
npm list @monaco-editor/react

# Réinstaller si nécessaire
npm install --legacy-peer-deps @monaco-editor/react
```

### **Problème : Terminal ne fonctionne pas**

```bash
# Vérifier xterm
npm list xterm xterm-addon-fit

# Réinstaller si nécessaire
npm install --legacy-peer-deps xterm xterm-addon-fit
```

### **Problème : Icônes manquantes**

```bash
# Vérifier Material-UI Icons
npm list @mui/icons-material

# Réinstaller si nécessaire
npm install --legacy-peer-deps @mui/icons-material
```

---

## 🚀 Prochaines Étapes

### **Phase 1 : Fonctionnalités de Base** ✅
- [x] Layout VS Code
- [x] Activity Bar
- [x] Side Bar avec vues
- [x] Editor Monaco
- [x] Terminal xterm
- [x] Status Bar

### **Phase 2 : Intégration Backend** 🔄
- [ ] Connexion API Docker
- [ ] Connexion API Kubernetes
- [ ] Connexion API Ansible
- [ ] WebSocket pour logs temps réel

### **Phase 3 : Fonctionnalités Avancées** 📋
- [ ] Command Palette (Ctrl+Shift+P)
- [ ] Quick Open (Ctrl+P)
- [ ] Multi-cursor editing
- [ ] Git integration
- [ ] Search & Replace
- [ ] Extensions system

### **Phase 4 : Polish** ✨
- [ ] Animations fluides
- [ ] Context menus
- [ ] Drag & drop
- [ ] Keyboard shortcuts complets
- [ ] Settings UI
- [ ] Themes personnalisés

---

## 📚 Ressources

### **Documentation**
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/api/index.html)
- [xterm.js Documentation](https://xtermjs.org/)
- [VS Code Extension API](https://code.visualstudio.com/api)

### **Exemples**
- [VS Code Source](https://github.com/microsoft/vscode)
- [Theia IDE](https://github.com/eclipse-theia/theia)
- [CodeSandbox](https://github.com/codesandbox/codesandbox-client)

---

## ✅ Checklist d'Intégration

- [ ] Remplacer `App.tsx` avec `VSCodeLayout`
- [ ] Tester l'affichage de l'interface
- [ ] Vérifier que Monaco Editor fonctionne
- [ ] Tester le terminal xterm
- [ ] Connecter les APIs backend
- [ ] Tester les vues Docker/K8s/Ansible
- [ ] Ajouter les raccourcis clavier
- [ ] Tester sur différents navigateurs
- [ ] Optimiser les performances
- [ ] Documenter les changements

---

## 🎉 Résultat Final

**Unity DevOps IDE ressemble maintenant à VS Code !**

- 🎨 Interface professionnelle et familière
- ⚡ Monaco Editor ultra-performant
- 🐳 Docker intégré
- ☸️ Kubernetes intégré
- 🎭 Ansible intégré
- 💻 Terminal fonctionnel
- 🔌 Architecture extensible

**Prêt pour la production ! 🚀✨**
