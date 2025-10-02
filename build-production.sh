#!/bin/bash

###############################################################################
# Script de build PRODUCTION pour Unity DevOps IDE
# Compile le backend Go + frontend + empaquète tout dans une app macOS
###############################################################################

set -e

echo "=========================================="
echo "  Unity DevOps IDE - Production Build"
echo "=========================================="

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# 1. Nettoyer les builds précédents
echo -e "${BLUE}[1/5] Nettoyage des builds précédents...${NC}"
rm -rf "$PROJECT_ROOT/frontend/dist"
rm -rf "$PROJECT_ROOT/frontend/src-tauri/target"
rm -f "$PROJECT_ROOT/frontend/src-tauri/backend-server"*
echo -e "${GREEN}✓ Nettoyage terminé${NC}"

# 2. Compiler le backend Go
echo -e "${BLUE}[2/5] Compilation du backend Go...${NC}"
cd "$PROJECT_ROOT/backend"

# Détecter l'architecture
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    TARGET="aarch64-apple-darwin"
elif [ "$ARCH" = "x86_64" ]; then
    TARGET="x86_64-apple-darwin"
else
    TARGET="universal-apple-darwin"
fi

# Compiler pour macOS avec le nom attendu par Tauri
GOOS=darwin GOARCH=arm64 go build -o "$PROJECT_ROOT/frontend/src-tauri/backend-server-$TARGET" ./cmd/server/simple_main.go

if [ ! -f "$PROJECT_ROOT/frontend/src-tauri/backend-server-$TARGET" ]; then
    echo -e "${RED}[ERROR] Échec de la compilation du backend${NC}"
    exit 1
fi

chmod +x "$PROJECT_ROOT/frontend/src-tauri/backend-server-$TARGET"
echo -e "${GREEN}✓ Backend compilé : backend-server-$TARGET ($(ls -lh $PROJECT_ROOT/frontend/src-tauri/backend-server-$TARGET | awk '{print $5}'))${NC}"

# 3. Installer les dépendances frontend
echo -e "${BLUE}[3/5] Installation des dépendances frontend...${NC}"
cd "$PROJECT_ROOT/frontend"

if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${YELLOW}node_modules existe déjà, skip npm install${NC}"
fi
echo -e "${GREEN}✓ Dépendances installées${NC}"

# 4. Build le frontend
echo -e "${BLUE}[4/5] Build du frontend React + Vite...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}[ERROR] Échec du build frontend${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend compilé${NC}"

# 5. Build l'application Tauri
echo -e "${BLUE}[5/5] Empaquetage avec Tauri...${NC}"
npm run tauri build

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Échec du build Tauri${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================="
echo "  ✓ Build terminé avec succès !"
echo "==========================================${NC}"
echo ""
echo "📦 Application compilée :"
echo "   $PROJECT_ROOT/frontend/src-tauri/target/release/bundle/macos/DevOps Unity IDE.app"
echo ""
echo "Pour installer l'application :"
echo "   1. Ouvrir le dossier : open \"$PROJECT_ROOT/frontend/src-tauri/target/release/bundle/macos/\""
echo "   2. Glisser 'DevOps Unity IDE.app' dans Applications"
echo ""
echo -e "${YELLOW}Note: Le backend Go est embarqué dans l'app et démarre automatiquement${NC}"
echo ""
