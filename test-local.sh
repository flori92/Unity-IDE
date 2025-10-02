#!/bin/bash

###############################################################################
# Script de test local - Lance backend + frontend rapidement
# Pour tester sans attendre le build production complet
###############################################################################

set -e

echo "=========================================="
echo "  Unity DevOps IDE - Test Local"
echo "=========================================="

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fonction de nettoyage
cleanup() {
    echo -e "\n${YELLOW}[INFO] Arrêt des services...${NC}"
    pkill -P $$ 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# 1. Compiler le backend si nécessaire
if [ ! -f "backend/unity-ide-backend" ]; then
    echo -e "${BLUE}[1/2] Compilation du backend...${NC}"
    cd backend
    go build -o unity-ide-backend ./cmd/server/simple_main.go
    cd ..
    echo -e "${GREEN}✓ Backend compilé${NC}"
else
    echo -e "${GREEN}✓ Backend déjà compilé${NC}"
fi

# 2. Démarrer le backend
echo -e "${BLUE}[2/2] Démarrage du backend...${NC}"
cd backend
./unity-ide-backend &
BACKEND_PID=$!
cd ..

# Attendre que le backend soit prêt
sleep 2

if curl -s http://localhost:9090/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend démarré sur http://localhost:9090${NC}"
else
    echo -e "${YELLOW}⚠  Backend en cours de démarrage...${NC}"
fi

# 3. Démarrer le frontend
echo -e "${BLUE}[INFO] Démarrage du frontend...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}=========================================="
echo "  ✓ Unity DevOps IDE est prêt!"
echo "==========================================${NC}"
echo ""
echo "📱 Frontend:    http://localhost:5173"
echo "🔌 Backend API: http://localhost:9090"
echo "🏥 Health:      http://localhost:9090/health"
echo "🔄 WebSocket:   ws://localhost:9090/ws"
echo ""
echo "📋 Endpoints disponibles :"
echo "   - Docker:      GET /api/v1/docker/containers"
echo "   - Kubernetes:  GET /api/v1/kubernetes/pods"
echo "   - Ansible:     GET /api/v1/ansible/playbooks"
echo "   - Monitoring:  GET /api/v1/monitoring/metrics"
echo ""
echo -e "${YELLOW}Press Ctrl+C pour arrêter${NC}"
echo ""

# Attendre
wait
