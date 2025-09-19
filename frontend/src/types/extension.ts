export interface Extension {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  author: ExtensionAuthor;
  icon?: string;
  banner?: string;
  categories: string[];
  tags: string[];
  downloads: number;
  rating: number;
  reviews: number;
  lastUpdated: Date;
  size: string;
  installed: boolean;
  enabled: boolean;
  hasUpdate: boolean;
  trending: boolean;
  featured: boolean;
  pricing: 'free' | 'paid' | 'freemium';
  price?: number;
  permissions: ExtensionPermission[];
  repository?: string;
  homepage?: string;
  screenshots?: string[];
  compatibility: ExtensionCompatibility;
  changelog?: string;
  readme?: string;
}

export interface ExtensionAuthor {
  name: string;
  email?: string;
  avatar?: string;
  verified: boolean;
  url?: string;
}

export interface ExtensionCompatibility {
  minVersion: string;
  maxVersion?: string;
  platforms: ('windows' | 'mac' | 'linux')[];
}

export type ExtensionPermission = 
  | 'filesystem'
  | 'network'
  | 'credentials'
  | 'terminal'
  | 'docker'
  | 'kubernetes'
  | 'ansible'
  | 'system'
  | 'clipboard'
  | 'notifications';

export interface ExtensionManifest {
  id: string;
  name: string;
  displayName: string;
  version: string;
  description: string;
  main: string;
  author: ExtensionAuthor;
  engines: {
    devopsUnity: string;
  };
  activationEvents?: string[];
  contributes?: ExtensionContributions;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  extensionPack?: string[];
  extensionDependencies?: string[];
  scripts?: Record<string, string>;
  icon?: string;
  galleryBanner?: {
    color?: string;
    theme?: 'dark' | 'light';
  };
  categories?: string[];
  keywords?: string[];
  repository?: {
    type: string;
    url: string;
  };
  bugs?: {
    url?: string;
    email?: string;
  };
  license?: string;
  homepage?: string;
}

export interface ExtensionContributions {
  commands?: ExtensionCommand[];
  menus?: ExtensionMenu[];
  keybindings?: ExtensionKeybinding[];
  languages?: ExtensionLanguage[];
  grammars?: ExtensionGrammar[];
  themes?: ExtensionTheme[];
  snippets?: ExtensionSnippet[];
  views?: ExtensionView[];
  viewsContainers?: ExtensionViewContainer[];
  configuration?: ExtensionConfiguration[];
  configurationDefaults?: Record<string, any>;
}

export interface ExtensionCommand {
  command: string;
  title: string;
  category?: string;
  icon?: {
    light?: string;
    dark?: string;
  };
  enablement?: string;
}

export interface ExtensionMenu {
  id: string;
  group?: string;
  command: string;
  when?: string;
  alt?: string;
}

export interface ExtensionKeybinding {
  command: string;
  key: string;
  mac?: string;
  when?: string;
}

export interface ExtensionLanguage {
  id: string;
  extensions?: string[];
  aliases?: string[];
  mimetypes?: string[];
  firstLine?: string;
  configuration?: string;
  icon?: {
    light: string;
    dark: string;
  };
}

export interface ExtensionGrammar {
  language: string;
  scopeName: string;
  path: string;
  embeddedLanguages?: Record<string, string>;
  tokenTypes?: Record<string, string>;
  injectTo?: string[];
}

export interface ExtensionTheme {
  label: string;
  uiTheme: 'du-dark' | 'du-light';
  path: string;
}

export interface ExtensionSnippet {
  language: string;
  path: string;
}

export interface ExtensionView {
  id: string;
  name: string;
  icon?: string;
  when?: string;
  type?: 'tree' | 'webview';
}

export interface ExtensionViewContainer {
  id: string;
  title: string;
  icon: string;
  type: 'activity' | 'panel';
}

export interface ExtensionConfiguration {
  title: string;
  properties: Record<string, {
    type?: string;
    default?: any;
    description?: string;
    enum?: any[];
    enumDescriptions?: string[];
    minimum?: number;
    maximum?: number;
    pattern?: string;
    patternErrorMessage?: string;
    markdownDescription?: string;
    scope?: 'application' | 'machine' | 'window' | 'resource' | 'machine-overridable' | 'language-overridable';
    order?: number;
  }>;
}

// Extension API exposed to extensions
export interface ExtensionAPI {
  workspace: WorkspaceAPI;
  window: WindowAPI;
  commands: CommandsAPI;
  docker: DockerAPI;
  kubernetes: KubernetesAPI;
  ansible: AnsibleAPI;
  storage: StorageAPI;
}

export interface WorkspaceAPI {
  getConfiguration(section?: string): any;
  onDidChangeConfiguration(listener: (e: any) => void): Disposable;
  openTextDocument(uri: string): Promise<any>;
  applyEdit(edit: any): Promise<boolean>;
}

export interface WindowAPI {
  showMessage(message: string, type?: 'info' | 'warning' | 'error'): void;
  showInputBox(options?: any): Promise<string | undefined>;
  showQuickPick(items: string[], options?: any): Promise<string | undefined>;
  createOutputChannel(name: string): OutputChannel;
  createStatusBarItem(alignment?: any, priority?: number): StatusBarItem;
}

export interface CommandsAPI {
  registerCommand(command: string, callback: (...args: any[]) => any): Disposable;
  executeCommand(command: string, ...args: any[]): Promise<any>;
  getCommands(): Promise<string[]>;
}

export interface DockerAPI {
  listContainers(): Promise<any[]>;
  startContainer(id: string): Promise<void>;
  stopContainer(id: string): Promise<void>;
  executeCommand(containerId: string, command: string[]): Promise<string>;
}

export interface KubernetesAPI {
  listPods(namespace?: string): Promise<any[]>;
  applyManifest(yaml: string): Promise<void>;
  deleteResource(kind: string, name: string, namespace?: string): Promise<void>;
}

export interface AnsibleAPI {
  runPlaybook(playbook: string, inventory: string): Promise<any>;
  validatePlaybook(playbook: string): Promise<any>;
  encryptVault(content: string, password: string): Promise<string>;
}

export interface StorageAPI {
  get(key: string): any;
  set(key: string, value: any): void;
  delete(key: string): void;
  clear(): void;
}

export interface Disposable {
  dispose(): void;
}

export interface OutputChannel {
  append(value: string): void;
  appendLine(value: string): void;
  clear(): void;
  show(preserveFocus?: boolean): void;
  hide(): void;
  dispose(): void;
}

export interface StatusBarItem {
  text: string;
  tooltip?: string;
  command?: string;
  show(): void;
  hide(): void;
  dispose(): void;
}
