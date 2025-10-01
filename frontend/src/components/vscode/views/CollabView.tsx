/**
 * CollabView - Vue principale de collaboration
 * Gère les sessions collaboratives, les participants, et les permissions
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  People,
  PersonAdd,
  ExitToApp,
  Circle,
  ContentCopy,
  Settings,
  VideoCall,
  Chat,
} from '@mui/icons-material';
import { useCollaboration } from '../../../hooks/useCollaboration';
import { usePresence } from '../../../hooks/usePresence';
import { SharePermission } from '../../../services/collaboration.service';

export const CollabView: React.FC = () => {
  const {
    currentSession,
    isConnected,
    createSession,
    joinSession,
    leaveSession,
    inviteUser,
    loading,
    error,
  } = useCollaboration();

  const { onlineUsers, allPresences } = usePresence();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor' | 'admin'>('editor');

  const handleCreateSession = async () => {
    if (!sessionName.trim()) return;

    try {
      await createSession('project-1', sessionName);
      setShowCreateDialog(false);
      setSessionName('');
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const handleJoinSession = async () => {
    if (!sessionId.trim()) return;

    try {
      await joinSession(sessionId);
      setShowJoinDialog(false);
      setSessionId('');
    } catch (err) {
      console.error('Failed to join session:', err);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;

    const permission: SharePermission = {
      userId: inviteEmail, // En production, résoudre l'email en userId
      role: inviteRole,
      canEdit: inviteRole === 'editor' || inviteRole === 'admin',
      canComment: true,
      canInvite: inviteRole === 'admin',
    };

    try {
      await inviteUser(inviteEmail, permission);
      setShowInviteDialog(false);
      setInviteEmail('');
    } catch (err) {
      console.error('Failed to invite user:', err);
    }
  };

  const handleCopySessionId = () => {
    if (currentSession) {
      navigator.clipboard.writeText(currentSession.id);
      // TODO: Afficher un toast de confirmation
    }
  };

  const getStatusColor = (userId: string): string => {
    const presence = allPresences.find((p) => p.userId === userId);
    if (!presence) return '#858585';

    switch (presence.status) {
      case 'online':
        return '#4caf50';
      case 'away':
        return '#ff9800';
      case 'busy':
        return '#f44336';
      case 'offline':
      default:
        return '#858585';
    }
  };

  const getStatusLabel = (userId: string): string => {
    const presence = allPresences.find((p) => p.userId === userId);
    if (!presence) return 'Offline';

    switch (presence.status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      case 'offline':
      default:
        return 'Offline';
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #2d2d30',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <People sx={{ color: '#007acc' }} />
          <Typography variant="h6" sx={{ color: '#cccccc', fontSize: '16px' }}>
            Collaboration
          </Typography>
          {isConnected && (
            <Chip
              label="Connected"
              size="small"
              sx={{ bgcolor: '#4caf50', color: 'white', height: 20 }}
            />
          )}
        </Box>

        {currentSession && (
          <IconButton size="small" onClick={() => leaveSession()} sx={{ color: '#858585' }}>
            <ExitToApp />
          </IconButton>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {!currentSession ? (
          // No active session
          <Box>
            <Typography variant="body2" sx={{ color: '#858585', mb: 3 }}>
              Start or join a collaboration session to work with your team in real-time.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<People />}
                onClick={() => setShowCreateDialog(true)}
                sx={{
                  bgcolor: '#007acc',
                  '&:hover': { bgcolor: '#005a9e' },
                }}
              >
                Create Session
              </Button>

              <Button
                variant="outlined"
                startIcon={<People />}
                onClick={() => setShowJoinDialog(true)}
                sx={{
                  color: '#007acc',
                  borderColor: '#007acc',
                  '&:hover': {
                    borderColor: '#007acc',
                    bgcolor: 'rgba(0, 122, 204, 0.1)',
                  },
                }}
              >
                Join Session
              </Button>
            </Box>

            {/* Online Users */}
            {onlineUsers.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" sx={{ color: '#cccccc', mb: 2 }}>
                  Online Now ({onlineUsers.length})
                </Typography>
                <List sx={{ p: 0 }}>
                  {onlineUsers.map((user) => (
                    <ListItem
                      key={user.userId}
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#007acc' }}>
                          {user.userId.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.userId}
                        secondary={user.currentFile || 'Idle'}
                        primaryTypographyProps={{ sx: { color: '#cccccc', fontSize: '14px' } }}
                        secondaryTypographyProps={{ sx: { color: '#858585', fontSize: '12px' } }}
                      />
                      <Circle sx={{ fontSize: 12, color: getStatusColor(user.userId) }} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        ) : (
          // Active session
          <Box>
            {/* Session Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ color: '#cccccc', mb: 1 }}>
                {currentSession.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#858585' }}>
                  Session ID:
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#007acc',
                    fontFamily: 'monospace',
                    bgcolor: 'rgba(0, 122, 204, 0.1)',
                    px: 1,
                    py: 0.5,
                    borderRadius: 0.5,
                  }}
                >
                  {currentSession.id.substring(0, 12)}...
                </Typography>
                <Tooltip title="Copy Session ID">
                  <IconButton size="small" onClick={handleCopySessionId} sx={{ color: '#858585' }}>
                    <ContentCopy sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider sx={{ borderColor: '#2d2d30', mb: 2 }} />

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<PersonAdd />}
                onClick={() => setShowInviteDialog(true)}
                sx={{
                  color: '#007acc',
                  borderColor: '#007acc',
                  fontSize: '12px',
                  '&:hover': {
                    borderColor: '#007acc',
                    bgcolor: 'rgba(0, 122, 204, 0.1)',
                  },
                }}
              >
                Invite
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Chat />}
                sx={{
                  color: '#4caf50',
                  borderColor: '#4caf50',
                  fontSize: '12px',
                  '&:hover': {
                    borderColor: '#4caf50',
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                  },
                }}
              >
                Chat
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<VideoCall />}
                sx={{
                  color: '#ff9800',
                  borderColor: '#ff9800',
                  fontSize: '12px',
                  '&:hover': {
                    borderColor: '#ff9800',
                    bgcolor: 'rgba(255, 152, 0, 0.1)',
                  },
                }}
              >
                Call
              </Button>
            </Box>

            {/* Participants */}
            <Typography variant="subtitle2" sx={{ color: '#cccccc', mb: 2 }}>
              Participants ({currentSession.participants.length})
            </Typography>
            <List sx={{ p: 0 }}>
              {currentSession.participants.map((participant) => (
                <ListItem
                  key={participant.id}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: participant.color || '#007acc',
                      }}
                    >
                      {participant.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ color: '#cccccc', fontSize: '14px' }}>
                          {participant.name}
                        </Typography>
                        {participant.id === currentSession.owner.id && (
                          <Chip label="Owner" size="small" sx={{ height: 18, fontSize: '10px' }} />
                        )}
                      </Box>
                    }
                    secondary={getStatusLabel(participant.id)}
                    secondaryTypographyProps={{ sx: { color: '#858585', fontSize: '12px' } }}
                  />
                  <Circle sx={{ fontSize: 12, color: getStatusColor(participant.id) }} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {error && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#f48771' }}>
              Error: {error}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Create Session Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)}>
        <DialogTitle sx={{ bgcolor: '#252526', color: '#cccccc' }}>
          Create Collaboration Session
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1e1e1e', pt: 2 }}>
          <TextField
            fullWidth
            label="Session Name"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="e.g., Feature Development"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#cccccc',
                '& fieldset': { borderColor: '#2d2d30' },
                '&:hover fieldset': { borderColor: '#007acc' },
                '&.Mui-focused fieldset': { borderColor: '#007acc' },
              },
              '& .MuiInputLabel-root': { color: '#858585' },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#252526' }}>
          <Button onClick={() => setShowCreateDialog(false)} sx={{ color: '#858585' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateSession}
            disabled={!sessionName.trim() || loading}
            sx={{ color: '#007acc' }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Join Session Dialog */}
      <Dialog open={showJoinDialog} onClose={() => setShowJoinDialog(false)}>
        <DialogTitle sx={{ bgcolor: '#252526', color: '#cccccc' }}>
          Join Collaboration Session
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1e1e1e', pt: 2 }}>
          <TextField
            fullWidth
            label="Session ID"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Enter session ID"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#cccccc',
                '& fieldset': { borderColor: '#2d2d30' },
                '&:hover fieldset': { borderColor: '#007acc' },
                '&.Mui-focused fieldset': { borderColor: '#007acc' },
              },
              '& .MuiInputLabel-root': { color: '#858585' },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#252526' }}>
          <Button onClick={() => setShowJoinDialog(false)} sx={{ color: '#858585' }}>
            Cancel
          </Button>
          <Button
            onClick={handleJoinSession}
            disabled={!sessionId.trim() || loading}
            sx={{ color: '#007acc' }}
          >
            Join
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onClose={() => setShowInviteDialog(false)}>
        <DialogTitle sx={{ bgcolor: '#252526', color: '#cccccc' }}>Invite User</DialogTitle>
        <DialogContent sx={{ bgcolor: '#1e1e1e', pt: 2 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="user@example.com"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: '#cccccc',
                '& fieldset': { borderColor: '#2d2d30' },
                '&:hover fieldset': { borderColor: '#007acc' },
                '&.Mui-focused fieldset': { borderColor: '#007acc' },
              },
              '& .MuiInputLabel-root': { color: '#858585' },
            }}
          />
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#858585' }}>Role</InputLabel>
            <Select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              sx={{
                color: '#cccccc',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2d2d30' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007acc' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#007acc' },
              }}
            >
              <MenuItem value="viewer">Viewer (Read only)</MenuItem>
              <MenuItem value="editor">Editor (Can edit)</MenuItem>
              <MenuItem value="admin">Admin (Full access)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#252526' }}>
          <Button onClick={() => setShowInviteDialog(false)} sx={{ color: '#858585' }}>
            Cancel
          </Button>
          <Button
            onClick={handleInviteUser}
            disabled={!inviteEmail.trim() || loading}
            sx={{ color: '#007acc' }}
          >
            Invite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollabView;
