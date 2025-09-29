import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

const AnimatedLoader: React.FC<{ text?: string }> = ({ text }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
    <CircularProgress size={60} thickness={5} color="primary" />
    {text && <Typography sx={{ mt: 2 }} color="text.secondary">{text}</Typography>}
  </Box>
);

export default AnimatedLoader;
