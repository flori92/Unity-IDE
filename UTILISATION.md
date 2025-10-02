# 🚀 Unity DevOps IDE - Guide d'utilisation

## 📦 Installation

### Option 1 : Build depuis les sources
```bash
./build-production.sh
```

L'application sera créée dans :
```
frontend/src-tauri/target/release/bundle/macos/DevOps Unity IDE.app
```

### Option 2 : Installation directe
1. Ouvrir le dossier de build : `open frontend/src-tauri/target/release/bundle/macos/`
2. Glisser `DevOps Unity IDE.app` dans le dossier `Applications`
3. Lancer l'application depuis le Launchpad ou Spotlight

---

## 🎯 Fonctionnalités

### 1. 🐳 **Docker Management**
- Liste des containers en temps réel
- Start / Stop / Restart / Remove containers
- Voir les logs des containers
- Gestion des images Docker
- Docker Compose support

**Prérequis** : Docker Desktop installé et démarré

### 2. ☸️ **Kubernetes Management**
- Connexion à vos clusters K8s (kubeconfig)
- Vue Pods, Deployments, Services, Nodes
- Scale deployments
- Apply manifests YAML
- Logs et exec dans les pods

**Prérequis** : kubectl configuré avec accès à un cluster

### 3. 🔧 **Ansible Management**
- Liste et exécution de playbooks
- Gestion d'inventaires
- Visualisation des rôles
- Output en temps réel des exécutions

**Prérequis** : Ansible installé localement

### 4. 💻 **Terminal Intégré**
- Terminal bash/zsh complet
- Splits horizontaux/verticaux
- Commandes Docker, kubectl, ansible
- Historique persistant

### 5. 📝 **Éditeur de code**
- Monaco Editor (VS Code engine)
- Syntaxe highlighting
- IntelliSense
- Support multi-langages

### 6. 🤖 **AI Copilot** (Bientôt)
- Suggestions de code
- Génération de Dockerfiles
- Assistance Kubernetes manifests
- Debugging automatisé

### 7. 🤝 **Collaboration** (Bientôt)
- Partage de workspace
- Live coding
- Chat intégré

### 8. ☁️ **Sync & Backup**
- Synchronisation des settings
- Backup automatique des workspaces
- Restauration rapide

---

## 🔧 Configuration

### Connexion Docker
L'application se connecte automatiquement au socket Docker :
- macOS : `/var/run/docker.sock`
- Linux : `/var/run/docker.sock`
- Windows : `npipe:////./pipe/docker_engine`

### Connexion Kubernetes
1. Cliquer sur l'icône K8s dans la barre latérale
2. Sélectionner votre contexte
3. L'app utilise votre fichier `~/.kube/config`

### Configuration Ansible
- Playbooks détectés automatiquement dans `~/ansible/`
- Inventories dans `~/ansible/inventory/`
- Configuration dans `~/.ansible.cfg`

---

## 🎨 Interface

### Activity Bar (gauche)
- 📁 **Explorer** : Naviguer dans vos fichiers
- 🔍 **Search** : Recherche globale
- 🐳 **Docker** : Gestion containers
- ☸️ **Kubernetes** : Gestion clusters
- 🔧 **Ansible** : Playbooks et inventaires
- 📊 **Monitoring** : Métriques système
- 🤝 **Collaboration** : Partage en temps réel
- 🤖 **AI Chat** : Assistant IA
- ☁️ **Sync** : Synchronisation
- 🧩 **Extensions** : Marketplace

### Panneau bas
- 💻 **Terminal** : Ligne de commande
- 📜 **Output** : Logs d'exécution
- 🐛 **Debug Console** : Débogage
- ⚠️ **Problems** : Erreurs détectées

### Status Bar (bas)
- Connexion Docker
- Contexte Kubernetes
- CPU / RAM usage
- Notifications

---

## ⌨️ Raccourcis clavier

### Généraux
- `Cmd + P` : Quick Open (fichiers)
- `Cmd + Shift + P` : Command Palette
- `Cmd + B` : Toggle Sidebar
- `Cmd + J` : Toggle Terminal
- `Cmd + ,` : Settings

### Terminal
- `Cmd + T` : Nouveau terminal
- `Cmd + W` : Fermer terminal actif
- `Cmd + \` : Split terminal

### Docker
- `Cmd + Shift + D` : Vue Docker
- `Cmd + R` : Refresh containers

### Kubernetes
- `Cmd + Shift + K` : Vue Kubernetes
- `Cmd + E` : Apply manifest

---

## 🔍 Troubleshooting

### Docker ne se connecte pas
```bash
# Vérifier que Docker Desktop est lancé
docker ps

# Vérifier les permissions
sudo chmod 666 /var/run/docker.sock
```

### Kubernetes pas de pods
```bash
# Vérifier votre contexte
kubectl config current-context

# Lister les contextes disponibles
kubectl config get-contexts
```

### Backend ne démarre pas
Le backend Go est embarqué dans l'application. Si problème :
```bash
# Logs dans Console.app
open /Applications/Utilities/Console.app
# Chercher "DevOps Unity IDE"
```

---

## 📊 Architecture

```
Unity IDE (.app)
├── Frontend (React + Vite + Tauri)
│   ├── Interface VS Code
│   ├── Monaco Editor
│   └── WebSocket client
│
├── Backend (Go - auto-start)
│   ├── HTTP API (port 9090)
│   ├── WebSocket server
│   └── Services
│       ├── Docker Manager
│       ├── Kubernetes Manager
│       ├── Ansible Manager
│       └── Monitoring Service
│
└── Native Modules (Rust - Tauri)
    ├── Filesystem access
    ├── Terminal emulator
    └── System integration
```

---

## 🆘 Support

- 📖 Documentation complète : [README.md](README.md)
- 🐛 Issues : [GitHub Issues](https://github.com/devops-unity/ide/issues)
- 💬 Discord : [Join our community](https://discord.gg/devops-unity)

---

## 📝 Notes

- **Performances** : ~150MB RAM, CPU < 5%
- **Compatibilité** : macOS 10.15+, Linux, Windows 10+
- **Licence** : MIT
- **Version** : 1.0.0

---

**Bon développement ! 🚀**
