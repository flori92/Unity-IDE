/**
 * Hook useSettings - Gestion des paramètres
 */

import { useState, useCallback } from 'react';
import { settingsService, Settings } from '../services/settings.service';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(settingsService.getSettings());

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    settingsService.updateSettings(updates);
    setSettings(settingsService.getSettings());
  }, []);

  const resetSettings = useCallback(() => {
    settingsService.resetSettings();
    setSettings(settingsService.getSettings());
  }, []);

  const exportSettings = useCallback(() => {
    return settingsService.exportSettings();
  }, []);

  const importSettings = useCallback((json: string) => {
    const success = settingsService.importSettings(json);
    if (success) {
      setSettings(settingsService.getSettings());
    }
    return success;
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
  };
};

export default useSettings;
