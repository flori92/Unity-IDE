#!/bin/bash
set -e

# Configuration
APP_NAME="DevOps Unity IDE"
VERSION="1.0.0"
OUTPUT_DIR="../releases"
TEMP_DIR="${OUTPUT_DIR}/temp"

# Créer les répertoires
mkdir -p "${OUTPUT_DIR}"
rm -rf "${TEMP_DIR}"
mkdir -p "${TEMP_DIR}"

echo "🔧 Installation des dépendances..."
npm ci --legacy-peer-deps

# Build du frontend
echo "🚀 Construction du frontend..."
npm run build

# Build du backend
echo "🔨 Construction du backend..."
cd ../backend
rm -f devops-backend
GOOS=darwin GOARCH=arm64 go build -o devops-backend .

# Préparation du package
echo "📦 Préparation du package..."
cd ../frontend

# Installer nativefier si nécessaire
if ! command -v nativefier &> /dev/null; then
  echo "📦 Installation de nativefier..."
  npm install -g nativefier
fi

# Créer un serveur local temporaire pour le build
echo "🌐 Démarrage du serveur local..."
npx serve -s dist -l 5173 & 
SERVER_PID=$!

# Attendre que le serveur démarre
sleep 5

# Créer l'application avec nativefier
echo "🛠️  Création de l'application avec Nativefier..."
nativefier \
  --name "${APP_NAME}" \
  --platform darwin \
  --arch arm64 \
  --icon src-tauri/icons/icon.icns \
  --width 1200 \
  --height 800 \
  --tray false \
  --single-instance \
  --disable-dev-tools \
  --inject "src-tauri/inject.js" \
  --fast-quit \
  "http://localhost:5173" \
  "${TEMP_DIR}"

# Arrêter le serveur local
echo "🛑 Arrêt du serveur local..."
kill ${SERVER_PID}

# Copier le backend dans l'application
echo "📦 Intégration du backend..."
cp ../backend/devops-backend "${TEMP_DIR}/${APP_NAME}-darwin-arm64/${APP_NAME}.app/Contents/Resources/app/"

# Créer un script de démarrage
echo "🚀 Création du script de démarrage..."
cat > "${TEMP_DIR}/${APP_NAME}-darwin-arm64/${APP_NAME}.app/Contents/Resources/app/start.sh" << 'EOL'
#!/bin/bash
# Démarrer le backend en arrière-plan
cd "$(dirname "$0")"
nohup ./devops-backend > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid

# Attendre que le backend démarre
sleep 3

# Ouvrir l'application
exec "$@"
EOL

chmod +x "${TEMP_DIR}/${APP_NAME}-darwin-arm64/${APP_NAME}.app/Contents/Resources/app/start.sh"

# Mettre à jour le fichier Info.plist pour utiliser notre script
echo "⚙️  Configuration de l'application..."
/usr/libexec/PlistBuddy -c "Set :CFBundleExecutable start.sh" "${TEMP_DIR}/${APP_NAME}-darwin-arm64/${APP_NAME}.app/Contents/Info.plist"

# Créer un DMG
echo "💾 Création du DMG..."
hdiutil create \
  -volname "${APP_NAME}" \
  -srcfolder "${TEMP_DIR}/${APP_NAME}-darwin-arm64" \
  -ov \
  -format UDZO \
  "${OUTPUT_DIR}/${APP_NAME// /_}-${VERSION}-macOS-arm64.dmg"

# Nettoyage
echo "🧹 Nettoyage..."
rm -rf "${TEMP_DIR}"

echo "✅ Installation package créé avec succès :"
echo "   ${OUTPUT_DIR}/${APP_NAME// /_}-${VERSION}-macOS-arm64.dmg"
echo ""
echo "Pour installer, double-cliquez sur le fichier DMG et faites glisser l'application dans le dossier Applications."
