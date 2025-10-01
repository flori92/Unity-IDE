/**
 * Composant de Découverte Système
 * S'affiche au premier lancement comme Lens/K9s
 */

import React, { useEffect, useState } from 'react';
import { autoDiscoveryService, SystemCapabilities } from '../services/autoDiscoveryService';

interface SystemDiscoveryProps {
  onComplete?: (capabilities: SystemCapabilities) => void;
}

export const SystemDiscovery: React.FC<SystemDiscoveryProps> = ({ onComplete }) => {
  const [discovering, setDiscovering] = useState(true);
  const [capabilities, setCapabilities] = useState<SystemCapabilities | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    performDiscovery();
  }, []);

  const performDiscovery = async () => {
    setDiscovering(true);
    setProgress(0);

    // Animation de progression
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      // Découverte automatique
      const result = await autoDiscoveryService.discover();
      
      clearInterval(progressInterval);
      setProgress(100);
      setCapabilities(result);
      
      // Afficher les résultats pendant 2 secondes
      setTimeout(() => {
        setDiscovering(false);
        onComplete?.(result);
      }, 2000);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('[SystemDiscovery] Error:', error);
      setDiscovering(false);
    }
  };

  const getServiceIcon = (service: string): string => {
    const icons: Record<string, string> = {
      docker: '🐳',
      kubernetes: '☸️',
      ansible: '🎭',
      helm: '⎈',
      kubectl: '⎈',
      minikube: '🎡',
      podman: '🦭',
    };
    return icons[service] || '📦';
  };

  if (!discovering && !capabilities) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Unity DevOps IDE
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {discovering ? 'Découverte de votre système...' : 'Découverte terminée !'}
          </p>
        </div>

        {/* Progress Bar */}
        {discovering && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              {progress}%
            </p>
          </div>
        )}

        {/* Results */}
        {capabilities && (
          <div className="space-y-3">
            {Object.entries(capabilities).map(([service, result]) => (
              <div
                key={service}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  result.available
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getServiceIcon(service)}</span>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white capitalize">
                      {service}
                    </div>
                    {result.version && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {result.version}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  {result.available ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                      ✓ Disponible
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      Non installé
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!discovering && capabilities && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div>
                <div className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Prêt à démarrer !
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  {Object.values(capabilities).filter(r => r.available).length} services détectés.
                  L'IDE est configuré automatiquement et prêt à l'emploi.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {!discovering && (
          <div className="mt-6 flex justify-center space-x-3">
            <button
              onClick={() => performDiscovery()}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              🔄 Redécouvrir
            </button>
            <button
              onClick={() => capabilities && onComplete?.(capabilities)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              disabled={!capabilities}
            >
              Continuer →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemDiscovery;
