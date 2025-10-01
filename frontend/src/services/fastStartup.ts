// Initialisation Ultra-Rapide - Démarrage < 2 secondes
import React from 'react';
import { mockBackend } from './mockBackendService';
import { k9sIntegration } from './k9sIntegration';
import { pluginManager } from './pluginSystem';
import { PerformanceOptimizations } from '../hooks/usePerformance';

// Démarrage synchrone des composants critiques
export function initializeCore() {
  console.time('🚀 Core Initialization');

  // 1. Initialiser le backend mock (ultra-léger)
  mockBackend.connectWebSocket();

  // 2. Initialiser K9s integration
  k9sIntegration.setNamespace('default');

  // 3. Précharger les plugins critiques
  pluginManager.getAllPlugins(); // Force le chargement

  console.timeEnd('🚀 Core Initialization');
}

// Démarrage asynchrone des composants non-critiques
export async function initializeAsync() {
  console.time('⚡ Async Initialization');

  // Précharger les composants React critiques
  const criticalImports = [
    import('../components/IntegratedTerminal'),
    import('../components/InfraGraph'),
    import('../modules/dashboard/Dashboard'),
  ];

  await Promise.all(criticalImports);

  // Initialiser les métriques de performance
  PerformanceOptimizations.performanceMetrics.recordMetric('app-startup', Date.now());

  console.timeEnd('⚡ Async Initialization');
}

// Hook global pour les raccourcis clavier K9s-style
export function initializeGlobalShortcuts() {
  if (typeof document === 'undefined') return;

  const k9sShortcuts = {
    // Navigation (comme K9s)
    'j': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: 'j' })),
    'k': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: 'k' })),
    'h': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: 'h' })),
    'l': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: 'l' })),

    // Vues (comme K9s)
    '0': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: '0' })),
    '1': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: '1' })),
    '2': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: '2' })),
    '3': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: '3' })),
    '4': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: '4' })),
    '5': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: '5' })),

    // Actions (comme K9s)
    'd': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: 'd' })),
    'e': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: 'e' })),
    's': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: 's' })),
    'Enter': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: 'Enter' })),

    // Commandes spéciales
    ':': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: ':' })),
    '/': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: '/' })),
    'q': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: 'q' })),

    // Raccourcis avancés (au-delà de K9s)
    'Ctrl+r': () => window.location.reload(),
    'Ctrl+t': () => {
      // Toggle terminal
      window.dispatchEvent(new CustomEvent('toggle-terminal'));
    },
    'Ctrl+p': () => {
      // Quick open/command palette
      window.dispatchEvent(new CustomEvent('open-command-palette'));
    },
    'Ctrl+Shift+P': () => {
      // Plugin commands
      pluginManager.executeCommand('ai.ask');
    },
    'F1': () => k9sIntegration.handleKeyPress(new KeyboardEvent('keydown', { key: 'h' })),
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    // Ignorer si dans un input/textarea
    if (event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.contentEditable === 'true') {
      return;
    }

    const key = buildKeyString(event);
    const handler = k9sShortcuts[key as keyof typeof k9sShortcuts];

    if (handler) {
      event.preventDefault();
      handler();
      return;
    }

    // Fallback vers K9s integration
    if (k9sIntegration.handleKeyPress(event)) {
      event.preventDefault();
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  // Message d'accueil avec raccourcis
  console.log(`
🎮 Unity DevOps IDE - K9s Enhanced Shortcuts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Navigation: j/k (↓/↑), h/l (←/→), g/G (top/bottom)
Views:      0-5 (overview to namespaces)
Actions:    Enter (select), d (describe), e (edit), s (scale)
Commands:   : (command mode), / (filter), q (quit)

Advanced:   Ctrl+t (terminal), Ctrl+p (palette), F1 (help)
AI:         Ctrl+Shift+P (AI assistant)

Type 'k9s' in terminal for full K9s mode!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

function buildKeyString(event: KeyboardEvent): string {
  let key = '';

  if (event.ctrlKey) key += 'Ctrl+';
  if (event.altKey) key += 'Alt+';
  if (event.shiftKey) key += 'Shift+';
  if (event.metaKey) key += 'Meta+';

  key += event.key;

  return key;
}

// Hook React pour l'initialisation automatique
export function useAppInitialization() {
  React.useEffect(() => {
    // Initialisation synchrone
    initializeCore();

    // Initialisation asynchrone
    initializeAsync().catch(console.error);

    // Raccourcis globaux
    initializeGlobalShortcuts();

    // Métriques de démarrage
    PerformanceOptimizations.performanceMetrics.recordMetric('app-ready', Date.now());

    console.log(`⚡ Unity IDE ready in ${performance.now().toFixed(0)}ms`);

  }, []);
}

// Fonction d'urgence pour redémarrage rapide
export function emergencyRestart() {
  console.log('🚨 Emergency restart initiated...');

  // Nettoyer le cache
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }

  // Nettoyer localStorage (sauf configs importantes)
  const keysToKeep = ['theme', 'language', 'k9s-mode'];
  const keys = Object.keys(localStorage);

  keys.forEach(key => {
    if (!keysToKeep.some(keep => key.includes(keep))) {
      localStorage.removeItem(key);
    }
  });

  // Redémarrer
  window.location.reload();
}

// Export global pour accès depuis console
if (typeof window !== 'undefined') {
  (window as any).unityIDE = {
    restart: emergencyRestart,
    k9s: k9sIntegration,
    plugins: pluginManager,
    backend: mockBackend,
  };

  console.log('💡 Tip: Access Unity IDE API via window.unityIDE');
}
