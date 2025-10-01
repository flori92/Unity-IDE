# Logos DevOps Unity IDE

## Instructions d'installation du logo

1. **Placez le fichier logo fourni** dans ce dossier avec le nom : `unity-ide-logo.png`

2. Les tailles de favicons seront générées automatiquement :
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `favicon-48x48.png`
   - `apple-touch-icon.png` (180x180)
   - `android-chrome-192x192.png`
   - `android-chrome-512x512.png`

3. Le logo sera utilisé dans :
   - Favicons du navigateur
   - Barre de navigation
   - Splash screen
   - README GitHub
   - Application desktop (Tauri)

## Génération automatique des favicons

Exécutez le script de génération après avoir placé `unity-ide-logo.png` :

```bash
cd /Users/floriace/Unity\ Devops/Unity-IDE/frontend/public/logos
npm install -g sharp-cli
sharp -i unity-ide-logo.png -o favicon-16x16.png resize 16 16
sharp -i unity-ide-logo.png -o favicon-32x32.png resize 32 32
sharp -i unity-ide-logo.png -o favicon-48x48.png resize 48 48
sharp -i unity-ide-logo.png -o apple-touch-icon.png resize 180 180
sharp -i unity-ide-logo.png -o android-chrome-192x192.png resize 192 192
sharp -i unity-ide-logo.png -o android-chrome-512x512.png resize 512 512
```

Ou utilisez le script automatique :

```bash
./scripts/generate-favicons.sh
```
