# DevOps Unity IDE

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/your-org/devops-unity-ide)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](Makefile)

> **"One IDE to rule them all"** - La première plateforme unifiée pour Docker, Kubernetes et Ansible

## 🚀 Installation Rapide

### Installation Automatique (Recommandé)

```bash
# Télécharger et installer automatiquement
curl -fsSL https://install.devops-unity.io | bash

# Ou depuis les sources
git clone https://github.com/your-org/devops-unity-ide.git
cd devops-unity-ide
./install.sh
```

### Installation Manuelle

```bash
# Prérequis
# - Node.js 18+
# - Go 1.21+
# - Rust 1.70+
# - Docker (optionnel)

# Installation
make install
make build

# Lancement
make run
```

## 🎯 Démarrage Rapide

### Mode Développement

```bash
# Configuration initiale
./dev.sh setup

# Lancement des serveurs de développement
./dev.sh dev
```

### Mode Production

```bash
# Construction
./dev.sh build

# Installation système
./dev.sh install

# Lancement
devops-unity-ide
```

### Mode Automatique

```bash
# Démarrage automatique (backend + frontend)
./start-ide.sh

# Vérification du statut
./start-ide.sh status

# Arrêt des services
./start-ide.sh stop
```

## ✨ Fonctionnalités Principales

### 🔄 Unification Complète
- **Un seul outil** remplace Docker Desktop, Lens, Ansible Tower
- **Dashboard unifié** pour toute votre infrastructure
- **Workflows visuels** avec drag & drop
- **Context awareness** intelligent

### 🚀 Innovations Clés
- **Topology temps réel** : Visualisation Docker → K8s → Ansible
- **Monitoring ML-powered** : Détection d'anomalies intelligente
- **Visual workflow builder** : Pipelines DevOps en drag & drop
- **Extension ecosystem** : Marketplace intégré

### 🛠️ Modules Core

#### 🐳 **Docker Manager**
- Gestion complète des conteneurs, images, volumes
- Actions rapides : start/stop/restart/logs/exec/remove
- Support multi-registry
- Monitoring temps réel des métriques

#### ☸️ **Kubernetes IDE**
- Multi-cluster management
- YAML editor avec IntelliSense
- Helm integration native
- Resource troubleshooting automatique
- Visual pod/container logs

#### 🎭 **Ansible Automation**
- Visual playbook editor
- Inventory management graphique
- Role-based execution
- Compliance tracking
- Rollback automatique

#### 📊 **Monitoring Dashboard**
- Métriques temps réel (CPU, RAM, Disk, Network)
- Infrastructure topology
- Alertes intelligentes
- Log aggregation cross-services

#### 🌐 **Extensions Marketplace**
- 50+ extensions officielles
- API standardisée pour les développeurs
- Auto-update system
- Custom extension development

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DevOps Unity IDE                     │
├─────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript + Tauri)                 │
│  - Interface utilisateur moderne                        │
│  - WebSocket temps réel                                 │
│  - Extensions system                                    │
├─────────────────────────────────────────────────────────┤
│  Backend (Go + Gin)                                     │
│  - API RESTful                                          │
│  - WebSocket server                                     │
│  - Multi-service manager                                │
├─────────────────────────────────────────────────────────┤
│  Services Integration                                   │
│  - Docker Engine API                                    │
│  - Kubernetes API                                        │
│  - Ansible API                                          │
│  - System monitoring                                    │
└─────────────────────────────────────────────────────────┘
```

## 📦 Structure du Projet

```
devops-unity-ide/
├── frontend/              # Interface utilisateur
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── modules/       # Modules fonctionnels
│   │   ├── services/      # Services API
│   │   └── stores/        # State management
│   └── src-tauri/         # Application desktop
├── backend/               # Serveur Go
│   ├── cmd/server/        # Point d'entrée principal
│   ├── pkg/               # Packages Go
│   │   ├── docker/        # Manager Docker
│   │   ├── kubernetes/    # Manager K8s
│   │   └── ansible/       # Manager Ansible
│   └── go.mod             # Dépendances Go
├── extensions/            # Système d'extensions
├── scripts/               # Scripts utilitaires
├── install.sh            # Script d'installation
├── start-ide.sh          # Script de démarrage automatique
└── dev.sh                # Outils de développement
```

## 🎮 Utilisation

### Interface Principale

1. **Dashboard** : Vue d'ensemble de votre infrastructure
2. **Modules** : Navigation latérale vers chaque service
3. **Terminal** : Terminal intégré multi-contexte
4. **Paramètres** : Configuration globale

### Actions Courantes

#### Gestion Docker
```bash
# Via l'interface : clic droit sur conteneur
# Actions disponibles :
- Start/Stop/Restart Container
- View Logs
- Execute Commands
- Remove Container
- View Metrics
```

#### Gestion Kubernetes
```bash
# Via l'interface : graphe d'infrastructure
# Actions disponibles :
- Scale Deployments
- Rolling Restart
- View Pod Logs
- Execute in Containers
- Delete Resources
```

#### Automatisation Ansible
```bash
# Via l'interface : playbook editor
# Fonctionnalités :
- Visual Playbook Builder
- Inventory Management
- Role Execution
- Compliance Reports
```

## 🔧 Configuration

### Fichier de Configuration

Créer `~/.config/devops-unity-ide/config.json` :

```json
{
  "theme": "dark",
  "language": "fr",
  "modules": {
    "docker": {
      "enabled": true,
      "socket": "unix:///var/run/docker.sock"
    },
    "kubernetes": {
      "enabled": true,
      "config": "~/.kube/config"
    },
    "ansible": {
      "enabled": true,
      "inventory": "./inventory"
    }
  },
  "monitoring": {
    "interval": "5s",
    "retention": "30d"
  },
  "extensions": {
    "autoUpdate": true,
    "registry": "https://extensions.devops-unity.io"
  }
}
```

### Variables d'Environnement

```bash
# Backend
export DEVOPS_UNITY_PORT=9090
export DEVOPS_UNITY_CONFIG=~/.config/devops-unity-ide

# Frontend (développement)
export VITE_API_URL=http://localhost:9090/api/v1
export VITE_WS_URL=ws://localhost:9090/ws
```

## 🧩 Extensions

### Installation d'Extensions

```bash
# Via l'interface : Marketplace
# Ou en ligne de commande :
devops-unity-ide ext install aws-integration
devops-unity-ide ext install gitlab-ci
devops-unity-ide ext install prometheus-monitoring
```

### Développement d'Extensions

```javascript
// my-extension/index.js
import { Extension } from '@devops-unity/sdk';

export default class MyExtension extends Extension {
  activate() {
    // Enregistrer des commandes
    this.registerCommand('myCommand', () => {
      console.log('Hello from extension!');
    });

    // Ajouter des vues
    this.registerView('myView', MyViewComponent);

    // Écouter des événements
    this.onEvent('containerStarted', (data) => {
      console.log('Container started:', data);
    });
  }
}
```

## 🔄 Workflows

### Création de Workflows Visuels

1. Ouvrir le **Workflow Builder**
2. Glisser-déposer des actions :
   - Build → Test → Deploy
   - Docker Build → Push → Deploy
   - Ansible Playbook → Verify → Report

3. Configurer les paramètres
4. Sauvegarder et exécuter

### Exemples de Workflows

- **CI/CD Pipeline** : Git push → Build → Test → Deploy
- **Infrastructure Deployment** : Terraform → Ansible → Verify
- **Container Update** : Build → Push → Rolling Update

## 📊 Monitoring & Alertes

### Métriques Temps Réel

- **Système** : CPU, RAM, Disk, Network
- **Conteneurs** : Usage CPU/Memory par container
- **Kubernetes** : Pod status, resource usage
- **Ansible** : Execution status, failure rates

### Alertes Intelligentes

- **Prédictives** : ML-powered anomaly detection
- **Configurables** : Seuils personnalisés
- **Multi-canaux** : Email, Slack, Webhooks
- **Auto-remediation** : Actions automatiques

## 🐛 Dépannage

### Problèmes Courants

#### Backend ne démarre pas
```bash
# Vérifier les logs
tail -f ~/.devops-unity-ide/logs/backend.log

# Vérifier les ports
lsof -i :9090

# Redémarrer
./start-ide.sh restart
```

#### Frontend ne charge pas
```bash
# Vérifier les logs
tail -f ~/.devops-unity-ide/logs/frontend.log

# Nettoyer et reconstruire
./dev.sh clean
./dev.sh build
```

#### Extensions ne fonctionnent pas
```bash
# Réinstaller les extensions
devops-unity-ide ext reinstall

# Vérifier la compatibilité
devops-unity-ide ext list --compatibility
```

### Logs et Debugging

```bash
# Logs principaux
~/.devops-unity-ide/logs/

# Logs de développement
./dev.sh logs

# Debug mode
DEVOPS_UNITY_DEBUG=1 ./start-ide.sh
```

## 🤝 Contribution

### Développement

```bash
# Fork le projet
git clone https://github.com/your-org/devops-unity-ide.git
cd devops-unity-ide

# Setup
./dev.sh setup

# Développement
./dev.sh dev

# Tests
./dev.sh test

# Build
./dev.sh build
```

### Guidelines

- **Code Style** : ESLint + Prettier pour JS/TS, gofmt pour Go
- **Tests** : 80%+ coverage required
- **Documentation** : JSDoc + GoDoc
- **Commits** : Conventional commits

## 📞 Support

- **Documentation** : [docs.devops-unity.io](https://docs.devops-unity.io)
- **Issues** : [GitHub Issues](https://github.com/your-org/devops-unity-ide/issues)
- **Discussions** : [GitHub Discussions](https://github.com/your-org/devops-unity-ide/discussions)
- **Discord** : [discord.devops-unity.io](https://discord.devops-unity.io)

## 📝 License

MIT License - voir [LICENSE](LICENSE) pour plus de détails.

---

**DevOps Unity IDE** - Transformez votre approche DevOps avec la première plateforme unifiée du marché.

*Fabriqué avec ❤️ par l'équipe DevOps Unity*
