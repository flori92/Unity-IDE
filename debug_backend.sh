#!/bin/bash

# Arrêter tout processus en cours
echo "🛑 Arrêt des processus en cours..."
pkill -f "devops-backend"
pkill -f "nginx-proxy"

# Démarrer le backend en mode debug
echo "🚀 Démarrage du backend en mode debug..."
cd backend
chmod +x devops-backend
./devops-backend &
BACKEND_PID=$!
echo "Backend démarré avec PID: $BACKEND_PID"

# Attendre que le backend démarre
echo "⏳ Attente du démarrage du backend..."
sleep 3

# Tester la connexion
echo "🔍 Test de la connexion au backend..."
curl -v http://localhost:8080/api/health

# Vérifier les logs du backend
echo "\n📋 Logs du backend:"
tail -f -n 20 backend.log &
TAIL_PID=$!

# Nettoyer à la sortie
cleanup() {
    echo "\n🧹 Nettoyage..."
    kill $BACKEND_PID $TAIL_PID 2>/dev/null
    exit 0
}
trap cleanup INT TERM

# Attendre indéfiniment
while true; do sleep 1; done
