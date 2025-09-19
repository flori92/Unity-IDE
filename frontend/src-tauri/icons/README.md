# DevOps Unity IDE - Icônes

Ce dossier contient toutes les icônes nécessaires pour l'application DevOps Unity IDE.

## Logo

Le logo professionnel de DevOps Unity IDE comprend :
- **Bouclier** (bleu) : Représente la sécurité
- **Hexagone avec microprocesseur** (teal) : Représente la technologie et le traitement
- **Flèche vers le haut** (teal) : Représente le progrès et l'amélioration
- **Cercle de fond** : Dégradé bleu professionnel
- **Texte** : "DEVOPS" en bleu foncé et "UNITY IDE" en teal

## Fichiers d'icônes

### PNG
- `32x32.png` - Icône 32x32 pixels
- `128x128.png` - Icône 128x128 pixels  
- `128x128@2x.png` - Icône 256x256 pixels (Retina)
- `tray-icon.png` - Icône pour la barre de menu (32x32)

### ICNS (macOS)
- `icon.icns` - Fichier d'icône macOS contenant toutes les tailles

### ICO (Windows)
- `icon.ico` - Fichier d'icône Windows

## Génération des icônes

Pour régénérer les icônes, exécutez :

```bash
./create_professional_icons.sh
```

Ce script utilise SVG et les outils macOS pour créer toutes les icônes nécessaires.

## Couleurs utilisées

- **Bleu foncé** : `#1e40af` (texte "DEVOPS")
- **Bleu moyen** : `#3b82f6` (bouclier et dégradé)
- **Teal** : `#0d9488` à `#14b8a6` (hexagone, flèche, texte "UNITY IDE")
- **Blanc** : `#ffffff` (microprocesseur)

## Utilisation

Ces icônes sont automatiquement utilisées par Tauri lors de la génération des packages d'installation (DMG, MSI, etc.).
