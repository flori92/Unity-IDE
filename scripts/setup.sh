#!/bin/bash

echo "🚀 Configuration de l'environnement de développement DevOps Unity IDE..."

# Vérification des prérequis
command -v go >/dev/null 2>&1 || { echo "❌ Go n'est pas installé. Veuillez l'installer d'abord."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."; exit 1; }

# Configuration du backend
echo "⚙️ Configuration du backend..."
cd ../backend
go mod download
go mod verify

# Configuration du frontend
echo "⚙️ Configuration du frontend..."
cd ../frontend
npm install

# Installation des dépendances Tauri
echo "⚙️ Configuration de Tauri..."
npm install @tauri-apps/cli
npm install @tauri-apps/api

# Construction du projet
echo "🏗️ Construction du projet..."
npm run build

echo "✅ Configuration terminée avec succès!"
echo "Pour démarrer l'application en mode développement, exécutez:"
echo "cd frontend && npm run tauri:dev"