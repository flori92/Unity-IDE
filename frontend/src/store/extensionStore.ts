import { create } from 'zustand';
import { Extension, ExtensionManifest, ExtensionAPI } from '../types/extension';

interface ExtensionState {
  extensions: Extension[];
  installedExtensions: Extension[];
  activeExtensions: Map<string, any>;
  extensionAPI: ExtensionAPI | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchExtensions: () => Promise<void>;
  searchExtensions: (query: string) => Promise<void>;
  installExtension: (extensionId: string) => Promise<void>;
  uninstallExtension: (extensionId: string) => Promise<void>;
  enableExtension: (extensionId: string) => Promise<void>;
  disableExtension: (extensionId: string) => Promise<void>;
  updateExtension: (extensionId: string) => Promise<void>;
  loadExtension: (manifest: ExtensionManifest) => Promise<void>;
  executeExtensionCommand: (command: string, ...args: any[]) => Promise<any>;
}

// Mock data for demonstration
const mockExtensions: Extension[] = [
  {
    id: 'aws-toolkit',
    name: 'aws-toolkit',
    displayName: 'AWS Toolkit',
    description: 'Complete AWS integration with EC2, S3, Lambda, CloudFormation, and more.',
    version: '2.1.0',
    author: {
      name: 'AWS Team',
      verified: true,
      avatar: 'https://avatars.githubusercontent.com/u/2232217',
    },
    icon: '☁️',
    categories: ['cloud', 'deployment'],
    tags: ['aws', 'cloud', 'ec2', 's3', 'lambda'],
    downloads: 125000,
    rating: 4.8,
    reviews: 2341,
    lastUpdated: new Date('2024-01-15'),
    size: '12.5 MB',
    installed: false,
    enabled: false,
    hasUpdate: false,
    trending: true,
    featured: true,
    pricing: 'free',
    permissions: ['filesystem', 'network', 'credentials'],
    repository: 'https://github.com/aws/aws-toolkit',
    homepage: 'https://aws.amazon.com',
    compatibility: {
      minVersion: '1.0.0',
      platforms: ['windows', 'mac', 'linux'],
    },
  },
  {
    id: 'github-copilot',
    name: 'github-copilot',
    displayName: 'GitHub Copilot',
    description: 'AI pair programmer that helps you write code faster with AI-powered suggestions.',
    version: '1.8.0',
    author: {
      name: 'GitHub',
      verified: true,
      avatar: 'https://avatars.githubusercontent.com/u/9919',
    },
    icon: '🤖',
    categories: ['ai', 'productivity'],
    tags: ['ai', 'copilot', 'code-completion'],
    downloads: 890000,
    rating: 4.6,
    reviews: 5432,
    lastUpdated: new Date('2024-01-10'),
    size: '25.3 MB',
    installed: true,
    enabled: true,
    hasUpdate: true,
    trending: true,
    featured: false,
    pricing: 'freemium',
    price: 10,
    permissions: ['filesystem', 'network'],
    repository: 'https://github.com/github/copilot',
    compatibility: {
      minVersion: '1.0.0',
      platforms: ['windows', 'mac', 'linux'],
    },
  },
  {
    id: 'terraform-tools',
    name: 'terraform-tools',
    displayName: 'Terraform Tools',
    description: 'Complete Terraform support with syntax highlighting, validation, and deployment.',
    version: '3.0.2',
    author: {
      name: 'HashiCorp',
      verified: true,
    },
    icon: '🏗️',
    categories: ['infrastructure', 'deployment'],
    tags: ['terraform', 'iac', 'infrastructure'],
    downloads: 67000,
    rating: 4.7,
    reviews: 892,
    lastUpdated: new Date('2024-01-12'),
    size: '8.2 MB',
    installed: false,
    enabled: false,
    hasUpdate: false,
    trending: false,
    featured: true,
    pricing: 'free',
    permissions: ['filesystem', 'network'],
    repository: 'https://github.com/hashicorp/terraform',
    compatibility: {
      minVersion: '1.0.0',
      platforms: ['windows', 'mac', 'linux'],
    },
  },
  {
    id: 'dracula-theme',
    name: 'dracula-theme',
    displayName: 'Dracula Theme',
    description: 'A dark theme for DevOps Unity IDE with beautiful syntax highlighting.',
    version: '1.0.0',
    author: {
      name: 'Dracula Theme',
      verified: false,
    },
    icon: '🧛',
    categories: ['themes'],
    tags: ['theme', 'dark', 'color-scheme'],
    downloads: 234000,
    rating: 4.9,
    reviews: 3421,
    lastUpdated: new Date('2024-01-08'),
    size: '120 KB',
    installed: true,
    enabled: false,
    hasUpdate: false,
    trending: false,
    featured: false,
    pricing: 'free',
    permissions: [],
    repository: 'https://github.com/dracula/dracula-theme',
    compatibility: {
      minVersion: '1.0.0',
      platforms: ['windows', 'mac', 'linux'],
    },
  },
  {
    id: 'gitlab-workflow',
    name: 'gitlab-workflow',
    displayName: 'GitLab Workflow',
    description: 'GitLab integration for merge requests, issues, pipelines, and more.',
    version: '2.5.1',
    author: {
      name: 'GitLab',
      verified: true,
    },
    icon: '🦊',
    categories: ['version-control', 'productivity'],
    tags: ['gitlab', 'git', 'ci-cd'],
    downloads: 45000,
    rating: 4.5,
    reviews: 567,
    lastUpdated: new Date('2024-01-14'),
    size: '5.8 MB',
    installed: false,
    enabled: false,
    hasUpdate: false,
    trending: false,
    featured: false,
    pricing: 'free',
    permissions: ['network', 'credentials'],
    repository: 'https://gitlab.com/gitlab-org/gitlab-vscode',
    compatibility: {
      minVersion: '1.0.0',
      platforms: ['windows', 'mac', 'linux'],
    },
  },
];

export const useExtensionStore = create<ExtensionState>((set, get) => ({
  extensions: [],
  installedExtensions: [],
  activeExtensions: new Map(),
  extensionAPI: null,
  loading: false,
  error: null,

  fetchExtensions: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ extensions: mockExtensions, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch extensions', loading: false });
    }
  },

  searchExtensions: async (query: string) => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const filtered = mockExtensions.filter(ext =>
        ext.displayName.toLowerCase().includes(query.toLowerCase()) ||
        ext.description.toLowerCase().includes(query.toLowerCase()) ||
        ext.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      set({ extensions: filtered, loading: false });
    } catch (error) {
      set({ error: 'Search failed', loading: false });
    }
  },

  installExtension: async (extensionId: string) => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const extension = get().extensions.find(e => e.id === extensionId);
      if (extension) {
        const updated = { ...extension, installed: true };
        set(state => ({
          installedExtensions: [...state.installedExtensions, updated],
          extensions: state.extensions.map(e => e.id === extensionId ? updated : e),
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: 'Installation failed', loading: false });
    }
  },

  uninstallExtension: async (extensionId: string) => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      set(state => ({
        installedExtensions: state.installedExtensions.filter(e => e.id !== extensionId),
        extensions: state.extensions.map(e => 
          e.id === extensionId ? { ...e, installed: false, enabled: false } : e
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Uninstallation failed', loading: false });
    }
  },

  enableExtension: async (extensionId: string) => {
    set(state => ({
      installedExtensions: state.installedExtensions.map(e =>
        e.id === extensionId ? { ...e, enabled: true } : e
      ),
    }));
  },

  disableExtension: async (extensionId: string) => {
    set(state => ({
      installedExtensions: state.installedExtensions.map(e =>
        e.id === extensionId ? { ...e, enabled: false } : e
      ),
    }));
  },

  updateExtension: async (extensionId: string) => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      set(state => ({
        installedExtensions: state.installedExtensions.map(e =>
          e.id === extensionId ? { ...e, hasUpdate: false, version: '2.0.0' } : e
        ),
        extensions: state.extensions.map(e =>
          e.id === extensionId ? { ...e, hasUpdate: false, version: '2.0.0' } : e
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Update failed', loading: false });
    }
  },

  loadExtension: async (manifest: ExtensionManifest) => {
    // Load extension module dynamically
    console.log('Loading extension:', manifest.id);
  },

  executeExtensionCommand: async (command: string, ...args: any[]) => {
    console.log('Executing command:', command, args);
    return null;
  },
}));
