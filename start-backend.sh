#!/bin/bash

###############################################################################
# Script de démarrage du backend Unity DevOps IDE
# Lance le serveur Go sur le port 9090
###############################################################################

set -e

echo "=========================================="
echo "  Unity DevOps IDE - Backend Startup"
echo "=========================================="

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier que Go est installé
if ! command -v go &> /dev/null; then
    echo -e "${RED}[ERROR] Go is not installed${NC}"
    echo "Install Go from https://golang.org/dl/"
    exit 1
fi

echo -e "${GREEN}[✓] Go found: $(go version)${NC}"

# Aller dans le répertoire backend
cd "$(dirname "$0")/backend"

echo -e "${BLUE}[INFO] Building backend...${NC}"

# Build le backend
go build -o unity-ide-backend ./cmd/server/simple_main.go

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Failed to build backend${NC}"
    exit 1
fi

echo -e "${GREEN}[✓] Backend built successfully${NC}"
echo -e "${BLUE}[INFO] Starting backend on http://localhost:9090${NC}"
echo ""
echo "Backend API endpoints:"
echo "  - Health:     http://localhost:9090/health"
echo "  - Docker:     http://localhost:9090/api/v1/docker/*"
echo "  - Kubernetes: http://localhost:9090/api/v1/kubernetes/*"
echo "  - Ansible:    http://localhost:9090/api/v1/ansible/*"
echo "  - WebSocket:  ws://localhost:9090/ws"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop${NC}"
echo "=========================================="

# Démarrer le backend
./unity-ide-backend
