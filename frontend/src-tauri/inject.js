// Script d'injection pour Nativefier
window.addEventListener('DOMContentLoaded', () => {
  // Détecter quand l'application est prête
  const checkReady = setInterval(() => {
    if (document.readyState === 'complete') {
      clearInterval(checkReady);
      
      // Ajouter un style pour masquer la barre d'adresse
      const style = document.createElement('style');
      style.textContent = `
        #titlebar, #browser-actions {
          display: none !important;
        }
        
        /* Style pour l'application */
        body {
          -webkit-app-region: drag;
          user-select: none;
        }
        
        /* Rendre les éléments cliquables non-draggables */
        button, a, input, textarea, [role="button"], [role="tab"] {
          -webkit-app-region: no-drag;
        }
      `;
      document.head.appendChild(style);
    }
  }, 100);
});

// Gestion des erreurs réseau
window.addEventListener('error', (event) => {
  console.error('Erreur:', event.error);
  // Afficher une notification d'erreur élégante
  if (event.filename && event.lineno) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    errorDiv.innerHTML = `
      <strong>Erreur d'application</strong>
      <p>${event.message}</p>
      <small>${event.filename}:${event.lineno}</small>
    `;
    document.body.appendChild(errorDiv);
    
    // Supprimer après 10 secondes
    setTimeout(() => {
      errorDiv.style.opacity = '0';
      setTimeout(() => errorDiv.remove(), 300);
    }, 10000);
  }
});
