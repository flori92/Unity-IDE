# ⚡ Démarrage Rapide - Unity DevOps IDE

> **Testez l'IDE en 5 minutes sans installation système !**

---

## 🚀 **Essai Rapide (Mode Démo)**

### **Option 1 : Mode Démo Complet (Recommandé pour tester)**

```bash
# 1. Cloner le projet
git clone https://github.com/flori92/Unity-IDE.git
cd Unity-IDE

# 2. Lancer le mode démo (données mock, pas besoin de Docker/K8s)
cd frontend
npm install
npm run dev
```

**Ouvrez votre navigateur : http://localhost:5173**

✅ **Fonctionnalités disponibles en mode démo :**
- Dashboard avec métriques temps réel (données mock)
- Gestion Docker simulée (conteneurs, images, volumes)
- Gestion Kubernetes simulée (pods, services, deployments)
- Terminal intégré multi-contexte
- Raccourcis clavier K9s (j/k, 0-5, h)
- Interface complète sans backend réel

---

## 🔧 **Essai Complet (Backend + Frontend)**

### **Option 2 : Avec Backend Go + Frontend React**

```bash
# 1. Cloner le projet
git clone https://github.com/flori92/Unity-IDE.git
cd Unity-IDE

# 2. Lancer avec script automatique
./start-ide.sh
```

**Ouvrez votre navigateur : http://localhost:9090**

✅ **Fonctionnalités disponibles :**
- Tout le mode démo +
- Backend Go fonctionnel
- WebSocket temps réel
- API REST complète
- Connection réelle Docker/K8s (si installés)

---

## 💻 **Installation Système Complète**

### **Option 3 : Installation comme VS Code**

```bash
# 1. Cloner le projet
git clone https://github.com/flori92/Unity-IDE.git
cd Unity-IDE

# 2. Installer (comme une vraie application)
./install.sh

# 3. Lancer depuis n'importe où
devops-unity-ide
```

✅ **Fonctionnalités disponibles :**
- Tout le mode complet +
- Application desktop native (Tauri)
- Commande système globale
- Intégration Spotlight/Dock (macOS)
- Configuration persistante
- Extensions marketplace

---

## 📋 **Prérequis par Mode**

### **Mode Démo (Option 1)**
```bash
# Seulement Node.js nécessaire
node --version  # 18+ requis

# Si absent :
# macOS : brew install node
# Ubuntu : sudo apt install nodejs npm
# Windows : https://nodejs.org/
```

### **Mode Complet (Option 2)**
```bash
# Node.js + Go
node --version  # 18+
go version      # 1.21+

# Si absent :
# macOS : brew install node go
# Ubuntu : sudo apt install nodejs npm golang
```

### **Installation Système (Option 3)**
```bash
# Node.js + Go + Rust
node --version  # 18+
go version      # 1.21+
cargo --version # 1.70+

# Si absent :
# macOS : brew install node go rust
# Rust : curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

---

## 🎮 **Guide d'Utilisation Rapide**

### **Raccourcis Clavier K9s**

Une fois l'IDE lancé, utilisez ces raccourcis :

```
Navigation :
  j/k         - Naviguer ↓/↑
  g/G         - Début/Fin de liste
  h/l         - Gauche/Droite

Vues :
  0           - Dashboard
  1           - Pods
  2           - Services
  3           - Deployments
  4           - Conteneurs Docker
  5           - Namespaces

Actions :
  Enter       - Sélectionner
  d           - Décrire
  e           - Éditer
  s           - Mettre à l'échelle
  l           - Logs

Commandes :
  :           - Mode commande
  /           - Filtre/Recherche
  Ctrl+t      - Terminal intégré
  h           - Aide
  q           - Quitter
```

### **Terminal Intégré**

Appuyez sur **Ctrl+T** pour ouvrir le terminal :

```bash
# Commandes disponibles
ls pods                  # Lister les pods
logs frontend-abc        # Voir les logs
exec bash                # Shell interactif
describe deployment      # Détails YAML
scale deployment 3       # Mise à l'échelle

# Changer de contexte
context docker           # Mode Docker
context kubernetes       # Mode Kubernetes
context ansible          # Mode Ansible
context host             # Commandes système
```

---

## 🌐 **Modes de Test Disponibles**

### **1. Mode Navigation Pure (le plus rapide)**

```bash
cd Unity-IDE/frontend
npm install && npm run dev
```

**Parfait pour :**
- ✅ Tester l'interface
- ✅ Essayer les raccourcis K9s
- ✅ Voir le design et l'UX
- ✅ Démonstration rapide

### **2. Mode Backend API**

```bash
cd Unity-IDE
./start-ide.sh
```

**Parfait pour :**
- ✅ Tester les API REST
- ✅ WebSocket temps réel
- ✅ Intégration Docker/K8s réel
- ✅ Développement de plugins

### **3. Mode Production**

```bash
cd Unity-IDE
./install.sh
devops-unity-ide
```

**Parfait pour :**
- ✅ Utilisation quotidienne
- ✅ Performances optimales
- ✅ Application native desktop
- ✅ Usage en production

---

## 📦 **Structure du Projet**

```
Unity-IDE/
├── frontend/              # React + TypeScript
│   ├── src/
│   │   ├── components/   # Composants UI
│   │   ├── modules/      # Docker/K8s/Ansible
│   │   ├── services/     # API + Mock
│   │   └── hooks/        # Performance hooks
│   └── package.json
│
├── backend/              # Go + Gin
│   ├── cmd/server/       # Point d'entrée
│   ├── pkg/              # Packages
│   └── go.mod
│
├── scripts/              # Scripts utilitaires
│   ├── start-ide.sh     # Lancement rapide
│   └── install.sh       # Installation système
│
├── QUICKSTART.md        # Ce fichier
└── README-INSTALL.md    # Documentation complète
```

---

## 🎯 **Comparaison des Modes**

| Aspect | Mode Démo | Mode Complet | Installation |
|--------|-----------|--------------|--------------|
| **Temps de setup** | ~2 min | ~5 min | ~20 min |
| **Prérequis** | Node.js | Node.js + Go | Node.js + Go + Rust |
| **Fonctionnalités** | Interface + Mock | Interface + Backend | Application native |
| **Performance** | ⚡⚡ | ⚡⚡⚡ | ⚡⚡⚡⚡ |
| **Intégration** | Mock | Docker/K8s réel | Système complet |
| **Usage** | Démonstration | Développement | Production |

---

## 🐛 **Problèmes Courants**

### **Port 5173 déjà utilisé (Mode Démo)**

```bash
# Changer le port dans frontend/vite.config.ts
# Ou tuer le processus
lsof -i :5173
kill -9 PID
```

### **Port 9090 déjà utilisé (Mode Complet)**

```bash
# Vérifier le processus
lsof -i :9090

# Changer le port
export DEVOPS_UNITY_PORT=9091
./start-ide.sh
```

### **npm install échoue**

```bash
# Nettoyer et réinstaller
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### **Go build échoue**

```bash
# Nettoyer les dépendances
cd backend
go clean -modcache
go mod tidy
go build cmd/server/main.go
```

---

## 🌟 **Première Utilisation**

### **Après avoir lancé l'IDE :**

1. **Explorez le Dashboard** (vue 0)
   - Métriques système temps réel
   - Graphe d'infrastructure
   - Alertes intelligentes

2. **Testez les Raccourcis K9s**
   - Appuyez sur `h` pour l'aide
   - Naviguez avec `j`/`k`
   - Changez de vue avec `0-5`

3. **Ouvrez le Terminal** (Ctrl+T)
   - Essayez `ls pods`
   - Testez `context docker`
   - Explorez les commandes

4. **Découvrez les Modules**
   - Docker Manager (vue 4)
   - Kubernetes IDE (vue 1)
   - Ansible Studio (menu)

---

## 📚 **Documentation Complète**

- **QUICKSTART.md** : Ce fichier (démarrage rapide)
- **README-INSTALL.md** : Installation détaillée
- **INSTALLATION.md** : Installation desktop
- **LOGO-SETUP.md** : Configuration logo
- **GitHub** : https://github.com/flori92/Unity-IDE

---

## 🤝 **Contribution**

Vous voulez contribuer ?

```bash
# 1. Fork le projet
# 2. Créer une branche
git checkout -b feature/ma-fonctionnalite

# 3. Développer en mode démo
cd frontend && npm run dev

# 4. Tester
npm run build

# 5. Commit et push
git commit -m "✨ Nouvelle fonctionnalité"
git push origin feature/ma-fonctionnalite

# 6. Créer une Pull Request sur GitHub
```

---

## 💡 **Conseils pour Tester**

### **Pour une Démo Rapide (5 minutes)**
```bash
git clone https://github.com/flori92/Unity-IDE.git
cd Unity-IDE/frontend
npm install && npm run dev
# Visitez http://localhost:5173
```

### **Pour un Test Approfondi (30 minutes)**
```bash
git clone https://github.com/flori92/Unity-IDE.git
cd Unity-IDE
./start-ide.sh
# Testez toutes les fonctionnalités
```

### **Pour une Évaluation Complète (1 heure)**
```bash
git clone https://github.com/flori92/Unity-IDE.git
cd Unity-IDE
./install.sh
devops-unity-ide
# Utilisez comme votre IDE principal
```

---

## ⭐ **Vous aimez le projet ?**

- ⭐ **Star le repository** : https://github.com/flori92/Unity-IDE
- 🐛 **Signaler un bug** : GitHub Issues
- 💬 **Discussions** : GitHub Discussions
- 🤝 **Contribuer** : Pull Requests bienvenues !

---

## 🎉 **C'est Parti !**

**Commencez dès maintenant avec la commande la plus simple :**

```bash
git clone https://github.com/flori92/Unity-IDE.git && cd Unity-IDE/frontend && npm install && npm run dev
```

**Puis ouvrez http://localhost:5173 et découvrez Unity DevOps IDE ! 🚀**

---

*Unity DevOps IDE - Performance de K9s · Fonctionnalités de 10 IDEs · Open Source*
