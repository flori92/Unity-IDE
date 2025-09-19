#!/bin/bash

# Démarrer le backend
echo "🚀 Démarrage du backend..."
cd "$(dirname "$0")/.."

# Arrêter tout processus existant
pkill -f "devops-backend" 2>/dev/null

# Démarrer le backend
./backend/devops-backend > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid
echo "✅ Backend démarré avec PID $BACKEND_PID"
echo "📋 Logs: $(pwd)/backend.log"

# Attendre que le backend soit prêt
sleep 2

# Ouvrir l'application frontend
echo "🌐 Ouverture de l'application..."
open "DevOps Unity IDE.app"

# Nettoyer à la fermeture
cleanup() {
    echo "\n🛑 Arrêt du backend..."
    kill $BACKEND_PID 2>/dev/null
    rm -f backend.pid
    exit 0
}

trap cleanup INT TERM

# Attendre indéfiniment
while true; do sleep 1; done
