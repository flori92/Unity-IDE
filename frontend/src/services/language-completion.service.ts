/**
 * Language Completion Service - Auto-completion intelligente
 * Fournit des suggestions contextuelles pour différents langages
 */

export interface CompletionSuggestion {
  label: string;
  kind: 'keyword' | 'function' | 'type' | 'variable' | 'property';
  insertText: string;
  documentation?: string;
  detail?: string;
}

export class LanguageCompletionService {
  /**
   * Suggestions pour Dockerfile
   */
  getDockerfileCompletions(context: string, currentLine: string): CompletionSuggestion[] {
    const suggestions: CompletionSuggestion[] = [];

    // Instructions communes
    const instructions = [
      { label: 'FROM', kind: 'keyword' as const, insertText: 'FROM ${1:image}:${2:tag}', documentation: 'Base image for the build' },
      { label: 'RUN', kind: 'keyword' as const, insertText: 'RUN ${1:command}', documentation: 'Execute commands during build' },
      { label: 'COPY', kind: 'keyword' as const, insertText: 'COPY ${1:src} ${2:dest}', documentation: 'Copy files from host to container' },
      { label: 'ADD', kind: 'keyword' as const, insertText: 'ADD ${1:src} ${2:dest}', documentation: 'Copy files with URL support' },
      { label: 'WORKDIR', kind: 'keyword' as const, insertText: 'WORKDIR ${1:/app}', documentation: 'Set working directory' },
      { label: 'EXPOSE', kind: 'keyword' as const, insertText: 'EXPOSE ${1:80}', documentation: 'Expose port' },
      { label: 'ENV', kind: 'keyword' as const, insertText: 'ENV ${1:KEY}=${2:value}', documentation: 'Set environment variable' },
      { label: 'ARG', kind: 'keyword' as const, insertText: 'ARG ${1:NAME}=${2:default}', documentation: 'Build-time variable' },
      { label: 'LABEL', kind: 'keyword' as const, insertText: 'LABEL ${1:key}="${2:value}"', documentation: 'Add metadata' },
      { label: 'USER', kind: 'keyword' as const, insertText: 'USER ${1:user}', documentation: 'Set user' },
      { label: 'VOLUME', kind: 'keyword' as const, insertText: 'VOLUME ${1:["/data"]}', documentation: 'Create volume' },
      { label: 'ENTRYPOINT', kind: 'keyword' as const, insertText: 'ENTRYPOINT ${1:["executable"]}', documentation: 'Set entrypoint' },
      { label: 'CMD', kind: 'keyword' as const, insertText: 'CMD ${1:["executable"]}', documentation: 'Set default command' },
      { label: 'HEALTHCHECK', kind: 'keyword' as const, insertText: 'HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD ${1:command}', documentation: 'Health check' },
    ];

    // Images populaires
    const popularImages = [
      'ubuntu:20.04', 'ubuntu:22.04', 'node:18', 'node:20', 'python:3.9', 'python:3.11',
      'nginx:latest', 'nginx:alpine', 'postgres:15', 'mysql:8', 'redis:7', 'alpine:latest'
    ];

    // Si on est après FROM, suggérer des images
    if (currentLine.toUpperCase().startsWith('FROM ')) {
      popularImages.forEach(image => {
        suggestions.push({
          label: image,
          kind: 'variable',
          insertText: image,
          documentation: `Popular Docker image: ${image}`
        });
      });
    }

    // Ajouter les instructions si pas déjà présentes ou si c'est une nouvelle ligne
    if (!currentLine.trim() || currentLine.trim().length < 3) {
      suggestions.push(...instructions);
    }

    return suggestions;
  }

  /**
   * Suggestions pour Kubernetes YAML
   */
  getKubernetesCompletions(context: string, currentLine: string): CompletionSuggestion[] {
    const suggestions: CompletionSuggestion[] = [];

    // API Versions communes
    const apiVersions = [
      'v1', 'apps/v1', 'batch/v1', 'networking.k8s.io/v1', 'rbac.authorization.k8s.io/v1'
    ];

    // Resource types
    const resourceTypes = [
      { label: 'Pod', kind: 'type' as const, insertText: 'Pod', documentation: 'Smallest deployable unit' },
      { label: 'Deployment', kind: 'type' as const, insertText: 'Deployment', documentation: 'Manages replica sets' },
      { label: 'Service', kind: 'type' as const, insertText: 'Service', documentation: 'Network service abstraction' },
      { label: 'ConfigMap', kind: 'type' as const, insertText: 'ConfigMap', documentation: 'Configuration data' },
      { label: 'Secret', kind: 'type' as const, insertText: 'Secret', documentation: 'Sensitive configuration data' },
      { label: 'PersistentVolume', kind: 'type' as const, insertText: 'PersistentVolume', documentation: 'Storage resource' },
      { label: 'PersistentVolumeClaim', kind: 'type' as const, insertText: 'PersistentVolumeClaim', documentation: 'Storage request' },
      { label: 'Ingress', kind: 'type' as const, insertText: 'Ingress', documentation: 'HTTP/HTTPS routing' },
      { label: 'Job', kind: 'type' as const, insertText: 'Job', documentation: 'Run to completion' },
      { label: 'CronJob', kind: 'type' as const, insertText: 'CronJob', documentation: 'Scheduled jobs' },
    ];

    // Champs communs
    const commonFields = [
      'apiVersion:', 'kind:', 'metadata:', 'spec:', 'status:',
      'name:', 'namespace:', 'labels:', 'annotations:', 'selector:'
    ];

    // Détecter le contexte
    if (context.includes('apiVersion:')) {
      // Après apiVersion, suggérer les versions
      if (!currentLine.includes('apiVersion:')) {
        apiVersions.forEach(version => {
          suggestions.push({
            label: version,
            kind: 'type',
            insertText: version,
            documentation: `Kubernetes API version: ${version}`
          });
        });
      }
    } else if (context.includes('kind:')) {
      // Après kind, suggérer les types de ressources
      if (!currentLine.includes('kind:')) {
        suggestions.push(...resourceTypes);
      }
    } else {
      // Champs généraux
      commonFields.forEach(field => {
        suggestions.push({
          label: field,
          kind: 'property',
          insertText: field,
          documentation: `Kubernetes ${field.replace(':', '')} field`
        });
      });
    }

    return suggestions;
  }

  /**
   * Suggestions pour Ansible
   */
  getAnsibleCompletions(context: string, currentLine: string): CompletionSuggestion[] {
    const suggestions: CompletionSuggestion[] = [];

    // Modules communs
    const modules = [
      { label: 'command', kind: 'function' as const, insertText: 'command: ${1:command}', documentation: 'Execute command' },
      { label: 'shell', kind: 'function' as const, insertText: 'shell: ${1:command}', documentation: 'Execute shell command' },
      { label: 'copy', kind: 'function' as const, insertText: 'copy:\n  src: ${1:source}\n  dest: ${2:destination}', documentation: 'Copy files' },
      { label: 'file', kind: 'function' as const, insertText: 'file:\n  path: ${1:path}\n  state: ${2:present/absent}', documentation: 'Manage files/directories' },
      { label: 'template', kind: 'function' as const, insertText: 'template:\n  src: ${1:template.j2}\n  dest: ${2:destination}', documentation: 'Template files' },
      { label: 'service', kind: 'function' as const, insertText: 'service:\n  name: ${1:service}\n  state: ${2:started/stopped}', documentation: 'Manage services' },
      { label: 'package', kind: 'function' as const, insertText: 'package:\n  name: ${1:package}\n  state: ${2:present/absent}', documentation: 'Manage packages' },
      { label: 'user', kind: 'function' as const, insertText: 'user:\n  name: ${1:username}\n  state: ${2:present/absent}', documentation: 'Manage users' },
      { label: 'git', kind: 'function' as const, insertText: 'git:\n  repo: ${1:repository}\n  dest: ${2:destination}', documentation: 'Git operations' },
      { label: 'docker_container', kind: 'function' as const, insertText: 'docker_container:\n  name: ${1:name}\n  image: ${2:image}', documentation: 'Docker containers' },
    ];

    // États Ansible
    const states = ['present', 'absent', 'latest', 'started', 'stopped', 'restarted'];

    // Détecter si on est dans une tâche
    if (context.includes('tasks:') || context.includes('- name:')) {
      if (!currentLine.trim() || currentLine.trim().endsWith(':')) {
        suggestions.push(...modules);
      }
    }

    // Si on voit "state:", suggérer les états
    if (currentLine.includes('state:')) {
      states.forEach(state => {
        suggestions.push({
          label: state,
          kind: 'keyword',
          insertText: state,
          documentation: `Ansible state: ${state}`
        });
      });
    }

    return suggestions;
  }

  /**
   * Obtenir les suggestions selon le langage
   */
  getCompletions(language: string, context: string, currentLine: string): CompletionSuggestion[] {
    switch (language.toLowerCase()) {
      case 'dockerfile':
        return this.getDockerfileCompletions(context, currentLine);
      case 'yaml':
        // Détecter si c'est du Kubernetes
        if (context.includes('apiVersion:') || context.includes('kind:') || context.includes('metadata:')) {
          return this.getKubernetesCompletions(context, currentLine);
        }
        // Sinon, pourrait être Ansible
        if (context.includes('hosts:') || context.includes('tasks:') || context.includes('roles:')) {
          return this.getAnsibleCompletions(context, currentLine);
        }
        return [];
      default:
        return [];
    }
  }
}

export const languageCompletionService = new LanguageCompletionService();
