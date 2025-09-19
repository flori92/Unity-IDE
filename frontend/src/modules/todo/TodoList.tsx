import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  IconButton, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  CheckCircle as CheckCircleIcon, 
  RadioButtonUnchecked as PendingIcon,
  PlayArrow as InProgressIcon,
  Flag as FlagIcon
} from '@mui/icons-material';

// Types
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  project_id?: string;
}

// Service pour communiquer avec l'API
const todoService = {
  getAllTasks: async (): Promise<Task[]> => {
    const response = await fetch('/api/todos');
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des tâches');
    }
    return response.json();
  },
  
  getTaskById: async (id: string): Promise<Task> => {
    const response = await fetch(`/api/todos/${id}`);
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de la tâche ${id}`);
    }
    return response.json();
  },
  
  createTask: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la création de la tâche');
    }
    return response.json();
  },
  
  updateTask: async (task: Task): Promise<Task> => {
    const response = await fetch(`/api/todos/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error(`Erreur lors de la mise à jour de la tâche ${task.id}`);
    }
    return response.json();
  },
  
  deleteTask: async (id: string): Promise<void> => {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression de la tâche ${id}`);
    }
  },
};

// Composant principal TodoList
const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task> | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Charger les tâches au chargement du composant
  useEffect(() => {
    fetchTasks();
  }, []);

  // Récupérer toutes les tâches
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await todoService.getAllTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des tâches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le dialogue pour créer/éditer une tâche
  const handleOpenDialog = (task?: Task) => {
    setCurrentTask(task || {
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
    });
    setOpenDialog(true);
  };

  // Fermer le dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTask(null);
  };

  // Sauvegarder une tâche (création ou mise à jour)
  const handleSaveTask = async () => {
    if (!currentTask || !currentTask.title) return;

    try {
      if (currentTask.id) {
        // Mise à jour
        const updatedTask = await todoService.updateTask(currentTask as Task);
        setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
      } else {
        // Création
        const newTask = await todoService.createTask(currentTask as Omit<Task, 'id' | 'created_at' | 'updated_at'>);
        setTasks([...tasks, newTask]);
      }
      handleCloseDialog();
    } catch (err) {
      setError('Erreur lors de la sauvegarde de la tâche');
      console.error(err);
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = async (id: string) => {
    try {
      await todoService.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression de la tâche');
      console.error(err);
    }
  };

  // Changer le statut d'une tâche
  const handleChangeStatus = async (task: Task, newStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      const updatedTask = { ...task, status: newStatus };
      const result = await todoService.updateTask(updatedTask);
      setTasks(tasks.map(t => t.id === result.id ? result : t));
    } catch (err) {
      setError('Erreur lors du changement de statut');
      console.error(err);
    }
  };

  // Filtrer les tâches selon les critères
  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  // Obtenir l'icône selon le statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'in_progress':
        return <InProgressIcon color="warning" />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };

  // Obtenir la couleur selon la priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Liste des tâches</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nouvelle tâche
        </Button>
      </Box>

      {/* Filtres */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            value={filterStatus}
            label="Statut"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="pending">En attente</MenuItem>
            <MenuItem value="in_progress">En cours</MenuItem>
            <MenuItem value="completed">Terminé</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Priorité</InputLabel>
          <Select
            value={filterPriority}
            label="Priorité"
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <MenuItem value="all">Toutes</MenuItem>
            <MenuItem value="low">Basse</MenuItem>
            <MenuItem value="medium">Moyenne</MenuItem>
            <MenuItem value="high">Haute</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Message d'erreur */}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Liste des tâches */}
      {loading ? (
        <Typography>Chargement des tâches...</Typography>
      ) : filteredTasks.length === 0 ? (
        <Typography>Aucune tâche trouvée</Typography>
      ) : (
        <List>
          {filteredTasks.map((task) => (
            <ListItem
              key={task.id}
              secondaryAction={
                <Box>
                  <IconButton edge="end" onClick={() => handleOpenDialog(task)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDeleteTask(task.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
              sx={{
                mb: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: task.status === 'completed' ? 'action.hover' : 'background.paper',
              }}
            >
              <ListItemIcon onClick={() => {
                const nextStatus = {
                  'pending': 'in_progress',
                  'in_progress': 'completed',
                  'completed': 'pending'
                } as const;
                handleChangeStatus(task, nextStatus[task.status]);
              }}>
                {getStatusIcon(task.status)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </Typography>
                    <Chip
                      icon={<FlagIcon />}
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority) as any}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={task.description}
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Dialogue pour créer/éditer une tâche */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentTask?.id ? 'Modifier la tâche' : 'Nouvelle tâche'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Titre"
            fullWidth
            value={currentTask?.title || ''}
            onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={currentTask?.description || ''}
            onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={currentTask?.status || 'pending'}
              label="Statut"
              onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value as Task['status'] })}
            >
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="in_progress">En cours</MenuItem>
              <MenuItem value="completed">Terminé</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Priorité</InputLabel>
            <Select
              value={currentTask?.priority || 'medium'}
              label="Priorité"
              onChange={(e) => setCurrentTask({ ...currentTask, priority: e.target.value as Task['priority'] })}
            >
              <MenuItem value="low">Basse</MenuItem>
              <MenuItem value="medium">Moyenne</MenuItem>
              <MenuItem value="high">Haute</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSaveTask} variant="contained" color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TodoList;