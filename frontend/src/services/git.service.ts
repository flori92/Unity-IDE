/**
 * Git Service - Gestion Git
 * Service pour interagir avec Git (via API backend)
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090/api/v1';

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  modified: string[];
  added: string[];
  deleted: string[];
  untracked: string[];
  staged: string[];
}

export interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export interface GitBranch {
  name: string;
  current: boolean;
  remote: boolean;
}

export interface GitDiff {
  file: string;
  additions: number;
  deletions: number;
  changes: string;
}

class GitService {
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
   * Récupère le status Git
   */
  async getStatus(repoPath: string = '.'): Promise<GitStatus> {
    const response = await this.api.get('/git/status', {
      params: { path: repoPath },
    });
    return response.data;
  }

  /**
   * Liste les branches
   */
  async listBranches(repoPath: string = '.'): Promise<GitBranch[]> {
    const response = await this.api.get('/git/branches', {
      params: { path: repoPath },
    });
    return response.data.branches || [];
  }

  /**
   * Crée une nouvelle branche
   */
  async createBranch(name: string, repoPath: string = '.'): Promise<void> {
    await this.api.post('/git/branches', {
      name,
      path: repoPath,
    });
  }

  /**
   * Change de branche
   */
  async checkoutBranch(name: string, repoPath: string = '.'): Promise<void> {
    await this.api.post('/git/checkout', {
      branch: name,
      path: repoPath,
    });
  }

  /**
   * Stage des fichiers
   */
  async stageFiles(files: string[], repoPath: string = '.'): Promise<void> {
    await this.api.post('/git/add', {
      files,
      path: repoPath,
    });
  }

  /**
   * Unstage des fichiers
   */
  async unstageFiles(files: string[], repoPath: string = '.'): Promise<void> {
    await this.api.post('/git/reset', {
      files,
      path: repoPath,
    });
  }

  /**
   * Commit les changements
   */
  async commit(message: string, repoPath: string = '.'): Promise<void> {
    await this.api.post('/git/commit', {
      message,
      path: repoPath,
    });
  }

  /**
   * Push vers le remote
   */
  async push(repoPath: string = '.'): Promise<void> {
    await this.api.post('/git/push', {
      path: repoPath,
    });
  }

  /**
   * Pull depuis le remote
   */
  async pull(repoPath: string = '.'): Promise<void> {
    await this.api.post('/git/pull', {
      path: repoPath,
    });
  }

  /**
   * Récupère l'historique des commits
   */
  async getHistory(limit: number = 50, repoPath: string = '.'): Promise<GitCommit[]> {
    const response = await this.api.get('/git/log', {
      params: { limit, path: repoPath },
    });
    return response.data.commits || [];
  }

  /**
   * Récupère le diff d'un fichier
   */
  async getDiff(file: string, repoPath: string = '.'): Promise<GitDiff> {
    const response = await this.api.get('/git/diff', {
      params: { file, path: repoPath },
    });
    return response.data;
  }

  /**
   * Récupère le diff staged
   */
  async getStagedDiff(repoPath: string = '.'): Promise<GitDiff[]> {
    const response = await this.api.get('/git/diff/staged', {
      params: { path: repoPath },
    });
    return response.data.diffs || [];
  }

  /**
   * Discard les changements d'un fichier
   */
  async discardChanges(file: string, repoPath: string = '.'): Promise<void> {
    await this.api.post('/git/discard', {
      file,
      path: repoPath,
    });
  }
}

export const gitService = new GitService();
export default gitService;
