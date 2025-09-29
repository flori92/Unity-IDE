import React from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { Snackbar, Alert, IconButton, Badge, Drawer, List, ListItem, ListItemText, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NotificationCenter: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const { notifications, unreadCount, removeNotification, markAllAsRead } = useNotificationStore();
  const [snack, setSnack] = React.useState<{ id: string, message: string, severity: any } | null>(null);

  React.useEffect(() => {
    if (notifications.length > 0 && !snack) {
      const latest = notifications.find(n => !n.read);
      if (latest) {
        setSnack({ id: latest.id, message: latest.message, severity: latest.severity });
      }
    }
  }, [notifications, snack]);

  const handleCloseSnack = () => {
    if (snack) {
      removeNotification(snack.id);
    }
    setSnack(null);
  };

  return (
    <>
      <IconButton color={unreadCount > 0 ? 'primary' : 'default'} onClick={() => setOpen(true)}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <div style={{ width: 350, padding: 16 }}>
          <Typography variant="h6">Notifications</Typography>
          <List>
            {notifications.length === 0 && <ListItem><ListItemText primary="Aucune notification" /></ListItem>}
            {notifications.map(n => (
              <ListItem key={n.id} selected={!n.read}>
                <ListItemText
                  primary={n.message}
                  secondary={n.timestamp.toLocaleString('fr-FR')}
                />
                <IconButton size="small" onClick={() => removeNotification(n.id)}>✕</IconButton>
              </ListItem>
            ))}
          </List>
          {notifications.length > 0 && (
            <button onClick={markAllAsRead} style={{ marginTop: 8 }}>Tout marquer comme lu</button>
          )}
        </div>
      </Drawer>
      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        message={snack ? snack.message : ''}
        action={snack ? (
          <Alert onClose={handleCloseSnack} severity={snack.severity} sx={{ width: '100%' }}>
            {snack.message}
          </Alert>
        ) : undefined}
      />
    </>
  );
};

export default NotificationCenter;
