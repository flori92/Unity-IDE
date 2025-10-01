/**
 * Settings Service - Gestion des paramètres
 */

export interface Settings {
  theme: 'dark' | 'light' | 'high-contrast';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  autoSave: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  docker: {
    autoStart: boolean;
    socketPath: string;
  };
  kubernetes: {
    context: string;
    namespace: string;
  };
  ansible: {
    inventoryPath: string;
    playbooksPath: string;
  };
  keybindings: Record<string, string>;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
  tabSize: 2,
  autoSave: true,
  minimap: true,
  lineNumbers: true,
  wordWrap: false,
  docker: {
    autoStart: false,
    socketPath: '/var/run/docker.sock',
  },
  kubernetes: {
    context: 'minikube',
    namespace: 'default',
  },
  ansible: {
    inventoryPath: './inventory',
    playbooksPath: './playbooks',
  },
  keybindings: {
    'commandPalette': 'Ctrl+Shift+P',
    'quickOpen': 'Ctrl+P',
    'toggleSidebar': 'Ctrl+B',
    'togglePanel': 'Ctrl+J',
  },
};

class SettingsService {
  private settings: Settings;
  private storageKey = 'unity-ide-settings';

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): Settings {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  }

  private saveSettings(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
  }

  getSettings(): Settings {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<Settings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  resetSettings(): void {
    this.settings = DEFAULT_SETTINGS;
    this.saveSettings();
  }

  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  importSettings(json: string): boolean {
    try {
      const imported = JSON.parse(json);
      this.settings = { ...DEFAULT_SETTINGS, ...imported };
      this.saveSettings();
      return true;
    } catch {
      return false;
    }
  }
}

export const settingsService = new SettingsService();
export default settingsService;
