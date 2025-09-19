// App Types
export interface AppTheme {
  isDarkMode: boolean;
  primaryColor: string;
  accentColor: string;
}

// Docker Types
export interface DockerContainer {
  id: string;
  names: string[];
  image: string;
  state: string;
  status: string;
  ports: PortMapping[];
  created: number;
  labels?: Record<string, string>;
}

export interface PortMapping {
  privatePort: number;
  publicPort?: number;
  type: string;
  ip?: string;
}

export interface DockerImage {
  id: string;
  repoTags: string[];
  size: number;
  created: number;
  labels?: Record<string, string>;
}

export interface DockerVolume {
  name: string;
  driver: string;
  mountpoint: string;
  scope: string;
  labels?: Record<string, string>;
}

export interface DockerNetwork {
  id: string;
  name: string;
  driver: string;
  scope: string;
  internal: boolean;
  attachable: boolean;
}

// Kubernetes Types
export interface K8sPod {
  name: string;
  namespace: string;
  status: string;
  node: string | null;
  containers: K8sContainer[];
  age: string;
  labels: Record<string, string>;
  annotations?: Record<string, string>;
}

export interface K8sContainer {
  name: string;
  ready: boolean;
  restartCount: number;
  image: string;
  state?: string;
}

export interface K8sDeployment {
  name: string;
  namespace: string;
  readyReplicas: number;
  replicas: number;
  availableReplicas: number;
  age: string;
  strategy?: string;
}

export interface K8sService {
  name: string;
  namespace: string;
  type: string;
  clusterIP?: string;
  externalIP?: string;
  ports: string[];
  selector?: Record<string, string>;
}

export interface K8sNode {
  name: string;
  status: string;
  role: string;
  version: string;
  os: string;
  kernelVersion: string;
  capacity?: NodeCapacity;
}

export interface NodeCapacity {
  cpu: string;
  memory: string;
  pods: string;
  storage: string;
}

// Ansible Types
export interface AnsiblePlaybook {
  name: string;
  path: string;
  hosts: string[];
  tasks: AnsibleTask[];
  variables: Record<string, any>;
  tags?: string[];
}

export interface AnsibleTask {
  name: string;
  module: string;
  parameters: Record<string, any>;
  tags: string[];
  when?: string;
  register?: string;
}

export interface AnsibleHost {
  name: string;
  group: string;
  variables: Record<string, string>;
  ansibleHost?: string;
  ansibleUser?: string;
  ansiblePort?: number;
  status?: 'reachable' | 'unreachable' | 'unknown';
}

export interface AnsibleRole {
  name: string;
  path: string;
  tasks: string[];
  handlers: string[];
  defaults: Record<string, any>;
  dependencies?: string[];
}

// Workflow Types
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  variables: Record<string, any>;
  triggers: WorkflowTrigger[];
  status: 'active' | 'inactive' | 'running' | 'failed';
  lastRun?: Date;
  nextRun?: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'docker' | 'kubernetes' | 'ansible' | 'script' | 'condition';
  action: string;
  parameters: Record<string, any>;
  dependsOn?: string[];
  onSuccess?: string[];
  onFailure?: string[];
}

export interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'webhook' | 'event';
  config: Record<string, any>;
  enabled: boolean;
}

// Extension Types
export interface Extension {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon?: string;
  categories: string[];
  keywords: string[];
  enabled: boolean;
  installed: boolean;
  permissions: string[];
  config?: Record<string, any>;
}

export interface ExtensionManifest {
  id: string;
  name: string;
  version: string;
  main: string;
  contributes: ExtensionContributions;
  dependencies: Record<string, string>;
  activationEvents?: string[];
}

export interface ExtensionContributions {
  commands?: ExtensionCommand[];
  views?: ExtensionView[];
  menus?: ExtensionMenu[];
  themes?: ExtensionTheme[];
  languages?: ExtensionLanguage[];
}

export interface ExtensionCommand {
  id: string;
  title: string;
  category?: string;
  icon?: string;
  keybinding?: string;
}

export interface ExtensionView {
  id: string;
  name: string;
  location: string;
  icon?: string;
  when?: string;
}

export interface ExtensionMenu {
  id: string;
  label: string;
  command: string;
  location: string;
  group?: string;
  when?: string;
}

export interface ExtensionTheme {
  id: string;
  label: string;
  path: string;
  dark: boolean;
}

export interface ExtensionLanguage {
  id: string;
  extensions: string[];
  aliases: string[];
  configuration?: string;
}

// Monitoring Types
export interface SystemMetrics {
  timestamp: Date;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
  docker?: DockerMetrics;
  kubernetes?: K8sMetrics;
}

export interface CpuMetrics {
  usagePercent: number;
  cores: number;
  loadAverage: [number, number, number];
  temperature?: number;
}

export interface MemoryMetrics {
  totalMb: number;
  usedMb: number;
  freeMb: number;
  usagePercent: number;
  swapTotalMb?: number;
  swapUsedMb?: number;
  buffersMb?: number;
  cacheMb?: number;
}

export interface DiskMetrics {
  totalGb: number;
  usedGb: number;
  freeGb: number;
  usagePercent: number;
  ioReadMbS: number;
  ioWriteMbS: number;
  iops?: number;
}

export interface NetworkMetrics {
  rxMbS: number;
  txMbS: number;
  connections: number;
  interfaces: NetworkInterface[];
  packetsRx?: number;
  packetsTx?: number;
  errorsRx?: number;
  errorsTx?: number;
}

export interface NetworkInterface {
  name: string;
  ipAddress: string;
  isUp: boolean;
  speedMbps?: number;
  type?: string;
}

export interface DockerMetrics {
  containersRunning: number;
  containersStopped: number;
  imagesCount: number;
  volumesCount: number;
  networksCount: number;
  diskUsageGb: number;
}

export interface K8sMetrics {
  nodesReady: number;
  nodesTotal: number;
  podsRunning: number;
  podsPending: number;
  podsFailed: number;
  deploymentsHealthy: number;
  servicesCount: number;
}

// Alert Types
export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  source: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  metadata?: Record<string, any>;
  actions?: AlertAction[];
}

export interface AlertAction {
  label: string;
  action: string;
  parameters?: Record<string, any>;
}

// Log Types
export interface LogEntry {
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  source: string;
  message: string;
  containerId?: string;
  podName?: string;
  namespace?: string;
  metadata?: Record<string, any>;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
  requestId?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Configuration Types
export interface AppConfig {
  theme: AppTheme;
  language: string;
  modules: ModuleConfig;
  monitoring: MonitoringConfig;
  extensions: ExtensionConfig;
}

export interface ModuleConfig {
  docker: {
    enabled: boolean;
    socket?: string;
    host?: string;
  };
  kubernetes: {
    enabled: boolean;
    config?: string;
    contexts?: K8sContext[];
  };
  ansible: {
    enabled: boolean;
    inventory?: string;
    vaultPassword?: string;
  };
}

export interface K8sContext {
  name: string;
  config: string;
  default?: boolean;
}

export interface MonitoringConfig {
  interval: string;
  retention: string;
  alerts: {
    enabled: boolean;
    channels: string[];
  };
}

export interface ExtensionConfig {
  autoUpdate: boolean;
  registry: string;
  allowedPermissions: string[];
}
