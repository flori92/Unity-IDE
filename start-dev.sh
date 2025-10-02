#!/bin/bash

###############################################################################
# Script de démarrage en mode développement
# Lance le backend ET le frontend simultanément
###############################################################################

set -e

echo "=========================================="
echo "  Unity DevOps IDE - Development Mode"
echo "=========================================="

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fonction pour tuer tous les processus enfants
cleanup() {
    echo ""
    echo -e "${YELLOW}[INFO] Stopping all services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo -e "${BLUE}[INFO] Starting backend server...${NC}"

# Démarrer le backend en arrière-plan
cd backend
go build -o unity-ide-backend ./cmd/server/simple_main.go
./unity-ide-backend &
BACKEND_PID=$!
cd ..

# Attendre que le backend soit prêt
echo -e "${BLUE}[INFO] Waiting for backend to be ready...${NC}"
sleep 3

# Vérifier que le backend est actif
if curl -s http://localhost:9090/health > /dev/null; then
    echo -e "${GREEN}[✓] Backend is ready on http://localhost:9090${NC}"
else
    echo -e "${RED}[ERROR] Backend failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${BLUE}[INFO] Starting frontend dev server...${NC}"

# Démarrer le frontend en arrière-plan
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}=========================================="
echo "  ✓ Unity DevOps IDE is running!"
echo "==========================================${NC}"
echo ""
echo "📱 Frontend:  http://localhost:5173"
echo "🔌 Backend:   http://localhost:9090"
echo "🌐 Health:    http://localhost:9090/health"
echo "🔄 WebSocket: ws://localhost:9090/ws"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Attendre que l'utilisateur arrête
wait
