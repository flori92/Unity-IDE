/**
 * Source Control View - Vue Git style VS Code
 * Gestion Git complète : status, commit, push, pull, branches
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  Add,
  Remove,
  Refresh,
  CloudUpload,
  CloudDownload,
  Commit,
  BranchIcon,
  Close,
} from '@mui/icons-material';
import { useGit } from '../../../hooks/useGit';
import { useSnackbar } from 'notistack';

interface SectionProps {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, count, children, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Box sx={{ mb: 1 }}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 22,
          px: 1,
          cursor: 'pointer',
          color: '#cccccc',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        {expanded ? (
          <ExpandMore sx={{ fontSize: 16, mr: 0.5 }} />
        ) : (
          <ChevronRight sx={{ fontSize: 16, mr: 0.5 }} />
        )}
        <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
          {title} {count !== undefined && `(${count})`}
        </Typography>
      </Box>
      <Collapse in={expanded}>{children}</Collapse>
    </Box>
  );
};

interface FileItemProps {
  file: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked';
  staged: boolean;
  onStage: () => void;
  onUnstage: () => void;
  onDiscard: () => void;
}

const FileItem: React.FC<FileItemProps> = ({ file, status, staged, onStage, onUnstage, onDiscard }) => {
  const [hovered, setHovered] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case 'modified':
        return '#ce9178';
      case 'added':
        return '#4ec9b0';
      case 'deleted':
        return '#f48771';
      case 'untracked':
        return '#608b4e';
      default:
        return '#cccccc';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'modified':
        return 'M';
      case 'added':
        return 'A';
      case 'deleted':
        return 'D';
      case 'untracked':
        return 'U';
      default:
        return '?';
    }
  };

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 22,
        pl: 3,
        pr: 1,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, overflow: 'hidden' }}>
        <Typography
          variant="caption"
          sx={{
            fontSize: '11px',
            fontWeight: 600,
            color: getStatusColor(),
            width: 16,
            flexShrink: 0,
          }}
        >
          {getStatusLabel()}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: '13px',
            color: '#cccccc',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {file}
        </Typography>
      </Box>

      {hovered && (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {staged ? (
            <IconButton size="small" sx={{ color: '#858585', padding: 0 }} onClick={onUnstage}>
              <Remove sx={{ fontSize: 14 }} />
            </IconButton>
          ) : (
            <IconButton size="small" sx={{ color: '#858585', padding: 0 }} onClick={onStage}>
              <Add sx={{ fontSize: 14 }} />
            </IconButton>
          )}
          {!staged && (
            <IconButton size="small" sx={{ color: '#858585', padding: 0 }} onClick={onDiscard}>
              <Close sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
};

export const SourceControlView: React.FC = () => {
  const {
    status,
    branches,
    history,
    loading,
    error,
    loadStatus,
    stageFiles,
    unstageFiles,
    commit,
    push,
    pull,
    discardChanges,
    checkoutBranch,
  } = useGit();

  const { enqueueSnackbar } = useSnackbar();
  const [commitMessage, setCommitMessage] = useState('');
  const [showBranchDialog, setShowBranchDialog] = useState(false);

  const handleStage = async (file: string) => {
    const success = await stageFiles([file]);
    if (success) {
      enqueueSnackbar('File staged', { variant: 'success' });
    }
  };

  const handleUnstage = async (file: string) => {
    const success = await unstageFiles([file]);
    if (success) {
      enqueueSnackbar('File unstaged', { variant: 'success' });
    }
  };

  const handleDiscard = async (file: string) => {
    if (confirm(`Discard changes in ${file}?`)) {
      const success = await discardChanges(file);
      if (success) {
        enqueueSnackbar('Changes discarded', { variant: 'success' });
      }
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      enqueueSnackbar('Commit message is required', { variant: 'warning' });
      return;
    }

    const success = await commit(commitMessage);
    if (success) {
      enqueueSnackbar('Changes committed', { variant: 'success' });
      setCommitMessage('');
    } else {
      enqueueSnackbar('Failed to commit', { variant: 'error' });
    }
  };

  const handlePush = async () => {
    const success = await push();
    if (success) {
      enqueueSnackbar('Changes pushed', { variant: 'success' });
    } else {
      enqueueSnackbar('Failed to push', { variant: 'error' });
    }
  };

  const handlePull = async () => {
    const success = await pull();
    if (success) {
      enqueueSnackbar('Changes pulled', { variant: 'success' });
    } else {
      enqueueSnackbar('Failed to pull', { variant: 'error' });
    }
  };

  const handleCheckoutBranch = async (branchName: string) => {
    const success = await checkoutBranch(branchName);
    if (success) {
      enqueueSnackbar(`Switched to ${branchName}`, { variant: 'success' });
      setShowBranchDialog(false);
    } else {
      enqueueSnackbar('Failed to switch branch', { variant: 'error' });
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 2, color: '#f48771' }}>
        <Typography variant="body2">Error: {error}</Typography>
      </Box>
    );
  }

  const currentBranch = branches.find((b) => b.current);
  const totalChanges = (status?.modified.length || 0) + (status?.added.length || 0) + (status?.deleted.length || 0) + (status?.untracked.length || 0);

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #2d2d30',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: '#858585', fontSize: '11px' }}>
            {loading ? 'Loading...' : `${totalChanges} changes`}
          </Typography>
          {currentBranch && (
            <Chip
              label={currentBranch.name}
              size="small"
              onClick={() => setShowBranchDialog(true)}
              sx={{
                height: '18px',
                fontSize: '10px',
                bgcolor: '#007acc',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" sx={{ color: '#858585' }} onClick={loadStatus} disabled={loading}>
            <Refresh sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" sx={{ color: '#858585' }} onClick={handlePull} disabled={loading}>
            <CloudDownload sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" sx={{ color: '#858585' }} onClick={handlePush} disabled={loading}>
            <CloudUpload sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Commit Message */}
      <Box sx={{ p: 2, borderBottom: '1px solid #2d2d30' }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Message (Ctrl+Enter to commit)"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === 'Enter') {
              handleCommit();
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#cccccc',
              fontSize: '13px',
              bgcolor: '#1e1e1e',
              '& fieldset': {
                borderColor: '#2d2d30',
              },
              '&:hover fieldset': {
                borderColor: '#007acc',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#007acc',
              },
            },
          }}
        />
        <Button
          fullWidth
          variant="contained"
          startIcon={<Commit />}
          onClick={handleCommit}
          disabled={!commitMessage.trim() || (status?.staged.length || 0) === 0}
          sx={{
            mt: 1,
            bgcolor: '#007acc',
            '&:hover': { bgcolor: '#005a9e' },
            textTransform: 'none',
          }}
        >
          Commit
        </Button>
      </Box>

      {/* Staged Changes */}
      {status && status.staged.length > 0 && (
        <Section title="Staged Changes" count={status.staged.length}>
          {status.staged.map((file) => (
            <FileItem
              key={file}
              file={file}
              status="modified"
              staged={true}
              onStage={() => {}}
              onUnstage={() => handleUnstage(file)}
              onDiscard={() => {}}
            />
          ))}
        </Section>
      )}

      {/* Changes */}
      {status && totalChanges > 0 && (
        <Section title="Changes" count={totalChanges}>
          {status.modified.map((file) => (
            <FileItem
              key={file}
              file={file}
              status="modified"
              staged={false}
              onStage={() => handleStage(file)}
              onUnstage={() => {}}
              onDiscard={() => handleDiscard(file)}
            />
          ))}
          {status.added.map((file) => (
            <FileItem
              key={file}
              file={file}
              status="added"
              staged={false}
              onStage={() => handleStage(file)}
              onUnstage={() => {}}
              onDiscard={() => handleDiscard(file)}
            />
          ))}
          {status.deleted.map((file) => (
            <FileItem
              key={file}
              file={file}
              status="deleted"
              staged={false}
              onStage={() => handleStage(file)}
              onUnstage={() => {}}
              onDiscard={() => handleDiscard(file)}
            />
          ))}
          {status.untracked.map((file) => (
            <FileItem
              key={file}
              file={file}
              status="untracked"
              staged={false}
              onStage={() => handleStage(file)}
              onUnstage={() => {}}
              onDiscard={() => handleDiscard(file)}
            />
          ))}
        </Section>
      )}

      {/* History */}
      <Section title="Commits" count={history.length} defaultExpanded={false}>
        <List sx={{ p: 0 }}>
          {history.slice(0, 10).map((commit) => (
            <ListItem key={commit.hash} sx={{ py: 0.5, px: 3 }}>
              <ListItemText
                primary={
                  <Typography variant="caption" sx={{ fontSize: '12px', color: '#cccccc' }}>
                    {commit.message}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" sx={{ fontSize: '10px', color: '#858585' }}>
                    {commit.author} • {commit.hash.substring(0, 7)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Section>

      {/* Branch Dialog */}
      <Dialog open={showBranchDialog} onClose={() => setShowBranchDialog(false)}>
        <DialogTitle sx={{ bgcolor: '#252526', color: '#cccccc' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BranchIcon />
            Select Branch
          </Box>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1e1e1e', color: '#cccccc', minWidth: 300 }}>
          <List sx={{ p: 0 }}>
            {branches.map((branch) => (
              <ListItem
                key={branch.name}
                button
                onClick={() => handleCheckoutBranch(branch.name)}
                sx={{
                  bgcolor: branch.current ? 'rgba(0, 122, 204, 0.2)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ color: branch.current ? '#4ec9b0' : '#cccccc' }}>
                      {branch.current && '● '}{branch.name}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#252526' }}>
          <Button onClick={() => setShowBranchDialog(false)} sx={{ color: '#858585' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SourceControlView;
