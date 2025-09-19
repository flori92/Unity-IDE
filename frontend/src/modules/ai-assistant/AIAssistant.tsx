import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  Divider,
  Button,
  CircularProgress,
  Fab,
  Drawer,
  AppBar,
  Toolbar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as UserIcon,
  BugReport as DebugIcon,
  Speed as OptimizeIcon,
  Security as SecurityIcon,
  CloudQueue as CloudIcon,
  Close as CloseIcon,
  Mic as MicIcon,
  AttachFile as AttachIcon,
  ContentCopy as CopyIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'code' | 'error' | 'suggestion' | 'analysis';
  language?: string;
  actions?: Action[];
  feedback?: 'positive' | 'negative';
}

interface Action {
  label: string;
  action: string;
  params?: any;
}

interface AIContext {
  infrastructure: {
    docker: { containers: number; images: number };
    kubernetes: { pods: number; nodes: number; services: number };
    ansible: { playbooks: number; hosts: number };
  };
  recentErrors: string[];
  currentProject: string;
}

const AIAssistant: React.FC = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Bonjour! Je suis votre assistant DevOps IA. Je peux vous aider avec Docker, Kubernetes, Ansible, et bien plus. Comment puis-je vous aider aujourd'hui?",
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [context] = useState<AIContext>({
    infrastructure: {
      docker: { containers: 5, images: 12 },
      kubernetes: { pods: 15, nodes: 3, services: 8 },
      ansible: { playbooks: 4, hosts: 10 },
    },
    recentErrors: [],
    currentProject: 'production',
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1500);
  };

  const generateAIResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    
    // Docker related
    if (lowerQuery.includes('docker')) {
      if (lowerQuery.includes('optimis') || lowerQuery.includes('optimi')) {
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: `J'ai analysé vos images Docker et voici mes recommandations d'optimisation :

\`\`\`dockerfile
# Utilisez des images multi-stage pour réduire la taille
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "index.js"]
\`\`\`

**Optimisations suggérées:**
- 🎯 Utilisation d'Alpine Linux (réduit 70% de la taille)
- 📦 Multi-stage builds (élimine les dépendances de build)
- 🔄 Layer caching optimisé
- 🚀 Résultat: Image réduite de 1.2GB à 180MB`,
          timestamp: new Date(),
          type: 'code',
          language: 'dockerfile',
          actions: [
            { label: 'Appliquer', action: 'apply_dockerfile' },
            { label: 'Scanner', action: 'scan_vulnerabilities' },
          ],
        };
      }
    }

    // Kubernetes related
    if (lowerQuery.includes('kubernetes') || lowerQuery.includes('k8s')) {
      if (lowerQuery.includes('scale') || lowerQuery.includes('scaling')) {
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Configuration d'auto-scaling recommandée pour votre application:

\`\`\`yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: your-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
\`\`\`

**Analyse de votre charge actuelle:**
- 📊 CPU moyen: 65% (pics à 85%)
- 💾 Mémoire: 72% stable
- 🎯 Recommandation: HPA avec 2-10 replicas`,
          timestamp: new Date(),
          type: 'code',
          language: 'yaml',
          actions: [
            { label: 'Déployer', action: 'deploy_hpa' },
            { label: 'Simuler', action: 'simulate_load' },
          ],
        };
      }
    }

    // Security analysis
    if (lowerQuery.includes('security') || lowerQuery.includes('sécurité')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🔐 **Analyse de sécurité complète:**

**Vulnérabilités détectées:**
- 🔴 **Critique (2)**: CVE-2023-1234 dans nginx:1.19
- 🟠 **Haute (5)**: Packages npm obsolètes
- 🟡 **Moyenne (12)**: Configurations non sécurisées

**Actions recommandées:**
1. Mettre à jour nginx vers 1.25.3
2. Activer les network policies Kubernetes
3. Implémenter RBAC strict
4. Scanner les secrets exposés
5. Activer l'audit logging

**Score de sécurité: 6.2/10** (Amélioration possible: 9.5/10)`,
        timestamp: new Date(),
        type: 'analysis',
        actions: [
          { label: 'Corriger tout', action: 'fix_all_vulnerabilities' },
          { label: 'Rapport détaillé', action: 'generate_security_report' },
          { label: 'Scanner maintenant', action: 'run_security_scan' },
        ],
      };
    }

    // Performance optimization
    if (lowerQuery.includes('performance') || lowerQuery.includes('lent')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `⚡ **Analyse de performance détectée:**

J'ai identifié plusieurs goulots d'étranglement:

1. **Base de données** (Impact: 45%)
   - Requêtes non optimisées détectées
   - Index manquants sur 3 tables critiques
   - Connection pool sous-dimensionné

2. **API Gateway** (Impact: 30%)
   - Rate limiting non configuré
   - Cache désactivé sur endpoints fréquents

3. **Pods Kubernetes** (Impact: 25%)
   - Limits/Requests mal configurés
   - Pas de HPA actif

**Solution proposée:**
\`\`\`sql
-- Optimisation DB
CREATE INDEX idx_user_timestamp ON logs(user_id, timestamp);
ALTER TABLE sessions SET innodb_buffer_pool_size = 2G;
\`\`\``,
        timestamp: new Date(),
        type: 'analysis',
        actions: [
          { label: 'Optimiser maintenant', action: 'apply_optimizations' },
          { label: 'Benchmark', action: 'run_benchmark' },
        ],
      };
    }

    // Default intelligent response
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Je comprends votre demande concernant "${query}". Basé sur l'analyse de votre infrastructure:

**État actuel:**
- 🐳 Docker: ${context.infrastructure.docker.containers} containers actifs
- ☸️ Kubernetes: ${context.infrastructure.kubernetes.pods} pods sur ${context.infrastructure.kubernetes.nodes} nodes
- 📚 Ansible: ${context.infrastructure.ansible.playbooks} playbooks disponibles

**Suggestions:**
1. Vérifier les logs des dernières 24h
2. Analyser les métriques de performance
3. Revoir la configuration de sécurité

Voulez-vous que j'approfondisse l'un de ces points?`,
      timestamp: new Date(),
      type: 'suggestion',
      actions: [
        { label: 'Analyser les logs', action: 'analyze_logs' },
        { label: 'Voir les métriques', action: 'show_metrics' },
      ],
    };
  };

  const handleAction = (action: string, params?: any) => {
    console.log('Executing action:', action, params);
    // Implement action handlers
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, feedback } : msg
      )
    );
  };

  const quickPrompts = [
    { label: 'Optimiser Docker', icon: <OptimizeIcon />, prompt: 'Comment optimiser mes images Docker?' },
    { label: 'Debug K8s', icon: <DebugIcon />, prompt: 'Mon pod Kubernetes crash, aide-moi à debugger' },
    { label: 'Sécurité', icon: <SecurityIcon />, prompt: 'Analyse la sécurité de mon infrastructure' },
    { label: 'Performance', icon: <CloudIcon />, prompt: 'Mon application est lente, trouve le problème' },
  ];

  return (
    <>
      {/* Floating AI Button */}
      <Fab
        color="primary"
        aria-label="ai-assistant"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }}
        onClick={() => setOpen(true)}
      >
        <AIIcon />
      </Fab>

      {/* AI Assistant Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 480 },
            maxWidth: '100%',
          },
        }}
      >
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <AIIcon sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              DevOps AI Assistant
            </Typography>
            <IconButton color="inherit" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 64px)' }}>
          {/* Quick Prompts */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              SUGGESTIONS RAPIDES
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {quickPrompts.map((prompt, index) => (
                <Chip
                  key={index}
                  icon={prompt.icon}
                  label={prompt.label}
                  onClick={() => setInput(prompt.prompt)}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>

          {/* Messages */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            <List>
              {messages.map((message, index) => (
                <React.Fragment key={message.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                      gap: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: message.role === 'user'
                            ? theme.palette.primary.main
                            : theme.palette.secondary.main,
                        }}
                      >
                        {message.role === 'user' ? <UserIcon /> : <AIIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        bgcolor: message.role === 'user'
                          ? alpha(theme.palette.primary.main, 0.1)
                          : theme.palette.background.paper,
                      }}
                    >
                      {message.type === 'code' ? (
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                            {message.content.split('```')[0]}
                          </Typography>
                          {message.language && (
                            <Box sx={{ position: 'relative' }}>
                              <IconButton
                                size="small"
                                sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
                                onClick={() => navigator.clipboard.writeText(message.content.match(/```[\s\S]*?```/)?.[0]?.replace(/```/g, '') || '')}
                              >
                                <CopyIcon fontSize="small" />
                              </IconButton>
                              <SyntaxHighlighter
                                language={message.language}
                                style={vscDarkPlus}
                                customStyle={{ borderRadius: 8 }}
                              >
                                {message.content.match(/```[\s\S]*?```/)?.[0]?.replace(/```/g, '').replace(message.language, '').trim() || ''}
                              </SyntaxHighlighter>
                            </Box>
                          )}
                          <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                            {message.content.split('```').slice(-1)[0]}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.content}
                        </Typography>
                      )}
                      
                      {/* Actions */}
                      {message.actions && (
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {message.actions.map((action, idx) => (
                            <Button
                              key={idx}
                              size="small"
                              variant="outlined"
                              onClick={() => handleAction(action.action, action.params)}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </Box>
                      )}

                      {/* Feedback */}
                      {message.role === 'assistant' && (
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleFeedback(message.id, 'positive')}
                            color={message.feedback === 'positive' ? 'success' : 'default'}
                          >
                            <ThumbUpIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleFeedback(message.id, 'negative')}
                            color={message.feedback === 'negative' ? 'error' : 'default'}
                          >
                            <ThumbDownIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Paper>
                  </ListItem>
                  {index < messages.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {loading && (
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      <AIIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">
                      L'assistant réfléchit...
                    </Typography>
                  </Box>
                </ListItem>
              )}
              <div ref={messagesEndRef} />
            </List>
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small">
                <AttachIcon />
              </IconButton>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Demandez-moi n'importe quoi sur votre infrastructure..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                size="small"
              />
              <IconButton
                color={isListening ? 'error' : 'default'}
                onClick={() => setIsListening(!isListening)}
              >
                <MicIcon />
              </IconButton>
              <IconButton color="primary" onClick={handleSend} disabled={!input.trim() || loading}>
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default AIAssistant;
