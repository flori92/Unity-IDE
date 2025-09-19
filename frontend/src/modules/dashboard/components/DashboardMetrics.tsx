import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const DashboardMetrics = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Conteneurs Docker
            </Typography>
            {/* Ajouter les métriques Docker */}
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Pods Kubernetes
            </Typography>
            {/* Ajouter les métriques Kubernetes */}
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              Playbooks Ansible
            </Typography>
            {/* Ajouter les métriques Ansible */}
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              État du Système
            </Typography>
            {/* Ajouter les métriques système */}
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardMetrics;