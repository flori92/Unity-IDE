// Terminal intégré avancé - Style K9s avec super-pouvoirs
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { mockBackend } from '../services/mockBackendService';
import { k9sIntegration } from '../services/k9sIntegration';

interface TerminalLine {
  id: string;
  content: string;
  type: 'input' | 'output' | 'error' | 'system';
  timestamp: Date;
}

interface TerminalContext {
  type: 'host' | 'docker' | 'kubernetes' | 'ansible';
  target?: string; // container ID, pod name, etc.
  namespace?: string;
}

export const IntegratedTerminal: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  initialContext?: TerminalContext;
}> = ({ isVisible, onClose, initialContext = { type: 'host' } }) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'welcome',
      content: '🐶 Unity DevOps IDE Terminal - K9s Enhanced Mode',
      type: 'system',
      timestamp: new Date(),
    },
    {
      id: 'help',
      content: 'Type "help" for commands, "contexts" for available contexts, "k9s" for K9s mode',
      type: 'system',
      timestamp: new Date(),
    }
  ]);

  const [currentInput, setCurrentInput] = useState('');
  const [context, setContext] = useState<TerminalContext>(initialContext);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isK9sMode, setIsK9sMode] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input when terminal becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  const addLine = useCallback((content: string, type: TerminalLine['type'] = 'output') => {
    const newLine: TerminalLine = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      type,
      timestamp: new Date(),
    };

    setLines(prev => [...prev, newLine]);
  }, []);

  const executeCommand = useCallback(async (command: string) => {
    if (!command.trim()) return;

    // Add to history
    setCommandHistory(prev => [...prev.slice(-49), command]); // Keep last 50 commands
    setHistoryIndex(-1);

    // Add command to terminal
    addLine(`${getContextPrefix()}${command}`, 'input');

    // Parse and execute command
    const args = command.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();

    try {
      switch (cmd) {
        case 'help':
          showHelp();
          break;

        case 'clear':
          setLines([]);
          break;

        case 'contexts':
          showContexts();
          break;

        case 'context':
        case 'ctx':
          if (args[1]) {
            changeContext(args.slice(1));
          } else {
            addLine(`Current context: ${context.type}${context.target ? ` (${context.target})` : ''}`);
          }
          break;

        case 'k9s':
          toggleK9sMode();
          break;

        case 'ls':
        case 'list':
          await listResources(args.slice(1));
          break;

        case 'logs':
          await showLogs(args.slice(1));
          break;

        case 'exec':
          await executeInContext(args.slice(1));
          break;

        case 'describe':
        case 'desc':
          await describeResource(args.slice(1));
          break;

        case 'delete':
        case 'del':
          await deleteResource(args.slice(1));
          break;

        case 'scale':
          await scaleResource(args.slice(1));
          break;

        case 'top':
        case 'metrics':
          await showMetrics(args.slice(1));
          break;

        default:
          await executeGenericCommand(command);
          break;
      }
    } catch (error) {
      addLine(`Error: ${error}`, 'error');
    }
  }, [context, addLine]);

  const getContextPrefix = () => {
    const emoji = {
      host: '💻',
      docker: '🐳',
      kubernetes: '☸️',
      ansible: '🎭'
    }[context.type];

    return `${emoji} ${context.target || context.type} $ `;
  };

  const showHelp = () => {
    const helpText = `
Unity DevOps IDE Terminal Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Context Management:
  contexts              - List available contexts
  context <type> [target] - Switch context (host/docker/kubernetes/ansible)
  ctx <type> [target]    - Alias for context

Resource Operations:
  ls [type]             - List resources (pods, services, containers, etc.)
  logs <name>           - Show logs for resource
  exec <cmd>            - Execute command in current context
  describe <name>       - Describe resource details
  delete <name>         - Delete resource
  scale <name> <count>  - Scale deployment/service

Monitoring:
  top                   - Show resource usage (like htop)
  metrics               - Show system metrics

K9s Integration:
  k9s                   - Toggle K9s mode for advanced navigation

Utilities:
  clear                 - Clear terminal
  help                  - Show this help

Examples:
  context docker web-server
  ls pods
  logs frontend-deployment
  exec ps aux
  scale my-deployment 3
    `;
    addLine(helpText);
  };

  const showContexts = () => {
    const contexts = `
Available Contexts:
━━━━━━━━━━━━━━━━━━━━
💻 host                    - Local system commands
🐳 docker [container]      - Docker container operations
☸️ kubernetes [namespace]  - Kubernetes cluster operations
🎭 ansible [target]        - Ansible playbook execution

Current: ${getContextPrefix().trim()}
    `;
    addLine(contexts);
  };

  const changeContext = (args: string[]) => {
    const newType = args[0] as TerminalContext['type'];
    const validTypes: TerminalContext['type'][] = ['host', 'docker', 'kubernetes', 'ansible'];

    if (!validTypes.includes(newType)) {
      addLine(`Invalid context type. Use: ${validTypes.join(', ')}`, 'error');
      return;
    }

    const newContext: TerminalContext = {
      type: newType,
      target: args[1],
      namespace: newType === 'kubernetes' ? (args[1] || 'default') : undefined,
    };

    setContext(newContext);
    addLine(`Switched to context: ${getContextPrefix().trim()}`);
  };

  const toggleK9sMode = () => {
    setIsK9sMode(!isK9sMode);
    addLine(`${isK9sMode ? 'Disabled' : 'Enabled'} K9s integration mode`);
    addLine('Use K9s shortcuts: j/k (navigate), 0-5 (views), : (command), h (help)');
  };

  const listResources = async (args: string[]) => {
    const resourceType = args[0] || 'all';

    try {
      switch (context.type) {
        case 'docker':
          const containers = await mockBackend.getContainers();
          containers.forEach(container => {
            addLine(`${container.id.substring(0, 12)} ${container.name} ${container.status} ${container.image}`);
          });
          break;

        case 'kubernetes':
          if (resourceType === 'pods' || resourceType === 'all') {
            const pods = await mockBackend.getPods(context.namespace);
            pods.forEach(pod => {
              addLine(`${pod.name} ${pod.status} ${pod.ready || '1/1'} ${pod.age || '2h'} ${pod.ip} ${pod.node}`);
            });
          }
          if (resourceType === 'services' || resourceType === 'all') {
            const services = await mockBackend.getServices(context.namespace);
            services.forEach(service => {
              addLine(`${service.name} ${service.type} ${service.clusterIP} ${service.ports?.join(', ')}`);
            });
          }
          break;

        default:
          addLine('Resource listing not available in current context');
      }
    } catch (error) {
      addLine(`Failed to list resources: ${error}`, 'error');
    }
  };

  const showLogs = async (args: string[]) => {
    const resourceName = args[0];
    if (!resourceName) {
      addLine('Usage: logs <resource-name>', 'error');
      return;
    }

    try {
      let logs: { logs: string[] };
      switch (context.type) {
        case 'docker':
          logs = await mockBackend.getContainerLogs(resourceName, 100);
          break;
        case 'kubernetes':
          logs = await mockBackend.getPodLogs(context.namespace || 'default', resourceName, 'app', 100);
          break;
        default:
          addLine('Logs not available in current context', 'error');
          return;
      }

      logs.logs.forEach(line => addLine(line));
    } catch (error) {
      addLine(`Failed to get logs: ${error}`, 'error');
    }
  };

  const executeInContext = async (args: string[]) => {
    const command = args.join(' ');
    if (!command) {
      addLine('Usage: exec <command>', 'error');
      return;
    }

    try {
      let result: { output: string; success: boolean };
      switch (context.type) {
        case 'docker':
          if (context.target) {
            result = await mockBackend.execDockerCommand(context.target, args);
          } else {
            addLine('No container selected. Use: context docker <container-name>', 'error');
            return;
          }
          break;
        case 'kubernetes':
          if (context.target) {
            result = await mockBackend.execK8sCommand(
              context.namespace || 'default',
              context.target,
              'app',
              args
            );
          } else {
            addLine('No pod selected. Use: context kubernetes <pod-name>', 'error');
            return;
          }
          break;
        case 'host':
          result = await mockBackend.execHostCommand('bash', ['-c', command]);
          break;
        default:
          result = { output: 'Command execution not available in current context', success: false };
      }

      addLine(result.output, result.success ? 'output' : 'error');
    } catch (error) {
      addLine(`Command failed: ${error}`, 'error');
    }
  };

  const describeResource = async (args: string[]) => {
    const resourceName = args[0];
    if (!resourceName) {
      addLine('Usage: describe <resource-name>', 'error');
      return;
    }

    addLine(`Describing ${context.type} resource: ${resourceName}`);
    addLine(`Context: ${JSON.stringify(context, null, 2)}`);
    addLine('Resource details would be shown here in YAML format');
  };

  const deleteResource = async (args: string[]) => {
    const resourceName = args[0];
    if (!resourceName) {
      addLine('Usage: delete <resource-name>', 'error');
      return;
    }

    // Confirmation
    addLine(`Are you sure you want to delete ${resourceName}? (y/N)`);
    // In a real implementation, we'd wait for user confirmation
    addLine(`Deletion of ${resourceName} would be performed here`);
  };

  const scaleResource = async (args: string[]) => {
    const resourceName = args[0];
    const count = parseInt(args[1]);

    if (!resourceName || isNaN(count)) {
      addLine('Usage: scale <resource-name> <count>', 'error');
      return;
    }

    try {
      await mockBackend.scaleDeployment(resourceName, context.namespace || 'default', count);
      addLine(`Scaled ${resourceName} to ${count} replicas`);
    } catch (error) {
      addLine(`Failed to scale: ${error}`, 'error');
    }
  };

  const showMetrics = async (args: string[]) => {
    try {
      const metrics = await mockBackend.getSystemMetrics();
      addLine(`CPU: ${metrics.cpu.toFixed(1)}%`);
      addLine(`Memory: ${metrics.memory.toFixed(1)}%`);
      addLine(`Disk: ${metrics.disk.toFixed(1)}%`);
      addLine(`Network: RX ${metrics.network.rx.toFixed(0)} KB/s, TX ${metrics.network.tx.toFixed(0)} KB/s`);
    } catch (error) {
      addLine(`Failed to get metrics: ${error}`, 'error');
    }
  };

  const executeGenericCommand = async (command: string) => {
    // Fallback to host command execution
    try {
      const result = await mockBackend.execHostCommand('bash', ['-c', command]);
      addLine(result.output, result.success ? 'output' : 'error');
    } catch (error) {
      addLine(`Command not found: ${command}`, 'error');
      addLine('Type "help" for available commands');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput('');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    } else if (event.key === 'Tab') {
      event.preventDefault();
      // Auto-completion would go here
      addLine('Tab completion not implemented yet', 'system');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      <div className="flex items-center justify-between p-2 bg-gray-800 text-white">
        <div className="flex items-center space-x-2">
          <span className="text-green-400">🔧</span>
          <span>Unity Terminal</span>
          <span className="text-gray-400">|</span>
          <span>{getContextPrefix().trim()}</span>
          {isK9sMode && <span className="text-yellow-400">(K9s Mode)</span>}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white px-2 py-1"
        >
          ✕
        </button>
      </div>

      <div
        ref={terminalRef}
        className="flex-1 p-4 font-mono text-sm overflow-auto bg-black text-green-400"
        style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={`mb-1 ${
              line.type === 'error' ? 'text-red-400' :
              line.type === 'system' ? 'text-yellow-400' :
              line.type === 'input' ? 'text-blue-400' : 'text-green-400'
            }`}
          >
            {line.content}
          </div>
        ))}
      </div>

      <div className="p-2 bg-gray-800 border-t border-gray-600">
        <div className="flex items-center">
          <span className="text-green-400 mr-2">{getContextPrefix()}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-green-400 outline-none font-mono"
            style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
            placeholder="Type a command..."
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Press ↑↓ for history, Tab for completion, Ctrl+C to cancel
        </div>
      </div>
    </div>
  );
};
