// Optimisations de performance pour IDE haute performance
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Hook pour lazy loading avec intersection observer
export function useLazyLoad(options?: IntersectionObserverInit) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return { ref, isIntersecting, hasIntersected };
}

// Hook pour virtualisation de listes longues (comme K9s)
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 2, // +2 pour buffer
      items.length
    );
    return { start: Math.max(0, start), end };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: useCallback((event: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(event.currentTarget.scrollTop);
    }, []),
  };
}

// Hook pour optimisation mémoire avec cleanup automatique
export function useMemoryOptimization() {
  const cleanupRefs = useRef<Set<() => void>>(new Set());

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupRefs.current.add(cleanup);
  }, []);

  const removeCleanup = useCallback((cleanup: () => void) => {
    cleanupRefs.current.delete(cleanup);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup lors du démontage du composant
      cleanupRefs.current.forEach(cleanup => cleanup());
      cleanupRefs.current.clear();
    };
  }, []);

  return { addCleanup, removeCleanup };
}

// Hook pour cache intelligent (comme K9s garde les données en mémoire)
export function useSmartCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 30000 // 30 secondes par défaut
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const fetchData = useCallback(async (force = false) => {
    const now = Date.now();
    const cached = cacheRef.current.get(key);

    // Utiliser le cache si valide et non forcé
    if (!force && cached && (now - cached.timestamp) < ttl) {
      setData(cached.data);
      return cached.data;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      cacheRef.current.set(key, { data: result, timestamp: now });
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  const invalidateCache = useCallback(() => {
    cacheRef.current.delete(key);
  }, [key]);

  // Auto-refresh périodique (comme les métriques de K9s)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, ttl);

    return () => clearInterval(interval);
  }, [fetchData, ttl]);

  return { data, loading, error, fetchData, invalidateCache };
}

// Hook pour gestion des raccourcis clavier (K9s-style)
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = buildKeyString(event);

      if (shortcuts[key]) {
        event.preventDefault();
        shortcuts[key]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
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

// Hook pour monitoring des performances
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
  });

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    // Log seulement en développement et si lent
    if (process.env.NODE_ENV === 'development' && renderTime > 16) { // 16ms = 60fps
      console.warn(`[PERF] ${componentName} slow render: ${renderTime.toFixed(2)}ms (render #${renderCount.current})`);
    }

    startTime.current = endTime;
  });

  return renderCount.current;
}

// Hook pour mode économie d'énergie (réduction des updates)
export function usePowerSaving(interval: number = 5000) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      setIsActive(true);
      timeoutId = setTimeout(() => setIsActive(false), interval);
    };

    const handleActivity = () => resetTimer();

    // Événements d'activité utilisateur
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [interval]);

  return isActive;
}

// Optimisation du démarrage - preload des composants critiques
export function usePreloadCritical() {
  useEffect(() => {
    // Preload des composants critiques
    const criticalComponents = [
      () => import('../modules/dashboard/Dashboard'),
      () => import('../modules/docker/DockerManager'),
      () => import('../modules/kubernetes/K8sManager'),
    ];

    criticalComponents.forEach(importFn => {
      importFn().catch(err =>
        console.warn('[PRELOAD] Failed to preload component:', err)
      );
    });
  }, []);
}

// Hook pour gestion des workers (background processing)
export function useWebWorker<T>(
  workerFn: () => void,
  initialData?: T
) {
  const [result, setResult] = useState<T | null>(initialData || null);
  const [error, setError] = useState<Error | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Créer le worker
    const workerCode = `
      self.onmessage = function(e) {
        try {
          const result = (${workerFn.toString()})();
          self.postMessage({ type: 'success', result });
        } catch (err) {
          self.postMessage({ type: 'error', error: err.message });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    worker.onmessage = (e) => {
      const { type, result: workerResult, error: workerError } = e.data;

      if (type === 'success') {
        setResult(workerResult);
        setError(null);
      } else {
        setError(new Error(workerError));
      }
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, [workerFn]);

  const runWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({});
    }
  }, []);

  return { result, error, runWorker };
}

// Export des optimisations principales
export const PerformanceOptimizations = {
  useLazyLoad,
  useVirtualList,
  useMemoryOptimization,
  useSmartCache,
  useKeyboardShortcuts,
  usePerformanceMonitor,
  usePowerSaving,
  usePreloadCritical,
  useWebWorker,
};

// Métriques de performance (comme K9s)
export class PerformanceMetrics {
  private static instance: PerformanceMetrics;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics();
    }
    return PerformanceMetrics.instance;
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // Garder seulement les 100 dernières valeurs
    if (values.length > 100) {
      values.shift();
    }
  }

  getAverage(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;

    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  getMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {};

    this.metrics.forEach((values, name) => {
      result[name] = {
        average: this.getAverage(name),
        count: values.length,
        latest: values[values.length - 1] || 0,
      };
    });

    return result;
  }
}

export const performanceMetrics = PerformanceMetrics.getInstance();
