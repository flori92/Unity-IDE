# 💻 Installation de Unity DevOps IDE sur votre Desktop

## 🚀 Installation Rapide (1 commande)

```bash
cd /Users/floriace/Unity\ Devops/Unity-IDE
./install.sh
```

**C'est tout !** L'IDE sera installé comme VS Code, accessible depuis n'importe où.

---

## 📋 Prérequis

L'installation vérifie automatiquement ces dépendances :

- ✅ **Node.js 18+** : `brew install node` (si absent)
- ✅ **Go 1.21+** : `brew install go` (si absent)
- ✅ **Rust/Cargo** : `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh` (si absent)

---

## 🎯 Processus d'Installation Détaillé

### **Étape 1 : Vérification des Prérequis**

Le script vérifie automatiquement :
- Système d'exploitation (macOS détecté automatiquement)
- Node.js, Go, et Rust installés
- Outils système (curl, tar, unzip)

### **Étape 2 : Construction du Backend Go**

```bash
# Automatiquement exécuté par install.sh
cd backend
go mod tidy
go build -o bin/server cmd/server/main.go
```

### **Étape 3 : Construction du Frontend React + Tauri**

```bash
# Automatiquement exécuté par install.sh
cd frontend
npm install
npm run build
npm run tauri:build
```

### **Étape 4 : Installation Système**

L'IDE est installé dans :

```
$HOME/.devops-unity-ide/          # Application principale
$HOME/.config/devops-unity-ide/   # Configuration
$HOME/.local/share/devops-unity-ide/  # Données utilisateur
$HOME/.local/bin/devops-unity-ide     # Commande système
```

---

## ✅ Après Installation

### **Lancer l'IDE**

Depuis n'importe où dans le terminal :

```bash
devops-unity-ide
```

Ou depuis Spotlight (Cmd+Space) :
- Tapez "devops" et appuyez sur Entrée

### **Configuration Initiale**

Un fichier de configuration est créé automatiquement :

```json
~/.config/devops-unity-ide/config.json
```

Avec les paramètres par défaut :
- Thème : dark
- Langue : français
- Modules : Docker, Kubernetes, Ansible activés
- Auto-update des extensions activé

---

## 🔧 Installation Manuelle (si besoin)

Si vous préférez installer étape par étape :

### **1. Backend**

```bash
cd backend
go mod tidy
go build -o ../bin/server cmd/server/main.go
```

### **2. Frontend Web**

```bash
cd frontend
npm install
npm run build
```

### **3. Application Desktop (Tauri)**

```bash
cd frontend
npm run tauri:build
```

### **4. Installation Locale**

```bash
# Créer les dossiers
mkdir -p ~/.devops-unity-ide
mkdir -p ~/.local/bin
mkdir -p ~/.config/devops-unity-ide

# Copier le backend
cp bin/server ~/.devops-unity-ide/

# Copier le frontend
cp -r frontend/dist/* ~/.devops-unity-ide/

# Créer le lanceur
cat > ~/.local/bin/devops-unity-ide << 'EOF'
#!/bin/bash
nohup ~/.devops-unity-ide/server > ~/.devops-unity-ide/backend.log 2>&1 &
sleep 2
open http://localhost:9090
EOF

chmod +x ~/.local/bin/devops-unity-ide
```

---

## 🎨 Installation du Logo (Important !)

Après l'installation, configurez le logo :

### **1. Placer le Logo**

```bash
# Copiez votre logo ici :
cp votre-logo.png /Users/floriace/Unity\ Devops/Unity-IDE/frontend/public/logos/unity-ide-logo.png
```

### **2. Générer les Favicons**

```bash
cd /Users/floriace/Unity\ Devops/Unity-IDE
./scripts/generate-favicons.sh
```

---

## 🚀 Modes de Lancement

### **Mode 1 : Application Desktop Complète (Recommandé)**

```bash
devops-unity-ide
```

Lance l'application Tauri native avec :
- Fenêtre native macOS
- Intégration système complète
- Performance optimale

### **Mode 2 : Mode Web (Développement)**

```bash
cd /Users/floriace/Unity\ Devops/Unity-IDE
./start-ide.sh
```

Lance en mode développement avec hot-reload :
- Backend : http://localhost:9090
- Frontend : http://localhost:5173

### **Mode 3 : Mode Démo (Sans Backend)**

```bash
cd frontend
npm run dev
```

Lance uniquement le frontend avec données mock :
- Pas besoin de Docker/K8s installés
- Parfait pour démonstration

---

## 📂 Structure d'Installation

```
$HOME/
├── .devops-unity-ide/              # Installation principale
│   ├── server                      # Backend Go
│   ├── devops-unity-ide           # App Tauri (si construit)
│   ├── index.html                  # Frontend web
│   ├── assets/                     # Assets frontend
│   └── uninstall.sh               # Script de désinstallation
│
├── .config/devops-unity-ide/       # Configuration
│   └── config.json                 # Paramètres utilisateur
│
├── .local/
│   ├── bin/
│   │   └── devops-unity-ide       # Commande système
│   └── share/devops-unity-ide/    # Données utilisateur
│       ├── backend.log             # Logs backend
│       ├── backend.pid             # PID backend
│       └── extensions/             # Extensions installées
│
└── .local/share/applications/      # Linux uniquement
    └── devops-unity-ide.desktop    # Entrée menu
```

---

## 🛠️ Commandes Utiles

### **Vérifier le Statut**

```bash
# Backend
ps aux | grep "devops-unity-ide/server"

# Port
lsof -i :9090
```

### **Voir les Logs**

```bash
# Backend
tail -f ~/.local/share/devops-unity-ide/backend.log

# Installation
tail -f ~/.devops-unity-ide/install.log
```

### **Redémarrer l'IDE**

```bash
# Arrêter
pkill -f "devops-unity-ide/server"

# Relancer
devops-unity-ide
```

### **Mettre à Jour**

```bash
cd /Users/floriace/Unity\ Devops/Unity-IDE
git pull
./install.sh
```

---

## 🗑️ Désinstallation

### **Automatique**

```bash
~/.devops-unity-ide/uninstall.sh
```

Ou :

```bash
./install.sh --uninstall
```

### **Manuelle**

```bash
rm -rf ~/.devops-unity-ide
rm -rf ~/.config/devops-unity-ide
rm -rf ~/.local/share/devops-unity-ide
rm -f ~/.local/bin/devops-unity-ide
```

---

## 🐛 Dépannage

### **Problème : Commande `devops-unity-ide` introuvable**

**Solution :**

```bash
# Ajouter au PATH manuellement
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Ou relancer le terminal
```

### **Problème : Backend ne démarre pas**

**Vérifier les logs :**

```bash
cat ~/.local/share/devops-unity-ide/backend.log
```

**Vérifier le port :**

```bash
lsof -i :9090
# Si occupé, changer le port dans ~/.config/devops-unity-ide/config.json
```

### **Problème : Build Tauri échoue**

**Installer les dépendances manquantes :**

```bash
# macOS
xcode-select --install
```

**Mode fallback (Web uniquement) :**

```bash
# Le script utilise automatiquement le mode web si Tauri échoue
# L'IDE reste fonctionnel en mode navigateur
```

### **Problème : Erreurs lors de l'installation**

**Nettoyer et réinstaller :**

```bash
# Nettoyer
rm -rf ~/.devops-unity-ide
rm -rf node_modules
rm -rf backend/vendor

# Réinstaller
./install.sh
```

---

## ⚙️ Configuration Avancée

### **Changer le Port Backend**

Éditez `~/.config/devops-unity-ide/config.json` :

```json
{
  "server": {
    "port": 9090
  }
}
```

### **Activer le Mode Debug**

```bash
DEVOPS_UNITY_DEBUG=1 devops-unity-ide
```

### **Configuration Docker Socket**

```json
{
  "modules": {
    "docker": {
      "socket": "unix:///var/run/docker.sock"
    }
  }
}
```

### **Configuration Kubernetes**

```json
{
  "modules": {
    "kubernetes": {
      "config": "~/.kube/config",
      "multiCluster": true
    }
  }
}
```

---

## 🚀 Prochaines Étapes

Après l'installation réussie :

1. ✅ **Placer le logo** : Voir `LOGO-SETUP.md`
2. ✅ **Configurer les modules** : Docker, K8s, Ansible
3. ✅ **Explorer les raccourcis K9s** : `h` pour l'aide
4. ✅ **Installer des extensions** : Marketplace intégré
5. ✅ **Lire la documentation** : `README-INSTALL.md`

---

## 📞 Support

En cas de problème :

1. Consulter les logs : `~/.devops-unity-ide/install.log`
2. Vérifier les prérequis : `./install.sh --help`
3. Mode développement : `./start-ide.sh`
4. Issues GitHub : https://github.com/flori92/Unity-IDE/issues

---

## ✨ Récapitulatif

**Installation complète en 3 étapes :**

```bash
# 1. Installer l'IDE
./install.sh

# 2. Configurer le logo
cp votre-logo.png frontend/public/logos/unity-ide-logo.png
./scripts/generate-favicons.sh

# 3. Lancer l'application
devops-unity-ide
```

**Vous avez maintenant Unity DevOps IDE installé comme une vraie application desktop ! 🎉**

---

*Installation automatisée · Performance K9s · Fonctionnalités 10x IDE*
