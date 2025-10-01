/**
 * Unity IDE Extension SDK
 *
 * SDK pour développer des extensions Unity IDE
 * Fournit toutes les APIs nécessaires pour étendre l'IDE
 */

declare global {
  interface Window {
    UnityIDE: UnityIDEAPI;
  }
}

/**
 * API principale exposée globalement
 */
export interface UnityIDEAPI {
  // Gestion des commandes
  commands: CommandsAPI;
  // Gestion des vues
  views: ViewsAPI;
  // Gestion de l'interface
  ui: UIAPI;
  // Gestion des configurations
  config: ConfigAPI;
  // Gestion des notifications
  notifications: NotificationsAPI;
  // Gestion des logs
  logger: LoggerAPI;
  // Gestion des workspaces
  workspace: WorkspaceAPI;
  // Gestion des terminaux
  terminal: TerminalAPI;
}

/**
 * API des commandes
 */
export interface CommandsAPI {
  /**
   * Enregistre une nouvelle commande
   */
  register(command: string, handler: (...args: any[]) => any): void;

  /**
   * Exécute une commande
   */
  execute(command: string, ...args: any[]): Promise<any>;

  /**
   * Vérifie si une commande existe
   */
  exists(command: string): boolean;
}

/**
 * API des vues
 */
export interface ViewsAPI {
  /**
   * Crée une nouvelle vue dans un container
   */
  create(container: string, viewId: string, component: React.ComponentType): void;

  /**
   * Met à jour une vue existante
   */
  update(viewId: string, props: any): void;

  /**
   * Supprime une vue
   */
  remove(viewId: string): void;

  /**
   * Focus une vue
   */
  focus(viewId: string): void;
}

/**
 * API de l'interface utilisateur
 */
export interface UIAPI {
  /**
   * Affiche une boîte de dialogue
   */
  showDialog(options: DialogOptions): Promise<DialogResult>;

  /**
   * Affiche un sélecteur de fichiers
   */
  showFilePicker(options: FilePickerOptions): Promise<string[]>;

  /**
   * Affiche un menu contextuel
   */
  showContextMenu(items: ContextMenuItem[], position: { x: number; y: number }): Promise<string>;

  /**
   * Crée un élément d'interface temporaire
   */
  createStatusBarItem(options: StatusBarItemOptions): StatusBarItem;
}

/**
 * API de configuration
 */
export interface ConfigAPI {
  /**
   * Obtient une valeur de configuration
   */
  get<T = any>(key: string, defaultValue?: T): T;

  /**
   * Définit une valeur de configuration
   */
  set(key: string, value: any): void;

  /**
   * Écoute les changements de configuration
   */
  onChange(callback: (key: string, value: any) => void): void;
}

/**
 * API des notifications
 */
export interface NotificationsAPI {
  /**
   * Affiche une notification d'information
   */
  info(message: string, options?: NotificationOptions): void;

  /**
   * Affiche une notification d'avertissement
   */
  warn(message: string, options?: NotificationOptions): void;

  /**
   * Affiche une notification d'erreur
   */
  error(message: string, options?: NotificationOptions): void;

  /**
   * Affiche une notification de succès
   */
  success(message: string, options?: NotificationOptions): void;
}

/**
 * API de logging
 */
export interface LoggerAPI {
  /**
   * Log niveau debug
   */
  debug(message: string, ...args: any[]): void;

  /**
   * Log niveau info
   */
  info(message: string, ...args: any[]): void;

  /**
   * Log niveau warning
   */
  warn(message: string, ...args: any[]): void;

  /**
   * Log niveau error
   */
  error(message: string, ...args: any[]): void;
}

/**
 * API des workspaces
 */
export interface WorkspaceAPI {
  /**
   * Obtient le dossier racine du workspace
   */
  rootPath: string;

  /**
   * Obtient tous les fichiers du workspace
   */
  getFiles(pattern?: string): Promise<string[]>;

  /**
   * Lit le contenu d'un fichier
   */
  readFile(path: string): Promise<string>;

  /**
   * Écrit dans un fichier
   */
  writeFile(path: string, content: string): Promise<void>;

  /**
   * Crée un dossier
   */
  createDirectory(path: string): Promise<void>;

  /**
   * Supprime un fichier/dossier
   */
  delete(path: string): Promise<void>;

  /**
   * Surveille les changements de fichiers
   */
  watch(pattern: string, callback: (event: 'create' | 'update' | 'delete', path: string) => void): void;
}

/**
 * API des terminaux
 */
export interface TerminalAPI {
  /**
   * Crée un nouveau terminal
   */
  create(name: string, options?: TerminalOptions): Terminal;

  /**
   * Obtient un terminal par nom
   */
  get(name: string): Terminal | undefined;

  /**
   * Liste tous les terminaux
   */
  list(): Terminal[];
}

/**
 * Interface Terminal
 */
export interface Terminal {
  /**
   * Nom du terminal
   */
  name: string;

  /**
   * Envoie du texte au terminal
   */
  sendText(text: string): void;

  /**
   * Efface le terminal
   */
  clear(): void;

  /**
   * Ferme le terminal
   */
  dispose(): void;

  /**
   * Écoute les événements du terminal
   */
  onData(callback: (data: string) => void): void;
  onExit(callback: (code: number) => void): void;
}

/**
 * Types pour les options des APIs
 */
export interface DialogOptions {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error';
  buttons?: string[];
  defaultButton?: number;
}

export interface DialogResult {
  button: number;
  checkboxChecked?: boolean;
}

export interface FilePickerOptions {
  canSelectFiles?: boolean;
  canSelectFolders?: boolean;
  canSelectMany?: boolean;
  defaultUri?: string;
  filters?: Record<string, string[]>;
  openLabel?: string;
}

export interface ContextMenuItem {
  label: string;
  command?: string;
  icon?: string;
  enabled?: boolean;
  submenu?: ContextMenuItem[];
}

export interface StatusBarItem {
  text: string;
  tooltip?: string;
  command?: string;
  color?: string;
  backgroundColor?: string;
  alignment: 'left' | 'right';
  priority: number;

  dispose(): void;
}

export interface StatusBarItemOptions {
  text: string;
  tooltip?: string;
  command?: string;
  color?: string;
  backgroundColor?: string;
  alignment?: 'left' | 'right';
  priority?: number;
}

export interface NotificationOptions {
  timeout?: number;
  action?: {
    label: string;
    command: string;
  };
}

export interface TerminalOptions {
  shellPath?: string;
  shellArgs?: string[];
  cwd?: string;
  env?: Record<string, string>;
}

/**
 * Classe principale pour créer une extension
 */
export class Extension {
  private manifest: any;
  private disposables: (() => void)[] = [];

  constructor(manifest: any) {
    this.manifest = manifest;
  }

  /**
   * Méthode appelée lors de l'activation de l'extension
   */
  activate(context: ExtensionContext): void {
    // À implémenter par l'extension
  }

  /**
   * Méthode appelée lors de la désactivation de l'extension
   */
  deactivate(): void {
    this.disposables.forEach(disposable => disposable());
    this.disposables = [];
  }

  /**
   * Enregistre une fonction de nettoyage
   */
  protected addDisposable(disposable: () => void): void {
    this.disposables.push(disposable);
  }
}

/**
 * Contexte passé à l'activation de l'extension
 */
export interface ExtensionContext {
  /**
   * URI de l'extension
   */
  extensionUri: string;

  /**
   * Fonction pour enregistrer des éléments disposables
   */
  addDisposable(disposable: () => void): void;

  /**
   * Logger de l'extension
   */
  logger: LoggerAPI;
}

/**
 * Fonction principale pour exporter une extension
 */
export function createExtension(manifest: any, factory: (context: ExtensionContext) => Extension): void {
  // Cette fonction sera appelée par l'IDE pour créer l'instance d'extension
  if (typeof window !== 'undefined' && window.UnityIDE) {
    // L'extension est chargée dans l'IDE
    const context: ExtensionContext = {
      extensionUri: manifest.id,
      addDisposable: (disposable) => {
        // Logique pour enregistrer les disposables
      },
      logger: window.UnityIDE.logger,
    };

    const extension = factory(context);

    // Activer l'extension
    extension.activate(context);
  }
}

/**
 * Types utilitaires pour les extensions
 */
export type ExtensionFactory = (context: ExtensionContext) => Extension;

export interface ExtensionModule {
  default: ExtensionFactory;
}

/**
 * Helper pour créer des commandes
 */
export function createCommand(commandId: string, handler: (...args: any[]) => any) {
  return {
    command: commandId,
    handler,
  };
}

/**
 * Helper pour créer des vues
 */
export function createView(viewId: string, component: React.ComponentType) {
  return {
    id: viewId,
    component,
  };
}

/**
 * Export des types principaux
 */
export * from './extension-api.service';
