import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { Terminal } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledTerminal = styled(Paper)(({ theme }) => ({
  backgroundColor: '#1E1E1E',
  color: '#FFFFFF',
  padding: theme.spacing(2),
  fontFamily: 'monospace',
  height: '300px',
  overflowY: 'auto',
}));

const TerminalHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  gap: theme.spacing(1),
}));

const IntegratedTerminal = () => {
  return (
    <Box sx={{ p: 2 }}>
      <TerminalHeader>
        <Terminal />
        <Typography variant="h6">Terminal Intégré</Typography>
      </TerminalHeader>
      <StyledTerminal elevation={3}>
        {/* Ici sera intégré le terminal Tauri */}
      </StyledTerminal>
    </Box>
  );
};

export default IntegratedTerminal;