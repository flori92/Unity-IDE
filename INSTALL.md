# 🚀 Installation Unity DevOps IDE sur macOS

## 📦 Méthode 1 : Installation de l'app (Recommandé)

### Étape 1 : Attendre la fin du build
Le build crée l'application dans :
```
frontend/src-tauri/target/release/bundle/macos/DevOps Unity IDE.app
```

### Étape 2 : Ouvrir le dossier
```bash
open "frontend/src-tauri/target/release/bundle/macos/"
```

### Étape 3 : Installer l'app
Deux options :

#### Option A : Drag & Drop
1. Glisser `DevOps Unity IDE.app` vers `/Applications`
2. Double-cliquer pour lancer

#### Option B : Ligne de commande
```bash
cp -r "frontend/src-tauri/target/release/bundle/macos/DevOps Unity IDE.app" /Applications/
open "/Applications/DevOps Unity IDE.app"
```

### ⚠️ Sécurité macOS (Si nécessaire)
Si macOS bloque l'app (non signée) :
1. Aller dans **Préférences Système** → **Sécurité et confidentialité**
2. Cliquer sur **Ouvrir quand même**

Ou via terminal :
```bash
xattr -cr "/Applications/DevOps Unity IDE.app"
```

---

## 🌐 Méthode 2 : Mode Développement (Immédiat)

### Démarrage rapide
```bash
cd "/Users/floriace/Unity Devops/Unity-IDE"
./test-local.sh
```

Puis ouvrir : **http://localhost:5173**

### Avantages
- ✅ Disponible immédiatement
- ✅ Hot reload (modifications en direct)
- ✅ DevTools browser activés
- ✅ Exactement la même interface

### Inconvénient
- ❌ Nécessite backend + frontend en cours d'exécution

---

## 🎯 Installation depuis DMG (Bientôt)

Le build génère aussi un fichier `.dmg` :
```
frontend/src-tauri/target/release/bundle/dmg/DevOps Unity IDE_1.0.0_aarch64.dmg
```

### Installation
1. Double-cliquer sur le `.dmg`
2. Glisser l'app vers `Applications`
3. Éjecter le DMG

---

## ✅ Vérifier l'installation

### Test de l'app
```bash
open "/Applications/DevOps Unity IDE.app"
```

L'application devrait :
1. Se lancer en ~1.5 secondes
2. Démarrer le backend Go automatiquement (port 9090)
3. Afficher l'interface VS Code
4. Tous les modules disponibles dans l'Activity Bar

### Test du backend
Une fois l'app lancée, vérifier :
```bash
curl http://localhost:9090/health
# Devrait retourner : {"status":"healthy","version":"1.0.0"}
```

---

## 🎨 Première utilisation

### Interface
- **Activity Bar (gauche)** : Cliquer sur les icônes pour changer de vue
- **Editor (centre)** : Monaco Editor pour éditer du code
- **Panel (bas)** : Terminal, Output, Debug Console
- **AI Panel (droite)** : `Ctrl+Shift+A` pour ouvrir

### Raccourcis essentiels
- `Ctrl+Shift+P` : Command Palette
- `Ctrl+P` : Quick Open
- `Ctrl+B` : Toggle Sidebar
- `Ctrl+J` : Toggle Terminal
- **`Ctrl+Shift+A` : Toggle AI Panel**

### Modules disponibles
1. 📁 **Explorer** : Navigation fichiers
2. 🐳 **Docker** : Gestion containers (données mockées)
3. ☸️ **Kubernetes** : Clusters K8s (données mockées)
4. 🔧 **Ansible** : Playbooks (données mockées)
5. 🧩 **Extensions** : Marketplace
6. 🤖 **AI Copilot** : Assistant IA (panneau droit)

---

## 🐛 Résolution de problèmes

### L'app ne démarre pas
```bash
# Vérifier les permissions
xattr -cr "/Applications/DevOps Unity IDE.app"

# Voir les logs
open "/Applications/Utilities/Console.app"
# Chercher "DevOps Unity IDE"
```

### Backend ne démarre pas
Le backend Go est embarqué et démarre automatiquement. Si problème :
```bash
# Vérifier que le port 9090 n'est pas utilisé
lsof -i :9090

# Tuer le processus si nécessaire
kill -9 $(lsof -t -i:9090)
```

### Interface ne s'affiche pas
1. Redémarrer l'app
2. Vérifier les logs Console.app
3. Essayer mode développement : `./test-local.sh`

---

## 🔄 Mise à jour

### Via l'app
L'app vérifie automatiquement les mises à jour au démarrage.

### Manuellement
```bash
cd "/Users/floriace/Unity Devops/Unity-IDE"
git pull
./build-production.sh
```

---

## 🗑️ Désinstallation

### Supprimer l'app
```bash
rm -rf "/Applications/DevOps Unity IDE.app"
```

### Supprimer les données
```bash
rm -rf ~/Library/Application\ Support/io.devops-unity.ide
rm -rf ~/Library/Caches/io.devops-unity.ide
```

---

## 📊 Configuration système

### Prérequis macOS
- macOS 10.15 (Catalina) ou supérieur
- 4 GB RAM minimum (8 GB recommandé)
- 200 MB espace disque

### Outils optionnels
- **Docker Desktop** : Pour vraies données Docker
- **kubectl** : Pour connexion clusters K8s réels
- **Ansible** : Pour exécution playbooks réels

---

## 🎉 Profiter de l'app !

Une fois installée, l'app est totalement autonome :
- ✅ Backend Go intégré
- ✅ Démarre automatiquement
- ✅ Aucune configuration nécessaire
- ✅ Interface complète VS Code
- ✅ AI Copilot disponible

**Enjoy coding! 🚀**
