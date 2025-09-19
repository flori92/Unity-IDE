import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  MarkerType,
  NodeTypes,
  Handle,
  Position,
  ReactFlowProvider,
  useReactFlow,
} from 'react-flow-renderer';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Badge,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  Code as CodeIcon,
  Build as BuildIcon,
  BugReport as TestIcon,
  CloudUpload as DeployIcon,
  Security as SecurityIcon,
  NotificationsActive as NotifyIcon,
  AccountTree as BranchIcon,
  Timer as TimerIcon,
  CheckCircle as ApprovalIcon,
  GitHub as GitHubIcon,
  Storage as ArtifactIcon,
  Docker as DockerIcon,
  CloudQueue as K8sIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Upload as ImportIcon,
  Download as ExportIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as FitIcon,
  Schedule as ScheduleIcon,
  Loop as ParallelIcon,
  CallSplit as ConditionalIcon,
} from '@mui/icons-material';

// Custom Node Components
const CustomNode = ({ data, selected }: any) => {
  const theme = useTheme();
  
  const getNodeColor = () => {
    switch (data.type) {
      case 'source': return theme.palette.info.main;
      case 'build': return theme.palette.warning.main;
      case 'test': return theme.palette.secondary.main;
      case 'deploy': return theme.palette.success.main;
      case 'security': return theme.palette.error.main;
      case 'approval': return theme.palette.primary.main;
      default: return theme.palette.grey[600];
    }
  };

  const getNodeIcon = () => {
    switch (data.type) {
      case 'source': return <GitHubIcon />;
      case 'build': return <BuildIcon />;
      case 'test': return <TestIcon />;
      case 'deploy': return <DeployIcon />;
      case 'security': return <SecurityIcon />;
      case 'approval': return <ApprovalIcon />;
      case 'notify': return <NotifyIcon />;
      case 'artifact': return <ArtifactIcon />;
      default: return <CodeIcon />;
    }
  };

  return (
    <Card
      sx={{
        minWidth: 200,
        border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        bgcolor: alpha(getNodeColor(), 0.1),
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: theme.palette.grey[600], width: 8, height: 8 }}
      />
      
      <CardContent sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar sx={{ width: 24, height: 24, bgcolor: getNodeColor() }}>
            {getNodeIcon()}
          </Avatar>
          <Typography variant="subtitle2" fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
        
        {data.status && (
          <Chip
            label={data.status}
            size="small"
            color={data.status === 'success' ? 'success' : data.status === 'running' ? 'warning' : 'default'}
            sx={{ mb: 1 }}
          />
        )}
        
        {data.duration && (
          <Typography variant="caption" color="text.secondary" display="block">
            Duration: {data.duration}
          </Typography>
        )}
        
        {data.config && Object.keys(data.config).length > 0 && (
          <Box sx={{ mt: 1 }}>
            {Object.entries(data.config).slice(0, 2).map(([key, value]: any) => (
              <Typography key={key} variant="caption" color="text.secondary" display="block">
                {key}: {value}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: theme.palette.grey[600], width: 8, height: 8 }}
      />
    </Card>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// Pipeline Template
interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  category: string;
}

const PipelineDesigner: React.FC = () => {
  const theme = useTheme();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [pipelineName, setPipelineName] = useState('My Pipeline');
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Node Templates
  const nodeTemplates = [
    { type: 'source', label: 'Git Clone', icon: <GitHubIcon />, category: 'Source' },
    { type: 'build', label: 'Docker Build', icon: <DockerIcon />, category: 'Build' },
    { type: 'build', label: 'Maven Build', icon: <BuildIcon />, category: 'Build' },
    { type: 'build', label: 'NPM Build', icon: <BuildIcon />, category: 'Build' },
    { type: 'test', label: 'Unit Tests', icon: <TestIcon />, category: 'Test' },
    { type: 'test', label: 'Integration Tests', icon: <TestIcon />, category: 'Test' },
    { type: 'security', label: 'Security Scan', icon: <SecurityIcon />, category: 'Security' },
    { type: 'security', label: 'SAST Analysis', icon: <SecurityIcon />, category: 'Security' },
    { type: 'deploy', label: 'Deploy to K8s', icon: <K8sIcon />, category: 'Deploy' },
    { type: 'deploy', label: 'Deploy to AWS', icon: <CloudQueue />, category: 'Deploy' },
    { type: 'approval', label: 'Manual Approval', icon: <ApprovalIcon />, category: 'Control' },
    { type: 'notify', label: 'Send Notification', icon: <NotifyIcon />, category: 'Notify' },
    { type: 'parallel', label: 'Parallel Stage', icon: <ParallelIcon />, category: 'Control' },
    { type: 'conditional', label: 'Conditional', icon: <ConditionalIcon />, category: 'Control' },
  ];

  // Pipeline Templates
  const pipelineTemplates: PipelineTemplate[] = [
    {
      id: '1',
      name: 'Simple CI/CD',
      description: 'Basic build and deploy pipeline',
      category: 'Basic',
      nodes: [
        { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Git Clone', type: 'source' } },
        { id: '2', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Build', type: 'build' } },
        { id: '3', type: 'custom', position: { x: 250, y: 250 }, data: { label: 'Test', type: 'test' } },
        { id: '4', type: 'custom', position: { x: 250, y: 350 }, data: { label: 'Deploy', type: 'deploy' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
        { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
        { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' },
      ],
    },
    {
      id: '2',
      name: 'Full DevSecOps',
      description: 'Complete pipeline with security and approvals',
      category: 'Advanced',
      nodes: [
        { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Git Clone', type: 'source' } },
        { id: '2', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Build', type: 'build' } },
        { id: '3', type: 'custom', position: { x: 150, y: 250 }, data: { label: 'Unit Tests', type: 'test' } },
        { id: '4', type: 'custom', position: { x: 350, y: 250 }, data: { label: 'Security Scan', type: 'security' } },
        { id: '5', type: 'custom', position: { x: 250, y: 350 }, data: { label: 'Manual Approval', type: 'approval' } },
        { id: '6', type: 'custom', position: { x: 250, y: 450 }, data: { label: 'Deploy to Staging', type: 'deploy' } },
        { id: '7', type: 'custom', position: { x: 250, y: 550 }, data: { label: 'Deploy to Prod', type: 'deploy' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
        { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
        { id: 'e2-4', source: '2', target: '4', type: 'smoothstep' },
        { id: 'e3-5', source: '3', target: '5', type: 'smoothstep' },
        { id: 'e4-5', source: '4', target: '5', type: 'smoothstep' },
        { id: 'e5-6', source: '5', target: '6', type: 'smoothstep' },
        { id: 'e6-7', source: '6', target: '7', type: 'smoothstep' },
      ],
    },
  ];

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      const nodeData = JSON.parse(event.dataTransfer.getData('nodeData'));

      if (type === undefined || !reactFlowBounds) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode: Node = {
        id: `${nodes.length + 1}`,
        type: 'custom',
        position,
        data: { 
          label: nodeData.label, 
          type: nodeData.type,
          config: {},
          status: null,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      saveToHistory();
    },
    [nodes, setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setConfigDialogOpen(true);
  }, []);

  const onDragStart = (event: React.DragEvent, nodeType: any) => {
    event.dataTransfer.setData('application/reactflow', 'custom');
    event.dataTransfer.setData('nodeData', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const runPipeline = async () => {
    setIsRunning(true);
    
    // Simulate pipeline execution
    for (const node of nodes) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, status: 'running' } }
            : n
        )
      );
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, status: 'success', duration: '1.5s' } }
            : n
        )
      );
    }
    
    setIsRunning(false);
  };

  const loadTemplate = (template: PipelineTemplate) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setPipelineName(template.name);
    saveToHistory();
  };

  const exportPipeline = () => {
    const pipeline = {
      name: pipelineName,
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(pipeline, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${pipelineName.replace(/\s+/g, '-').toLowerCase()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? 300 : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 300,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Pipeline Designer
          </Typography>
          <TextField
            fullWidth
            label="Pipeline Name"
            value={pipelineName}
            onChange={(e) => setPipelineName(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Box>

        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ px: 2 }}>
          <Tab label="Components" />
          <Tab label="Templates" />
          <Tab label="Settings" />
        </Tabs>

        <Divider />

        {activeTab === 0 && (
          <List sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
              Drag components to canvas
            </Typography>
            {['Source', 'Build', 'Test', 'Security', 'Deploy', 'Control', 'Notify'].map(category => (
              <Box key={category} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ px: 2, mb: 1 }}>
                  {category}
                </Typography>
                {nodeTemplates
                  .filter(n => n.category === category)
                  .map((node, index) => (
                    <ListItem
                      key={index}
                      draggable
                      onDragStart={(e) => onDragStart(e, node)}
                      sx={{
                        cursor: 'grab',
                        '&:hover': { bgcolor: 'action.hover' },
                        borderRadius: 1,
                        mb: 0.5,
                      }}
                    >
                      <ListItemIcon>{node.icon}</ListItemIcon>
                      <ListItemText primary={node.label} />
                    </ListItem>
                  ))}
              </Box>
            ))}
          </List>
        )}

        {activeTab === 1 && (
          <List sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
              Pipeline Templates
            </Typography>
            {pipelineTemplates.map((template) => (
              <Card key={template.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" paragraph>
                    {template.description}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => loadTemplate(template)}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </List>
        )}

        {activeTab === 2 && (
          <Box sx={{ p: 2 }}>
            <FormControlLabel
              control={<Switch />}
              label="Auto-save"
            />
            <FormControlLabel
              control={<Switch />}
              label="Show grid"
            />
            <FormControlLabel
              control={<Switch />}
              label="Snap to grid"
            />
            <FormControlLabel
              control={<Switch />}
              label="Show minimap"
            />
          </Box>
        )}
      </Drawer>

      {/* Main Canvas */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        {/* Toolbar */}
        <Paper
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            zIndex: 10,
            p: 1,
            display: 'flex',
            gap: 1,
            alignItems: 'center',
          }}
        >
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
            <MenuIcon />
          </IconButton>
          
          <Divider orientation="vertical" flexItem />
          
          <Button
            variant="contained"
            color="success"
            startIcon={isRunning ? <StopIcon /> : <PlayIcon />}
            onClick={isRunning ? () => setIsRunning(false) : runPipeline}
            disabled={nodes.length === 0}
          >
            {isRunning ? 'Stop' : 'Run'}
          </Button>
          
          <IconButton onClick={undo} disabled={historyIndex <= 0}>
            <UndoIcon />
          </IconButton>
          <IconButton onClick={redo} disabled={historyIndex >= history.length - 1}>
            <RedoIcon />
          </IconButton>
          
          <Divider orientation="vertical" flexItem />
          
          <IconButton onClick={() => console.log('Save pipeline')}>
            <SaveIcon />
          </IconButton>
          <IconButton onClick={exportPipeline}>
            <ExportIcon />
          </IconButton>
          <IconButton>
            <ImportIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Chip
            label={`${nodes.length} stages`}
            size="small"
            color={isRunning ? 'warning' : 'default'}
          />
          
          <IconButton>
            <SettingsIcon />
          </IconButton>
        </Paper>

        {/* React Flow */}
        <ReactFlowProvider>
          <div ref={reactFlowWrapper} style={{ height: '100%', width: '100%' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background variant="dots" gap={12} size={1} />
              <Controls />
              <MiniMap
                nodeStrokeColor={(n) => {
                  if (n.data?.status === 'success') return theme.palette.success.main;
                  if (n.data?.status === 'running') return theme.palette.warning.main;
                  return theme.palette.grey[400];
                }}
                nodeColor={(n) => {
                  if (n.data?.status === 'success') return alpha(theme.palette.success.main, 0.1);
                  if (n.data?.status === 'running') return alpha(theme.palette.warning.main, 0.1);
                  return theme.palette.background.paper;
                }}
              />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </Box>

      {/* Node Configuration Dialog */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Configure Stage: {selectedNode?.data.label}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Stage Name"
              defaultValue={selectedNode?.data.label}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Environment</InputLabel>
              <Select label="Environment">
                <MenuItem value="development">Development</MenuItem>
                <MenuItem value="staging">Staging</MenuItem>
                <MenuItem value="production">Production</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Script/Command"
              placeholder="Enter commands or script"
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={<Switch />}
              label="Continue on error"
            />
            <FormControlLabel
              control={<Switch />}
              label="Run in parallel"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setConfigDialogOpen(false)}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Add missing import
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
  </svg>
);

const CloudQueue = CloudIcon;

export default PipelineDesigner;
