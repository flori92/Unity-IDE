/**
 * Tests unitaires pour ApiService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { apiService } from '../api.service';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Docker API', () => {
    it('should list containers', async () => {
      const mockContainers = {
        containers: [
          { id: '123', name: 'nginx', status: 'running' },
          { id: '456', name: 'postgres', status: 'running' },
        ],
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue({ data: mockContainers }),
        interceptors: {
          response: { use: vi.fn() },
        },
      });

      const result = await apiService.listContainers();
      expect(result).toEqual(mockContainers);
    });

    it('should start a container', async () => {
      const mockResponse = { success: true, message: 'Container started' };

      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockResolvedValue({ data: mockResponse }),
        interceptors: {
          response: { use: vi.fn() },
        },
      });

      const result = await apiService.startContainer('123');
      expect(result).toEqual(mockResponse);
    });

    it('should stop a container', async () => {
      const mockResponse = { success: true, message: 'Container stopped' };

      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockResolvedValue({ data: mockResponse }),
        interceptors: {
          response: { use: vi.fn() },
        },
      });

      const result = await apiService.stopContainer('123');
      expect(result).toEqual(mockResponse);
    });

    it('should get container logs', async () => {
      const mockLogs = {
        logs: ['Log line 1', 'Log line 2', 'Log line 3'],
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue({ data: mockLogs }),
        interceptors: {
          response: { use: vi.fn() },
        },
      });

      const result = await apiService.getContainerLogs('123', 100);
      expect(result).toEqual(mockLogs);
    });
  });

  describe('Kubernetes API', () => {
    it('should list pods', async () => {
      const mockPods = {
        pods: [
          { name: 'frontend-abc', namespace: 'default', status: 'Running' },
          { name: 'backend-def', namespace: 'default', status: 'Running' },
        ],
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue({ data: mockPods }),
        interceptors: {
          response: { use: vi.fn() },
        },
      });

      const result = await apiService.listPods('default');
      expect(result).toEqual(mockPods);
    });

    it('should scale a deployment', async () => {
      const mockResponse = { success: true, message: 'Deployment scaled' };

      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockResolvedValue({ data: mockResponse }),
        interceptors: {
          response: { use: vi.fn() },
        },
      });

      const result = await apiService.scaleDeployment('frontend', 3, 'default');
      expect(result).toEqual(mockResponse);
    });

    it('should get pod logs', async () => {
      const mockLogs = {
        logs: ['Pod log 1', 'Pod log 2'],
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue({ data: mockLogs }),
        interceptors: {
          response: { use: vi.fn() },
        },
      });

      const result = await apiService.getPodLogs('frontend-abc', 'default', 100);
      expect(result).toEqual(mockLogs);
    });
  });

  describe('Ansible API', () => {
    it('should list playbooks', async () => {
      const mockPlaybooks = {
        playbooks: [
          { name: 'deploy.yml', path: '/playbooks/deploy.yml' },
          { name: 'setup.yml', path: '/playbooks/setup.yml' },
        ],
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue({ data: mockPlaybooks }),
        interceptors: {
          response: { use: vi.fn() },
        },
      });

      const result = await apiService.listPlaybooks();
      expect(result).toEqual(mockPlaybooks);
    });

    it('should run a playbook', async () => {
      const mockResponse = {
        success: true,
        executionId: 'exec-123',
        message: 'Playbook started',
      };

      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockResolvedValue({ data: mockResponse }),
        interceptors: {
          response: { use: vi.fn() },
        },
      });

      const result = await apiService.runPlaybook('/playbooks/deploy.yml', 'production');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      const mockError = new Error('Network error');

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockRejectedValue(mockError),
        interceptors: {
          response: { use: vi.fn() },
        },
      });

      await expect(apiService.listContainers()).rejects.toThrow('Network error');
    });
  });
});
