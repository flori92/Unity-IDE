# 🏗️ Guide de Build Multi-OS - Unity DevOps IDE

**Version** : 2.0.0  
**Date** : 2025-10-01

---

## 🚀 **Quick Start - Build Tous les OS**

```bash
cd frontend
npm run tauri:build:all
```

**Résultat :** Packages pour macOS, Linux et Windows en une seule commande ! 🎉

---

## 📦 **Build par OS**

### **🍎 macOS**

#### **Commande**
```bash
cd frontend
npm run tauri:build:mac
```

#### **Résultat**
```
✅ DevOps Unity IDE.app
   → Application native macOS
   → Emplacement : src-tauri/target/release/bundle/macos/

✅ DevOps Unity IDE_1.0.0_aarch64.dmg
   → Installeur DMG (Apple Silicon + Intel)
   → Emplacement : src-tauri/target/release/bundle/dmg/
   → Taille : ~80 MB (~45 MB compressé)

✅ DevOps Unity IDE.app.tar.gz
   → Archive pour auto-updater
   → Emplacement : src-tauri/target/release/bundle/macos/
```

#### **Installation**
```bash
# Ouvrir le DMG
open "src-tauri/target/release/bundle/dmg/DevOps Unity IDE_1.0.0_aarch64.dmg"

# Glisser l'app dans /Applications
# Ou double-cliquer sur l'app directement
```

#### **Prérequis**
```bash
# Xcode Command Line Tools
xcode-select --install

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

---

### **🐧 Linux**

#### **Commande**
```bash
cd frontend
npm run tauri:build:linux
```

#### **Résultat**
```
✅ devops-unity-ide_1.0.0_amd64.deb
   → Package Debian/Ubuntu
   → Emplacement : src-tauri/target/release/bundle/deb/
   → Taille : ~75 MB (~40 MB compressé)

✅ devops-unity-ide-1.0.0-1.x86_64.rpm
   → Package RedHat/Fedora/CentOS
   → Emplacement : src-tauri/target/release/bundle/rpm/

✅ devops-unity-ide_1.0.0_amd64.AppImage
   → Portable Linux (tous distros)
   → Emplacement : src-tauri/target/release/bundle/appimage/
   → Taille : ~85 MB (~48 MB compressé)
```

#### **Installation**

**Debian/Ubuntu :**
```bash
sudo dpkg -i src-tauri/target/release/bundle/deb/devops-unity-ide_1.0.0_amd64.deb

# Si dépendances manquantes :
sudo apt-get install -f
```

**RedHat/Fedora/CentOS :**
```bash
sudo rpm -i src-tauri/target/release/bundle/rpm/devops-unity-ide-1.0.0-1.x86_64.rpm
```

**AppImage (Portable) :**
```bash
chmod +x devops-unity-ide_1.0.0_amd64.AppImage
./devops-unity-ide_1.0.0_amd64.AppImage
```

#### **Prérequis**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Fedora/RedHat
sudo dnf install \
    webkit2gtk3-devel \
    openssl-devel \
    curl \
    wget \
    libappindicator-gtk3 \
    librsvg2-devel

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

---

### **🪟 Windows**

#### **Commande**
```bash
cd frontend
npm run tauri:build:windows
```

#### **Résultat**
```
✅ DevOps Unity IDE_1.0.0_x64_en-US.msi
   → Windows Installer
   → Emplacement : src-tauri/target/release/bundle/msi/
   → Taille : ~70 MB (~38 MB compressé)

✅ DevOps Unity IDE.exe
   → Exécutable portable
   → Emplacement : src-tauri/target/release/
```

#### **Installation**
```powershell
# Double-cliquer sur le .msi
# Ou lancer directement le .exe
```

#### **Prérequis**
```powershell
# 1. Visual Studio Build Tools
# Télécharger depuis : https://visualstudio.microsoft.com/downloads/
# Installer "Desktop development with C++"

# 2. Rust
# Télécharger depuis : https://www.rust-lang.org/tools/install
# Exécuter rustup-init.exe

# 3. WebView2 Runtime
# Télécharger depuis : https://developer.microsoft.com/en-us/microsoft-edge/webview2/
# (Généralement déjà installé sur Windows 10/11)
```

---

## ⚙️ **Options de Build**

### **Build Optimisé (Production)**
```bash
npm run tauri:build -- --release
```

### **Build Debug (Développement)**
```bash
npm run tauri:build -- --debug
```

### **Build avec Verbose**
```bash
npm run tauri:build -- --verbose
```

### **Build Backend Seul**
```bash
cd backend
go build -o ../bin/server cmd/server/main.go
```

### **Build Frontend Seul**
```bash
cd frontend
npm run build
# Résultat dans : dist/
```

---

## 📊 **Comparaison des Formats**

| OS | Format | Taille | Compressé | Installation | Portable |
|----|--------|--------|-----------|--------------|----------|
| macOS | .dmg | 80 MB | 45 MB | Drag & Drop | Non |
| macOS | .app | 80 MB | - | Direct | Oui |
| Linux | .deb | 75 MB | 40 MB | dpkg/apt | Non |
| Linux | .rpm | 75 MB | 40 MB | rpm/dnf | Non |
| Linux | .AppImage | 85 MB | 48 MB | chmod +x | Oui |
| Windows | .msi | 70 MB | 38 MB | Double-click | Non |
| Windows | .exe | 70 MB | - | Direct | Oui |

---

## 🚀 **Distribution**

### **GitHub Releases**
```bash
# Installer GitHub CLI
brew install gh  # macOS
sudo apt install gh  # Linux

# Créer une release
gh release create v1.0.0 \
  --title "Unity DevOps IDE v1.0.0" \
  --notes "Interface VS Code complète + Auto-discovery" \
  src-tauri/target/release/bundle/dmg/*.dmg \
  src-tauri/target/release/bundle/deb/*.deb \
  src-tauri/target/release/bundle/rpm/*.rpm \
  src-tauri/target/release/bundle/appimage/*.AppImage \
  src-tauri/target/release/bundle/msi/*.msi
```

### **Package Managers**

**Homebrew (macOS) :**
```ruby
# Formula : homebrew-unity-ide/unity-devops-ide.rb
class UnityDevopsIde < Formula
  desc "Unified DevOps IDE for Docker, Kubernetes, and Ansible"
  homepage "https://github.com/flori92/Unity-IDE"
  url "https://github.com/flori92/Unity-IDE/releases/download/v1.0.0/DevOps_Unity_IDE_1.0.0_aarch64.dmg"
  sha256 "..."
  version "1.0.0"

  def install
    prefix.install "DevOps Unity IDE.app"
  end
end
```

**Snap (Linux) :**
```yaml
# snapcraft.yaml
name: unity-devops-ide
version: '1.0.0'
summary: Unified DevOps IDE
description: |
  Unity DevOps IDE - Docker, Kubernetes, Ansible in one tool
grade: stable
confinement: strict

apps:
  unity-devops-ide:
    command: bin/devops-unity-ide
    plugs: [network, home]
```

**Chocolatey (Windows) :**
```powershell
# unity-devops-ide.nuspec
<?xml version="1.0"?>
<package>
  <metadata>
    <id>unity-devops-ide</id>
    <version>1.0.0</version>
    <title>Unity DevOps IDE</title>
    <authors>flori92</authors>
    <description>Unified DevOps IDE</description>
  </metadata>
</package>
```

---

## 🐛 **Dépannage**

### **Erreur : "Rust not found"**
```bash
# Installer Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Recharger l'environnement
source $HOME/.cargo/env

# Vérifier l'installation
rustc --version
cargo --version
```

### **Erreur : "webkit2gtk not found" (Linux)**
```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.0-dev

# Fedora
sudo dnf install webkit2gtk3-devel
```

### **Erreur : "MSBuild not found" (Windows)**
1. Télécharger Visual Studio Build Tools
2. Installer "Desktop development with C++"
3. Redémarrer le terminal
4. Relancer le build

### **Erreur : "npm ERR! peer dependencies"**
```bash
# Utiliser --legacy-peer-deps
npm install --legacy-peer-deps
npm run tauri:build -- --legacy-peer-deps
```

### **Erreur : "Go not found"**
```bash
# macOS
brew install go

# Linux
sudo apt install golang-go

# Windows
# Télécharger depuis : https://go.dev/dl/
```

### **Build très lent**
```bash
# Activer le cache Rust
export CARGO_INCREMENTAL=1

# Utiliser plus de threads
export CARGO_BUILD_JOBS=8

# Build en mode release (plus rapide)
npm run tauri:build -- --release
```

---

## 📈 **Performance du Build**

| Étape | Temps (macOS M1) | Temps (Linux) | Temps (Windows) |
|-------|------------------|---------------|-----------------|
| Frontend (Vite) | 4.75s | ~6s | ~8s |
| Backend (Go) | 0.5s | ~1s | ~1.5s |
| Tauri (Rust) | 3m 48s | ~5m | ~6m |
| **Total** | **~4min** | **~5.5min** | **~6.5min** |

**Optimisations :**
- Cache Rust : -50% temps
- SSD : -30% temps
- RAM ≥16GB : -20% temps

---

## ✅ **Checklist Build**

### **Avant le Build**
- [ ] Node.js installé (v18+)
- [ ] npm installé
- [ ] Go installé (v1.21+)
- [ ] Rust installé
- [ ] Dépendances OS installées
- [ ] Code à jour (git pull)

### **Pendant le Build**
- [ ] Frontend build réussi
- [ ] Backend build réussi
- [ ] Tauri build réussi
- [ ] Aucune erreur dans les logs

### **Après le Build**
- [ ] Packages créés
- [ ] Tailles correctes
- [ ] Test d'installation
- [ ] Test de lancement
- [ ] Fonctionnalités testées

---

## 🎯 **Résumé**

### **Commandes Essentielles**
```bash
# Build tous les OS
npm run tauri:build:all

# Build macOS
npm run tauri:build:mac

# Build Linux
npm run tauri:build:linux

# Build Windows
npm run tauri:build:windows

# Build optimisé
npm run tauri:build -- --release
```

### **Emplacements des Builds**
```
src-tauri/target/release/bundle/
├── macos/
│   ├── DevOps Unity IDE.app
│   └── DevOps Unity IDE.app.tar.gz
├── dmg/
│   └── DevOps Unity IDE_1.0.0_aarch64.dmg
├── deb/
│   └── devops-unity-ide_1.0.0_amd64.deb
├── rpm/
│   └── devops-unity-ide-1.0.0-1.x86_64.rpm
├── appimage/
│   └── devops-unity-ide_1.0.0_amd64.AppImage
└── msi/
    └── DevOps Unity IDE_1.0.0_x64_en-US.msi
```

---

**Unity DevOps IDE - Build Multi-OS Simplifié ! 🏗️✨**
