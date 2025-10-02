#!/bin/bash

###############################################################################
# Script d'installation Unity DevOps IDE sur macOS
###############################################################################

set -e

echo "=========================================="
echo "  Unity DevOps IDE - Installation macOS"
echo "=========================================="

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_PATH="frontend/src-tauri/target/release/bundle/macos/DevOps Unity IDE.app"
DMG_PATH="frontend/src-tauri/target/release/bundle/dmg/DevOps Unity IDE_1.0.0_aarch64.dmg"

# Vérifier si l'app existe
if [ ! -d "$APP_PATH" ]; then
    echo -e "${RED}[ERROR] L'application n'a pas encore été compilée${NC}"
    echo ""
    echo "Lance d'abord le build :"
    echo "  ./build-production.sh"
    echo ""
    echo "Ou utilise l'app en mode développement :"
    echo "  ./test-local.sh"
    echo "  Puis ouvre : http://localhost:5173"
    exit 1
fi

echo -e "${GREEN}[✓] Application trouvée${NC}"
echo ""

# Afficher les options
echo "Options d'installation :"
echo "  1) Installer dans /Applications (Recommandé)"
echo "  2) Ouvrir le DMG pour installation manuelle"
echo "  3) Lancer l'app sans installer"
echo "  4) Annuler"
echo ""
read -p "Votre choix (1-4) : " choice

case $choice in
    1)
        echo -e "${BLUE}[INFO] Installation dans /Applications...${NC}"
        
        # Supprimer l'ancienne version si elle existe
        if [ -d "/Applications/DevOps Unity IDE.app" ]; then
            echo -e "${YELLOW}[INFO] Suppression de l'ancienne version...${NC}"
            rm -rf "/Applications/DevOps Unity IDE.app"
        fi
        
        # Copier l'app
        cp -r "$APP_PATH" /Applications/
        
        # Supprimer les attributs de quarantaine
        xattr -cr "/Applications/DevOps Unity IDE.app"
        
        echo -e "${GREEN}[✓] Installation terminée !${NC}"
        echo ""
        echo "Lancer l'application ?"
        read -p "(o/n) : " launch
        
        if [ "$launch" = "o" ] || [ "$launch" = "O" ]; then
            open "/Applications/DevOps Unity IDE.app"
            echo -e "${GREEN}[✓] Application lancée !${NC}"
        fi
        ;;
        
    2)
        if [ -f "$DMG_PATH" ]; then
            echo -e "${BLUE}[INFO] Ouverture du DMG...${NC}"
            open "$DMG_PATH"
        else
            echo -e "${RED}[ERROR] Fichier DMG introuvable${NC}"
            echo "Lance : ./build-production.sh"
        fi
        ;;
        
    3)
        echo -e "${BLUE}[INFO] Lancement de l'app sans installation...${NC}"
        open "$APP_PATH"
        echo -e "${GREEN}[✓] Application lancée !${NC}"
        ;;
        
    4)
        echo "Installation annulée"
        exit 0
        ;;
        
    *)
        echo -e "${RED}[ERROR] Choix invalide${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}=========================================="
echo "  Installation terminée !"
echo "==========================================${NC}"
echo ""
echo "Pour lancer l'app :"
echo "  - Via Spotlight : Cmd+Space puis taper 'Unity'"
echo "  - Via Launchpad : Chercher 'DevOps Unity IDE'"
echo "  - Via Finder : Applications > DevOps Unity IDE"
echo ""
echo "Raccourcis utiles :"
echo "  - Ctrl+Shift+P : Command Palette"
echo "  - Ctrl+Shift+A : Toggle AI Panel"
echo "  - Ctrl+J : Toggle Terminal"
echo ""
