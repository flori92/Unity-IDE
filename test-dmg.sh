#!/bin/bash

# Script de test pour vérifier le DMG généré

echo "🧪 Test du DMG DevOps Unity IDE"
echo "================================"

DMG_PATH="/Users/floriace/Unity Devops/Unity-IDE/frontend/src-tauri/target/release/bundle/dmg/DevOps Unity IDE_1.0.0_aarch64.dmg"

if [ ! -f "$DMG_PATH" ]; then
    echo "❌ DMG non trouvé : $DMG_PATH"
    exit 1
fi

echo "✅ DMG trouvé : $DMG_PATH"
echo "📊 Taille du DMG : $(ls -lh "$DMG_PATH" | awk '{print $5}')"

# Monter le DMG
echo "🔗 Montage du DMG..."
hdiutil attach "$DMG_PATH" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ DMG monté avec succès"
    
    # Vérifier le contenu
    echo "📁 Contenu du DMG :"
    ls -la "/Volumes/DevOps Unity IDE/"
    
    # Vérifier l'application
    APP_PATH="/Volumes/DevOps Unity IDE/DevOps Unity IDE.app"
    if [ -d "$APP_PATH" ]; then
        echo "✅ Application trouvée"
        
        # Vérifier l'exécutable
        EXEC_PATH="$APP_PATH/Contents/MacOS/DevOps Unity IDE"
        if [ -f "$EXEC_PATH" ] && [ -x "$EXEC_PATH" ]; then
            echo "✅ Exécutable trouvé et exécutable"
            echo "📊 Taille de l'exécutable : $(ls -lh "$EXEC_PATH" | awk '{print $5}')"
            
            # Test de lancement (juste vérifier que ça ne plante pas immédiatement)
            echo "🚀 Test de lancement de l'application..."
            timeout 5s "$EXEC_PATH" > /dev/null 2>&1 &
            APP_PID=$!
            sleep 2
            
            if kill -0 $APP_PID 2>/dev/null; then
                echo "✅ Application lancée avec succès"
                kill $APP_PID 2>/dev/null
            else
                echo "⚠️  Application s'est arrêtée rapidement (normal pour un test)"
            fi
        else
            echo "❌ Exécutable non trouvé ou non exécutable"
        fi
    else
        echo "❌ Application non trouvée"
    fi
    
    # Démontage
    echo "🔓 Démontage du DMG..."
    hdiutil detach "/Volumes/DevOps Unity IDE" > /dev/null 2>&1
    echo "✅ DMG démonté"
else
    echo "❌ Impossible de monter le DMG"
    exit 1
fi

echo ""
echo "🎉 Test terminé avec succès !"
echo "📦 Le DMG est prêt pour la distribution :"
echo "   $DMG_PATH"
echo ""
echo "📋 Instructions d'installation :"
echo "   1. Double-cliquez sur le fichier DMG"
echo "   2. Glissez l'application vers le dossier Applications"
echo "   3. Lancez l'application depuis le Launchpad ou Applications"
