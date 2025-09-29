import React, { useState } from 'react';
import { localBackend } from '../services/localBackendService';
import { Box, Tabs, Tab, Button, Typography, Chip, Tooltip } from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import DockerIcon from '@mui/icons-material/Computer';
import K8sIcon from '@mui/icons-material/CloudQueue';
import AnsibleIcon from '@mui/icons-material/PlayCircleOutline';

const CONTEXTS = [
  { key: 'host', label: 'Host', icon: <TerminalIcon /> },
  { key: 'docker', label: 'Docker', icon: <DockerIcon /> },
  { key: 'k8s', label: 'Kubernetes', icon: <K8sIcon /> },
  { key: 'ansible', label: 'Ansible', icon: <AnsibleIcon /> },
];

const mockPrompt = {
  host: 'user@host:~$',
  docker: 'docker@container:~#',
  k8s: 'k8s@cluster:~#',
  ansible: 'ansible@playbook:~$',
};

const ContextualTerminal: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [history, setHistory] = useState<string[][]>([[], [], [], []]);
  const [input, setInput] = useState(['', '', '', '']);
  //

  const handleRun = async (ctxIdx: number) => {
    const cmd = input[ctxIdx];
    if (!cmd.trim()) {
      return;
    }
    const key = CONTEXTS[ctxIdx].key as keyof typeof mockPrompt;
    setHistory(h => h.map((arr, i) => i === ctxIdx ? [...arr, `${mockPrompt[key]} ${cmd}`] : arr));
    setInput(inp => inp.map((v, i) => i === ctxIdx ? '' : v));

    let result: { output: string; success: boolean; error?: string } = { output: '', success: false };
    try {
      if (key === 'host') {
        // Découper la commande pour séparer binaire et args
        const [bin, ...args] = cmd.split(' ');
        result = await localBackend.execHostCommand(bin, args);
      } else if (key === 'docker') {
        // Demander l'ID du conteneur et la commande (ex: "containerId ls -l /")
        const [containerId, ...command] = cmd.split(' ');
        if (!containerId || command.length === 0) {
          throw new Error('Format: <containerId> <commande>');
        }
        result = await localBackend.execDockerCommand(containerId, command);
      } else if (key === 'k8s') {
        // Format: namespace pod container cmd...
        const [namespace, pod, container, ...command] = cmd.split(' ');
        if (!namespace || !pod || !container || command.length === 0) {
          throw new Error('Format: <namespace> <pod> <container> <commande>');
        }
        result = await localBackend.execK8sCommand(namespace, pod, container, command);
      } else if (key === 'ansible') {
        // Format: module args hosts
        const [module, args, hosts] = cmd.split(' ');
        if (!module || !args || !hosts) {
          throw new Error('Format: <module> <args> <hosts>');
        }
        result = await localBackend.execAnsibleAdhoc(module, args, hosts);
      }
    } catch (e: any) {
      result = { output: '', success: false, error: e.message };
    }
    setHistory(h => h.map((arr, i) => i === ctxIdx ? [...arr, result.success ? result.output : (result.error || result.output || 'Erreur inconnue')] : arr));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <TerminalIcon color="primary" />
        <Typography variant="h6">Terminal contextuel</Typography>
        <Tooltip title="Plusieurs contextes : Host, Docker, K8s, Ansible">
          <Chip label="Multi-contexte" color="info" size="small" />
        </Tooltip>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        {CONTEXTS.map((ctx) => (
          <Tab key={ctx.key} icon={ctx.icon} label={ctx.label} />
        ))}
      </Tabs>
      <Box sx={{ mt: 2, bgcolor: 'background.paper', borderRadius: 2, p: 2, minHeight: 220 }}>
        <Box sx={{ minHeight: 140, fontFamily: 'monospace', fontSize: 15, mb: 1 }}>
          {history[tab].length === 0 && <Typography color="text.secondary">Aucune commande exécutée.</Typography>}
          {history[tab].map((line, i) => <div key={i}>{line}</div>)}
        </Box>
        <form onSubmit={e => { e.preventDefault(); handleRun(tab); }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{mockPrompt[CONTEXTS[tab].key as keyof typeof mockPrompt]}</Typography>
            <input
              style={{ flex: 1, fontFamily: 'monospace', fontSize: 15, border: 'none', outline: 'none', background: 'transparent', color: 'inherit' }}
              value={input[tab]}
              onChange={e => setInput(inp => inp.map((v, i) => i === tab ? e.target.value : v))}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              aria-label="Entrée commande terminal"
            />
            <Button type="submit" variant="contained" size="small">Exécuter</Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default ContextualTerminal;
