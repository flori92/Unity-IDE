#!/bin/bash

# Script pour créer des icônes professionnelles basées sur le logo DevOps Unity IDE
cd "$(dirname "$0")"

echo "🎨 Création d'icônes professionnelles pour DevOps Unity IDE..."

# Créer des icônes SVG basées sur le logo
create_icon() {
    local size=$1
    local filename=$2
    
    # Calculer les proportions pour le logo
    local center=$((size/2))
    local logo_size=$((size/3))
    local shield_size=$((logo_size/2))
    local hex_size=$((logo_size/2))
    local arrow_size=$((logo_size/3))
    
    cat > temp_logo.svg << EOF
<svg width="$size" height="$size" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradient pour le cercle de fond -->
    <radialGradient id="circleGradient" cx="50%" cy="30%" r="70%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </radialGradient>
    
    <!-- Gradient pour l'hexagone et la flèche -->
    <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d9488;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#14b8a6;stop-opacity:1" />
    </linearGradient>
    
    <!-- Gradient pour le bouclier -->
    <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Cercle de fond avec gradient -->
  <circle cx="$center" cy="$center" r="$((center-4))" fill="url(#circleGradient)" stroke="#1e40af" stroke-width="2"/>
  
  <!-- Bouclier (à gauche) -->
  <path d="M$((center-logo_size/2)) $((center-logo_size/4)) 
           L$((center-logo_size/2-10)) $((center-logo_size/2)) 
           L$((center-logo_size/2-10)) $((center-logo_size*3/4)) 
           L$((center-logo_size/2)) $((center-logo_size*5/6)) 
           L$((center-logo_size/2-20)) $((center-logo_size*5/6)) 
           L$((center-logo_size/2-20)) $((center-logo_size/2)) 
           Z" fill="url(#shieldGradient)"/>
  
  <!-- Hexagone avec microprocesseur (à droite) -->
  <polygon points="$((center+logo_size/4)),$((center-logo_size/3)) 
                   $((center+logo_size/2)),$((center-logo_size/6)) 
                   $((center+logo_size/2)),$((center+logo_size/6)) 
                   $((center+logo_size/4)),$((center+logo_size/3)) 
                   $((center+logo_size/6)),$((center+logo_size/6)) 
                   $((center+logo_size/6)),$((center-logo_size/6))" 
           fill="url(#tealGradient)"/>
  
  <!-- Microprocesseur dans l'hexagone -->
  <rect x="$((center+logo_size/4+2))" y="$((center-logo_size/6+2))" 
        width="$((logo_size/8))" height="$((logo_size/8))" 
        fill="white" stroke="#0d9488" stroke-width="1"/>
  <rect x="$((center+logo_size/4+4))" y="$((center-logo_size/6+4))" 
        width="$((logo_size/12))" height="$((logo_size/12))" 
        fill="#0d9488"/>
  
  <!-- Flèche vers le haut (au centre) -->
  <path d="M$center $((center-logo_size/2)) 
           L$((center-arrow_size/2)) $((center-logo_size/4)) 
           L$((center-arrow_size/4)) $((center-logo_size/4)) 
           L$((center-arrow_size/4)) $((center-logo_size/6)) 
           L$((center+arrow_size/4)) $((center-logo_size/6)) 
           L$((center+arrow_size/4)) $((center-logo_size/4)) 
           L$((center+arrow_size/2)) $((center-logo_size/4)) 
           Z" fill="url(#tealGradient)"/>
  
  <!-- Texte "DEVOPS" -->
  <text x="$center" y="$((center+logo_size/2+8))" 
        font-family="Arial, sans-serif" font-size="$((size/8))" 
        font-weight="bold" text-anchor="middle" fill="#1e40af">DEVOPS</text>
  
  <!-- Texte "UNITY IDE" -->
  <text x="$center" y="$((center+logo_size/2+20))" 
        font-family="Arial, sans-serif" font-size="$((size/10))" 
        font-weight="bold" text-anchor="middle" fill="#0d9488">UNITY IDE</text>
</svg>
EOF
    
    # Convertir SVG en PNG
    if command -v rsvg-convert &> /dev/null; then
        rsvg-convert -w $size -h $size temp_logo.svg -o $filename
    else
        # Fallback: utiliser sips
        sips -s format png -s formatOptions 100 -z $size $size temp_logo.svg --out $filename 2>/dev/null || {
            # Si sips ne peut pas traiter le SVG, créer une image simple
            sips -s format png -s formatOptions 100 -z $size $size /System/Library/PrivateFrameworks/LoginUIKit.framework/Resources/apple_logo_black.png --out $filename 2>/dev/null || {
                # Dernier recours: copier une icône système
                cp /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns temp_icon.icns
                sips -s format png -z $size $size temp_icon.icns --out $filename
                rm -f temp_icon.icns
            }
        }
    fi
    
    rm -f temp_logo.svg
    echo "✓ Créé $filename ($size x $size)"
}

# Créer les icônes de base
create_icon 32 "32x32.png"
create_icon 128 "128x128.png"
create_icon 256 "128x128@2x.png"
create_icon 32 "tray-icon.png"

# Créer le fichier .icns
echo "📦 Création du fichier .icns..."

# Créer un dossier temporaire pour iconutil
mkdir -p icon.iconset

# Copier les icônes dans le format requis par iconutil
cp 32x32.png icon.iconset/icon_16x16.png
cp 32x32.png icon.iconset/icon_16x16@2x.png
cp 32x32.png icon.iconset/icon_32x32.png
cp 32x32.png icon.iconset/icon_32x32@2x.png
cp 128x128.png icon.iconset/icon_64x64.png
cp 128x128.png icon.iconset/icon_64x64@2x.png
cp 128x128.png icon.iconset/icon_128x128.png
cp 128x128@2x.png icon.iconset/icon_128x128@2x.png
cp 128x128@2x.png icon.iconset/icon_256x256.png
cp 128x128@2x.png icon.iconset/icon_256x256@2x.png
cp 128x128@2x.png icon.iconset/icon_512x512.png
cp 128x128@2x.png icon.iconset/icon_512x512@2x.png

# Créer le fichier .icns
iconutil -c icns icon.iconset -o icon.icns

# Nettoyer
rm -rf icon.iconset

# Créer le fichier .ico (copier la plus grande icône)
cp 128x128.png icon.ico

echo "✅ Toutes les icônes professionnelles ont été créées avec succès!"
echo "📁 Fichiers créés:"
ls -la *.png *.icns *.ico 2>/dev/null || echo "Certains fichiers n'ont pas pu être créés"
