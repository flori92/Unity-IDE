/**
 * Hook React pour l'auto-discovery
 * Facilite l'utilisation du service de découverte
 */

import { useState, useEffect } from 'react';
import { autoDiscoveryService, SystemCapabilities } from '../services/autoDiscoveryService';

interface UseAutoDiscoveryOptions {
  autoStart?: boolean;
  useCache?: boolean;
}

interface UseAutoDiscoveryReturn {
  capabilities: SystemCapabilities | null;
  discovering: boolean;
  error: Error | null;
  discover: () => Promise<void>;
  rediscover: () => Promise<void>;
  isAvailable: (service: keyof SystemCapabilities) => boolean;
  getConfig: (service: keyof SystemCapabilities) => any;
}

export function useAutoDiscovery(
  options: UseAutoDiscoveryOptions = {}
): UseAutoDiscoveryReturn {
  const { autoStart = true, useCache = true } = options;

  const [capabilities, setCapabilities] = useState<SystemCapabilities | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (autoStart) {
      discover();
    }
  }, [autoStart]);

  const discover = async () => {
    try {
      setDiscovering(true);
      setError(null);

      // Essayer de charger depuis le cache
      if (useCache) {
        const cached = autoDiscoveryService.loadFromLocalStorage();
        if (cached) {
          setCapabilities(cached);
          setDiscovering(false);
          return;
        }
      }

      // Découverte complète
      const result = await autoDiscoveryService.discover();
      setCapabilities(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setDiscovering(false);
    }
  };

  const rediscover = async () => {
    try {
      setDiscovering(true);
      setError(null);
      const result = await autoDiscoveryService.rediscover();
      setCapabilities(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setDiscovering(false);
    }
  };

  const isAvailable = (service: keyof SystemCapabilities): boolean => {
    return autoDiscoveryService.isAvailable(service);
  };

  const getConfig = (service: keyof SystemCapabilities): any => {
    return autoDiscoveryService.getConfig(service);
  };

  return {
    capabilities,
    discovering,
    error,
    discover,
    rediscover,
    isAvailable,
    getConfig,
  };
}

export default useAutoDiscovery;
