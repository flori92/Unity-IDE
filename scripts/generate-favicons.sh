#!/bin/bash

# Script de génération automatique des favicons et logos
# Unity DevOps IDE

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

LOGO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../frontend/public/logos" && pwd)"
SOURCE_LOGO="$LOGO_DIR/unity-ide-logo.png"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}     Unity DevOps IDE - Génération des Favicons & Logos${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo

# Vérifier si le logo source existe
if [ ! -f "$SOURCE_LOGO" ]; then
    echo -e "${RED}❌ Erreur : Le fichier $SOURCE_LOGO n'existe pas.${NC}"
    echo -e "${YELLOW}💡 Veuillez placer votre logo dans : $LOGO_DIR/unity-ide-logo.png${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Logo source trouvé : $SOURCE_LOGO${NC}"
echo

# Vérifier si ImageMagick ou sharp-cli est installé
if command -v convert &> /dev/null; then
    echo -e "${GREEN}✅ ImageMagick détecté${NC}"
    TOOL="imagemagick"
elif command -v sharp &> /dev/null; then
    echo -e "${GREEN}✅ sharp-cli détecté${NC}"
    TOOL="sharp"
else
    echo -e "${YELLOW}⚠️  Aucun outil de conversion d'image détecté${NC}"
    echo -e "${YELLOW}📦 Installation de sharp-cli...${NC}"
    npm install -g sharp-cli
    TOOL="sharp"
fi

echo

# Fonction de génération avec ImageMagick
generate_with_imagemagick() {
    local size=$1
    local output=$2
    
    echo -e "${BLUE}🔧 Génération de $output (${size}x${size})${NC}"
    convert "$SOURCE_LOGO" -resize ${size}x${size} "$LOGO_DIR/$output"
}

# Fonction de génération avec sharp
generate_with_sharp() {
    local size=$1
    local output=$2
    
    echo -e "${BLUE}🔧 Génération de $output (${size}x${size})${NC}"
    sharp -i "$SOURCE_LOGO" -o "$LOGO_DIR/$output" resize $size $size
}

# Sélectionner la fonction selon l'outil
if [ "$TOOL" = "imagemagick" ]; then
    generate_favicon() { generate_with_imagemagick "$1" "$2"; }
else
    generate_favicon() { generate_with_sharp "$1" "$2"; }
fi

# Générer tous les favicons
echo -e "${YELLOW}🎨 Génération des favicons...${NC}"
echo

generate_favicon 16 "favicon-16x16.png"
generate_favicon 32 "favicon-32x32.png"
generate_favicon 48 "favicon-48x48.png"
generate_favicon 64 "favicon-64x64.png"
generate_favicon 128 "favicon-128x128.png"

echo
echo -e "${YELLOW}📱 Génération des icônes mobiles...${NC}"
echo

generate_favicon 180 "apple-touch-icon.png"
generate_favicon 192 "android-chrome-192x192.png"
generate_favicon 512 "android-chrome-512x512.png"

echo
echo -e "${YELLOW}🖥️  Génération des logos pour l'interface...${NC}"
echo

generate_favicon 256 "logo-256.png"
generate_favicon 512 "logo-512.png"

# Copier le logo original
cp "$SOURCE_LOGO" "$LOGO_DIR/logo-full.png"
echo -e "${GREEN}✅ Logo complet copié : logo-full.png${NC}"

echo
echo -e "${GREEN}✅ Génération terminée !${NC}"
echo

# Créer le fichier manifest.json
cat > "$LOGO_DIR/manifest.json" <<EOF
{
  "name": "DevOps Unity IDE",
  "short_name": "Unity IDE",
  "description": "La première plateforme unifiée qui rivalise avec K9s",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a2332",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/logos/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/logos/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
EOF

echo -e "${GREEN}✅ Manifest PWA créé${NC}"
echo

# Récapitulatif
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Favicons générés avec succès !${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo
echo -e "${YELLOW}📂 Fichiers générés dans : $LOGO_DIR${NC}"
echo
echo "Favicons navigateur :"
echo "  • favicon-16x16.png"
echo "  • favicon-32x32.png"
echo "  • favicon-48x48.png"
echo "  • favicon-64x64.png"
echo "  • favicon-128x128.png"
echo
echo "Icônes mobiles :"
echo "  • apple-touch-icon.png (iOS)"
echo "  • android-chrome-192x192.png"
echo "  • android-chrome-512x512.png"
echo
echo "Logos interface :"
echo "  • logo-256.png"
echo "  • logo-512.png"
echo "  • logo-full.png"
echo
echo -e "${GREEN}✅ Prochaines étapes :${NC}"
echo "  1. Les favicons sont prêts à être utilisés"
echo "  2. Relancez l'application pour voir les changements"
echo "  3. Le logo apparaîtra dans le navigateur et l'interface"
echo
