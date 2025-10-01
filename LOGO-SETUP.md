# 🎨 Configuration du Logo Unity DevOps IDE

## 📋 Instructions Rapides

### Étape 1 : Placer le Logo

Placez votre fichier logo (celui que vous m'avez montré) dans :

```
/Users/floriace/Unity Devops/Unity-IDE/frontend/public/logos/unity-ide-logo.png
```

### Étape 2 : Générer les Favicons

Exécutez le script automatique de génération :

```bash
cd /Users/floriace/Unity\ Devops/Unity-IDE
./scripts/generate-favicons.sh
```

Ce script va automatiquement créer :
- ✅ Favicons pour navigateurs (16x16, 32x32, 48x48, 64x64, 128x128)
- ✅ Icônes mobiles iOS (apple-touch-icon 180x180)
- ✅ Icônes Android (192x192, 512x512)
- ✅ Logos interface (256x256, 512x512)
- ✅ Manifest PWA (manifest.json)

### Étape 3 : Relancer l'Application

```bash
./start-ide.sh restart
# Ou en développement :
cd frontend && npm run dev
```

---

## 🎯 Où le Logo Apparaît

### ✅ Déjà Intégré Automatiquement

1. **Favicons Navigateur** 🌐
   - Onglet du navigateur
   - Barre de favoris
   - Historique de navigation

2. **Icônes Mobiles** 📱
   - iOS : Écran d'accueil (apple-touch-icon)
   - Android : Écran d'accueil et PWA

3. **HTML Principal** 📄
   - `frontend/index.html` : Tous les favicons configurés
   - Meta tags Open Graph pour réseaux sociaux
   - Meta tags Twitter Card

4. **Composant Logo React** ⚛️
   - `frontend/src/components/Logo.tsx` : Composant réutilisable
   - Plusieurs variantes : `Logo`, `AnimatedLogo`, `NavbarLogo`

---

## 🔧 Utilisation des Composants Logo

### Logo Standard

```tsx
import { Logo } from './components/Logo';

// Logo complet avec texte
<Logo size="medium" variant="full" showText={true} />

// Logo icône uniquement
<Logo size="small" variant="icon-only" />
```

### Logo Animé (Splash Screen)

```tsx
import { AnimatedLogo } from './components/Logo';

<AnimatedLogo size="xl" />
```

### Logo Navbar

```tsx
import { NavbarLogo } from './components/Logo';

<NavbarLogo />
```

---

## 📂 Structure des Fichiers

```
Unity-IDE/
├── frontend/
│   ├── public/
│   │   └── logos/                      # 📁 Dossier des logos
│   │       ├── unity-ide-logo.png     # 🖼️ Logo source (à placer ici)
│   │       ├── favicon-16x16.png      # ✅ Généré automatiquement
│   │       ├── favicon-32x32.png      # ✅ Généré automatiquement
│   │       ├── favicon-48x48.png      # ✅ Généré automatiquement
│   │       ├── apple-touch-icon.png   # ✅ Généré automatiquement
│   │       ├── android-chrome-192.png # ✅ Généré automatiquement
│   │       ├── android-chrome-512.png # ✅ Généré automatiquement
│   │       ├── logo-256.png           # ✅ Généré automatiquement
│   │       ├── logo-512.png           # ✅ Généré automatiquement
│   │       ├── logo-full.png          # ✅ Généré automatiquement
│   │       └── manifest.json          # ✅ Généré automatiquement
│   ├── src/
│   │   └── components/
│   │       └── Logo.tsx               # ⚛️ Composant React
│   └── index.html                     # 📄 HTML avec favicons
└── scripts/
    └── generate-favicons.sh           # 🔧 Script de génération
```

---

## 🎨 Personnalisation du Logo

### Modifier les Couleurs

Si vous voulez ajuster les couleurs dans le composant Logo :

```tsx
// Dans frontend/src/components/Logo.tsx

// Ligne 31 : Couleur "DEVOPS"
<span className="text-gray-900 dark:text-white">

// Ligne 34 : Couleur "UNITY"
<span className="text-teal-500">

// Ligne 37 : Couleur "IDE"
<span className="text-blue-600 dark:text-blue-400">
```

### Modifier les Tailles

Les tailles disponibles sont définies dans :

```typescript
const sizeMap = {
  small: 32,
  medium: 48,
  large: 64,
  xl: 128,
};
```

---

## 🚀 Intégration dans l'Interface

### Exemple 1 : Dans le Dashboard

```tsx
import { Logo } from '../components/Logo';

function Dashboard() {
  return (
    <div className="dashboard">
      <Logo size="large" />
      <h1>Bienvenue dans Unity DevOps IDE</h1>
    </div>
  );
}
```

### Exemple 2 : Dans la Navbar

```tsx
import { NavbarLogo } from '../components/Logo';

function Navbar() {
  return (
    <nav>
      <NavbarLogo />
      <ul>...</ul>
    </nav>
  );
}
```

### Exemple 3 : Splash Screen

```tsx
import { AnimatedLogo } from '../components/Logo';

function SplashScreen() {
  return (
    <div className="splash-screen">
      <AnimatedLogo size="xl" />
      <div className="loading-bar">...</div>
    </div>
  );
}
```

---

## 🛠️ Dépannage

### Le script ne trouve pas ImageMagick/Sharp

**Solution :** Le script installe automatiquement `sharp-cli` si aucun outil n'est détecté.

Vous pouvez aussi installer manuellement :

```bash
npm install -g sharp-cli
```

Ou utiliser ImageMagick :

```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick
```

### Les favicons ne s'affichent pas

1. **Vider le cache du navigateur** (Cmd+Shift+R sur macOS)
2. **Vérifier que les fichiers existent** :
   ```bash
   ls -la frontend/public/logos/
   ```
3. **Relancer le serveur de développement** :
   ```bash
   cd frontend && npm run dev
   ```

### Le logo est flou

Si le logo apparaît flou, vérifiez :

1. **Résolution du logo source** : Devrait être au moins 512x512px
2. **Format** : PNG avec transparence recommandé
3. **Qualité** : Utilisez un logo haute résolution

---

## ✨ Fonctionnalités Avancées

### PWA (Progressive Web App)

Le fichier `manifest.json` est généré automatiquement pour permettre l'installation de l'IDE comme application :

```json
{
  "name": "DevOps Unity IDE",
  "short_name": "Unity IDE",
  "icons": [
    {
      "src": "/logos/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Social Media Cards

Les meta tags Open Graph et Twitter Card sont déjà configurés dans `index.html` pour un bel affichage sur :
- Twitter
- LinkedIn
- Facebook
- Slack
- Discord

---

## 🎉 C'est Terminé !

Une fois le logo placé et les favicons générés :

1. ✅ Le logo apparaît dans l'onglet du navigateur
2. ✅ Le logo peut être utilisé partout dans l'interface React
3. ✅ L'application peut être installée comme PWA avec le bon logo
4. ✅ Les partages sur réseaux sociaux affichent le logo
5. ✅ Le README GitHub peut afficher le logo

**Le logo Unity DevOps IDE est maintenant parfaitement intégré ! 🚀**

---

## 📞 Support

En cas de problème :

1. Vérifiez que le fichier `unity-ide-logo.png` est bien placé
2. Exécutez le script de génération
3. Videz le cache du navigateur
4. Relancez l'application

**Bon branding ! 🎨✨**
