/**
 * Extension API - API publique pour les extensions
 * Permet aux développeurs de créer et gérer des extensions
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090/api/v1';

export interface ExtensionManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  publisher: string;
  main: string;
  engines: {
    unity: string;
  };
  contributes?: {
    commands?: CommandContribution[];
    views?: ViewContribution[];
    menus?: MenuContribution[];
    keybindings?: KeybindingContribution[];
    configuration?: ConfigurationContribution[];
  };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface CommandContribution {
  command: string;
  title: string;
  category?: string;
  icon?: string;
}

export interface ViewContribution {
  id: string;
  name: string;
  type: 'tree' | 'webview';
  contextValue?: string;
}

export interface MenuContribution {
  id: string;
  command: string;
  when?: string;
  group?: string;
}

export interface KeybindingContribution {
  key: string;
  command: string;
  when?: string;
  mac?: string;
  linux?: string;
  win?: string;
}

export interface ConfigurationContribution {
  title: string;
  properties: Record<string, ConfigurationProperty>;
}

export interface ConfigurationProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  default?: any;
  description?: string;
  enum?: string[];
  enumDescriptions?: string[];
}

export interface ExtensionPackage {
  manifest: ExtensionManifest;
  files: Record<string, string>; // filename -> content
  readme?: string;
  changelog?: string;
  license?: string;
}

export interface ExtensionInstance {
  id: string;
  manifest: ExtensionManifest;
  enabled: boolean;
  installedAt: string;
  updatedAt: string;
}

export interface ExtensionRegistryEntry {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  publisher: string;
  downloads: number;
  rating: number;
  ratingsCount: number;
  categories: string[];
  tags: string[];
  repository?: string;
  homepage?: string;
  license?: string;
  publishedAt: string;
  updatedAt: string;
}

class ExtensionAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Liste toutes les extensions installées
   */
  async listInstalled(): Promise<ExtensionInstance[]> {
    const response = await this.api.get('/extensions/installed');
    return response.data.extensions || [];
  }

  /**
   * Recherche des extensions dans le registry
   */
  async search(query: string, category?: string, limit: number = 50): Promise<ExtensionRegistryEntry[]> {
    const params = new URLSearchParams({ q: query, limit: limit.toString() });
    if (category) params.append('category', category);

    const response = await this.api.get(`/extensions/search?${params}`);
    return response.data.extensions || [];
  }

  /**
   * Obtient les détails d'une extension
   */
  async getExtension(id: string): Promise<ExtensionRegistryEntry> {
    const response = await this.api.get(`/extensions/${id}`);
    return response.data.extension;
  }

  /**
   * Télécharge et installe une extension
   */
  async install(id: string, version?: string): Promise<void> {
    const params = version ? { version } : {};
    await this.api.post(`/extensions/${id}/install`, params);
  }

  /**
   * Désinstalle une extension
   */
  async uninstall(id: string): Promise<void> {
    await this.api.post(`/extensions/${id}/uninstall`);
  }

  /**
   * Met à jour une extension
   */
  async update(id: string): Promise<void> {
    await this.api.post(`/extensions/${id}/update`);
  }

  /**
   * Active/désactive une extension
   */
  async toggle(id: string, enabled: boolean): Promise<void> {
    await this.api.post(`/extensions/${id}/toggle`, { enabled });
  }

  /**
   * Publie une nouvelle extension
   */
  async publish(packageData: ExtensionPackage): Promise<string> {
    const response = await this.api.post('/extensions/publish', packageData);
    return response.data.extensionId;
  }

  /**
   * Met à jour une extension publiée
   */
  async updatePublished(id: string, packageData: ExtensionPackage): Promise<void> {
    await this.api.put(`/extensions/${id}`, packageData);
  }

  /**
   * Supprime une extension publiée
   */
  async unpublish(id: string): Promise<void> {
    await this.api.delete(`/extensions/${id}`);
  }

  /**
   * Obtient les statistiques d'une extension
   */
  async getStats(id: string): Promise<{
    downloads: number;
    ratings: { average: number; count: number };
    trending: boolean;
  }> {
    const response = await this.api.get(`/extensions/${id}/stats`);
    return response.data.stats;
  }

  /**
   * Ajoute une note à une extension
   */
  async rate(id: string, rating: number, review?: string): Promise<void> {
    await this.api.post(`/extensions/${id}/rate`, { rating, review });
  }

  /**
   * Obtient les reviews d'une extension
   */
  async getReviews(id: string, page: number = 1, limit: number = 20): Promise<{
    reviews: Array<{
      userId: string;
      userName: string;
      rating: number;
      review: string;
      createdAt: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await this.api.get(`/extensions/${id}/reviews`, {
      params: { page, limit }
    });
    return response.data;
  }

  /**
   * Obtient les catégories disponibles
   */
  async getCategories(): Promise<string[]> {
    const response = await this.api.get('/extensions/categories');
    return response.data.categories || [];
  }

  /**
   * Obtient les extensions populaires
   */
  async getPopular(limit: number = 10): Promise<ExtensionRegistryEntry[]> {
    const response = await this.api.get('/extensions/popular', { params: { limit } });
    return response.data.extensions || [];
  }

  /**
   * Obtient les extensions tendance
   */
  async getTrending(limit: number = 10): Promise<ExtensionRegistryEntry[]> {
    const response = await this.api.get('/extensions/trending', { params: { limit } });
    return response.data.extensions || [];
  }
}

export const extensionAPI = new ExtensionAPI();
export default extensionAPI;
