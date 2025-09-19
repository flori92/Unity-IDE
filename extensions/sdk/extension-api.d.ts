/**
 * DevOps Unity IDE Extension API
 * SDK for building extensions for DevOps Unity IDE
 * 
 * @version 1.0.0
 */

export interface ExtensionContext {
  extensionPath: string;
  globalState: Memento;
  workspaceState: Memento;
  subscriptions: Disposable[];
  extensionMode: ExtensionMode;
}

export enum ExtensionMode {
  Production = 1,
  Development = 2,
  Test = 3,
}

export interface Memento {
  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  update(key: string, value: any): Promise<void>;
  keys(): readonly string[];
}

export interface Disposable {
  dispose(): void;
}

// Command API
export namespace commands {
  export function registerCommand(
    command: string,
    callback: (...args: any[]) => any,
    thisArg?: any
  ): Disposable;

  export function executeCommand<T>(
    command: string,
    ...rest: any[]
  ): Promise<T>;

  export function getCommands(filterInternal?: boolean): Promise<string[]>;
}

// Window API
export namespace window {
  export function showInformationMessage(
    message: string,
    ...items: string[]
  ): Promise<string | undefined>;

  export function showWarningMessage(
    message: string,
    ...items: string[]
  ): Promise<string | undefined>;

  export function showErrorMessage(
    message: string,
    ...items: string[]
  ): Promise<string | undefined>;

  export function showInputBox(
    options?: InputBoxOptions
  ): Promise<string | undefined>;

  export function createOutputChannel(name: string): OutputChannel;
  
  export function createStatusBarItem(
    alignment?: StatusBarAlignment,
    priority?: number
  ): StatusBarItem;

  export function createWebviewPanel(
    viewType: string,
    title: string,
    showOptions: ViewColumn | { viewColumn: ViewColumn; preserveFocus?: boolean },
    options?: WebviewPanelOptions
  ): WebviewPanel;

  export function showQuickPick(
    items: string[] | QuickPickItem[],
    options?: QuickPickOptions
  ): Promise<QuickPickItem | undefined>;

  export function createTerminal(options?: TerminalOptions): Terminal;
}

// Docker API
export namespace docker {
  export interface Container {
    id: string;
    name: string;
    image: string;
    state: string;
    ports: Port[];
  }

  export interface Port {
    privatePort: number;
    publicPort?: number;
    type: string;
  }

  export function listContainers(): Promise<Container[]>;
  export function startContainer(id: string): Promise<void>;
  export function stopContainer(id: string): Promise<void>;
  export function removeContainer(id: string): Promise<void>;
  export function executeCommand(
    containerId: string,
    command: string[]
  ): Promise<string>;
  export function getLogs(
    containerId: string,
    options?: LogOptions
  ): Promise<string>;
  export function buildImage(
    dockerfilePath: string,
    tag: string
  ): Promise<void>;
}

// Kubernetes API
export namespace kubernetes {
  export interface Pod {
    name: string;
    namespace: string;
    status: string;
    containers: ContainerStatus[];
  }

  export interface ContainerStatus {
    name: string;
    ready: boolean;
    restartCount: number;
  }

  export function listPods(namespace?: string): Promise<Pod[]>;
  export function getPod(name: string, namespace?: string): Promise<Pod>;
  export function deletePod(
    name: string,
    namespace?: string
  ): Promise<void>;
  export function applyManifest(yaml: string): Promise<void>;
  export function getNodes(): Promise<any[]>;
  export function getServices(namespace?: string): Promise<any[]>;
  export function portForward(
    pod: string,
    localPort: number,
    podPort: number,
    namespace?: string
  ): Promise<Disposable>;
}

// Ansible API
export namespace ansible {
  export interface PlaybookResult {
    success: boolean;
    output: string;
    stats: PlaybookStats;
  }

  export interface PlaybookStats {
    ok: number;
    changed: number;
    unreachable: number;
    failed: number;
    skipped: number;
  }

  export function runPlaybook(
    playbook: string,
    inventory: string,
    options?: PlaybookOptions
  ): Promise<PlaybookResult>;
  
  export function checkPlaybook(
    playbook: string,
    inventory: string
  ): Promise<boolean>;
  
  export function listHosts(inventory: string): Promise<string[]>;
  
  export function encryptVault(
    content: string,
    password: string
  ): Promise<string>;
  
  export function decryptVault(
    content: string,
    password: string
  ): Promise<string>;
}

// Workspace API
export namespace workspace {
  export function getConfiguration(
    section?: string,
    scope?: ConfigurationScope
  ): WorkspaceConfiguration;
  
  export function onDidChangeConfiguration(
    listener: (e: ConfigurationChangeEvent) => any
  ): Disposable;
  
  export function openTextDocument(uri: Uri): Promise<TextDocument>;
  
  export function saveAll(includeUntitled?: boolean): Promise<boolean>;
  
  export function createFileSystemWatcher(
    globPattern: string,
    ignoreCreateEvents?: boolean,
    ignoreChangeEvents?: boolean,
    ignoreDeleteEvents?: boolean
  ): FileSystemWatcher;
}

// Extension exports
export interface ExtensionExports {
  activate(context: ExtensionContext): void | Promise<void>;
  deactivate?(): void | Promise<void>;
}

// Types
export interface InputBoxOptions {
  value?: string;
  prompt?: string;
  placeHolder?: string;
  password?: boolean;
  validateInput?(value: string): string | undefined;
}

export interface OutputChannel {
  name: string;
  append(value: string): void;
  appendLine(value: string): void;
  clear(): void;
  show(preserveFocus?: boolean): void;
  hide(): void;
  dispose(): void;
}

export interface StatusBarItem {
  text: string;
  tooltip?: string | undefined;
  color?: string | undefined;
  backgroundColor?: string | undefined;
  command?: string | undefined;
  accessibilityInformation?: AccessibilityInformation | undefined;
  show(): void;
  hide(): void;
  dispose(): void;
}

export interface WebviewPanel {
  viewType: string;
  title: string;
  webview: Webview;
  visible: boolean;
  active: boolean;
  onDidDispose: Event<void>;
  onDidChangeViewState: Event<WebviewPanelOnDidChangeViewStateEvent>;
  reveal(viewColumn?: ViewColumn, preserveFocus?: boolean): void;
  dispose(): void;
}

export interface Webview {
  html: string;
  options: WebviewOptions;
  onDidReceiveMessage: Event<any>;
  postMessage(message: any): Promise<boolean>;
  asWebviewUri(localResource: Uri): Uri;
  cspSource: string;
}

export interface QuickPickItem {
  label: string;
  description?: string;
  detail?: string;
  picked?: boolean;
  alwaysShow?: boolean;
}

export interface Terminal {
  name: string;
  processId: Promise<number | undefined>;
  creationOptions: TerminalOptions;
  exitStatus: TerminalExitStatus | undefined;
  sendText(text: string, addNewLine?: boolean): void;
  show(preserveFocus?: boolean): void;
  hide(): void;
  dispose(): void;
}

// Enums
export enum StatusBarAlignment {
  Left = 1,
  Right = 2,
}

export enum ViewColumn {
  Active = -1,
  Beside = -2,
  One = 1,
  Two = 2,
  Three = 3,
  Four = 4,
}

// Additional interfaces
export interface LogOptions {
  follow?: boolean;
  stdout?: boolean;
  stderr?: boolean;
  since?: number;
  timestamps?: boolean;
  tail?: number;
}

export interface PlaybookOptions {
  tags?: string[];
  skipTags?: string[];
  limit?: string;
  extraVars?: Record<string, any>;
  check?: boolean;
  diff?: boolean;
  verbose?: boolean;
}

export interface ConfigurationScope {
  uri?: Uri;
  languageId?: string;
}

export interface WorkspaceConfiguration {
  get<T>(section: string): T | undefined;
  get<T>(section: string, defaultValue: T): T;
  has(section: string): boolean;
  inspect<T>(section: string): {
    key: string;
    defaultValue?: T;
    globalValue?: T;
    workspaceValue?: T;
  } | undefined;
  update(
    section: string,
    value: any,
    configurationTarget?: ConfigurationTarget,
    overrideInLanguage?: boolean
  ): Promise<void>;
}

export interface ConfigurationChangeEvent {
  affectsConfiguration(section: string, scope?: ConfigurationScope): boolean;
}

export interface TextDocument {
  uri: Uri;
  fileName: string;
  languageId: string;
  version: number;
  isDirty: boolean;
  isClosed: boolean;
  save(): Promise<boolean>;
  getText(range?: Range): string;
  positionAt(offset: number): Position;
  offsetAt(position: Position): number;
  lineAt(line: number): TextLine;
  lineAt(position: Position): TextLine;
  getWordRangeAtPosition(position: Position, regex?: RegExp): Range | undefined;
  validateRange(range: Range): Range;
  validatePosition(position: Position): Position;
}

export interface FileSystemWatcher extends Disposable {
  ignoreCreateEvents: boolean;
  ignoreChangeEvents: boolean;
  ignoreDeleteEvents: boolean;
  onDidCreate: Event<Uri>;
  onDidChange: Event<Uri>;
  onDidDelete: Event<Uri>;
}

// Helper types
export interface Uri {
  readonly scheme: string;
  readonly authority: string;
  readonly path: string;
  readonly query: string;
  readonly fragment: string;
  readonly fsPath: string;
  with(change: {
    scheme?: string;
    authority?: string;
    path?: string;
    query?: string;
    fragment?: string;
  }): Uri;
  toString(skipEncoding?: boolean): string;
  toJSON(): any;
}

export interface Position {
  readonly line: number;
  readonly character: number;
  isAfter(other: Position): boolean;
  isAfterOrEqual(other: Position): boolean;
  isBefore(other: Position): boolean;
  isBeforeOrEqual(other: Position): boolean;
  isEqual(other: Position): boolean;
  compareTo(other: Position): number;
  translate(lineDelta?: number, characterDelta?: number): Position;
  translate(change: { lineDelta?: number; characterDelta?: number }): Position;
  with(line?: number, character?: number): Position;
  with(change: { line?: number; character?: number }): Position;
}

export interface Range {
  readonly start: Position;
  readonly end: Position;
  isEmpty: boolean;
  isSingleLine: boolean;
  with(start?: Position, end?: Position): Range;
  with(change: { start?: Position; end?: Position }): Range;
  intersection(range: Range): Range | undefined;
  union(other: Range): Range;
  contains(positionOrRange: Position | Range): boolean;
  isEqual(other: Range): boolean;
}

export interface TextLine {
  readonly lineNumber: number;
  readonly text: string;
  readonly range: Range;
  readonly rangeIncludingLineBreak: Range;
  readonly firstNonWhitespaceCharacterIndex: number;
  readonly isEmptyOrWhitespace: boolean;
}

export interface Event<T> {
  (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]): Disposable;
}

export interface TerminalOptions {
  name?: string;
  shellPath?: string;
  shellArgs?: string[] | string;
  cwd?: string | Uri;
  env?: { [key: string]: string | null | undefined };
  strictEnv?: boolean;
  hideFromUser?: boolean;
  message?: string;
}

export interface TerminalExitStatus {
  readonly code: number | undefined;
}

export interface WebviewOptions {
  enableScripts?: boolean;
  enableCommandUris?: boolean;
  localResourceRoots?: ReadonlyArray<Uri>;
  portMapping?: ReadonlyArray<WebviewPortMapping>;
}

export interface WebviewPortMapping {
  readonly webviewPort: number;
  readonly extensionHostPort: number;
}

export interface WebviewPanelOptions {
  enableFindWidget?: boolean;
  retainContextWhenHidden?: boolean;
}

export interface WebviewPanelOnDidChangeViewStateEvent {
  readonly webviewPanel: WebviewPanel;
}

export interface QuickPickOptions {
  placeHolder?: string;
  canPickMany?: boolean;
  matchOnDescription?: boolean;
  matchOnDetail?: boolean;
}

export interface AccessibilityInformation {
  label: string;
  role?: string;
}

export enum ConfigurationTarget {
  Global = 1,
  Workspace = 2,
  WorkspaceFolder = 3,
}
