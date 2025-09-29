import React from 'react';
import { useThemeStore } from '../../store/themeStore';
import { Box, Typography, Switch, FormControlLabel, Button, TextField } from '@mui/material';

const ThemeSettings: React.FC = () => {
  const {
    isDarkMode,
    primaryColor,
    accentColor,
    toggleTheme,
    setPrimaryColor,
    setAccentColor,
  } = useThemeStore();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Apparence & Thème</Typography>
      <FormControlLabel
        control={<Switch checked={isDarkMode} onChange={toggleTheme} />}
        label={isDarkMode ? 'Mode sombre' : 'Mode clair'}
      />
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="Couleur principale"
          type="color"
          value={primaryColor}
          onChange={e => setPrimaryColor(e.target.value)}
          sx={{ width: 120 }}
        />
        <TextField
          label="Couleur accent"
          type="color"
          value={accentColor}
          onChange={e => setAccentColor(e.target.value)}
          sx={{ width: 120 }}
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={() => {
          setPrimaryColor('#2196f3');
          setAccentColor('#f50057');
        }}>
          Réinitialiser les couleurs
        </Button>
      </Box>
    </Box>
  );
};

export default ThemeSettings;
