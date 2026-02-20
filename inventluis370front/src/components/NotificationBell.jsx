import React from 'react';
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNavigate } from 'react-router-dom';
import { getNotificaciones, marcarTodasLeidas, setNotificacionLeida } from '../services/notificaciones';

export default function NotificationBell() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [markingAll, setMarkingAll] = React.useState(false);
  const [busyId, setBusyId] = React.useState(null);

  const unreadCount = React.useMemo(
    () => items.reduce((acc, n) => acc + (n?.leida ? 0 : 1), 0),
    [items]
  );

  const open = Boolean(anchorEl);

  const loadNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotificaciones();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(timer);
  }, [loadNotifications]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    loadNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAll = async () => {
    try {
      setMarkingAll(true);
      await marcarTodasLeidas();
      setItems((prev) =>
        prev.map((n) => ({ ...n, leida: true, leida_en: n.leida_en || new Date().toISOString() }))
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkOne = async (notif) => {
    if (!notif?.id_notificacion || notif?.leida) return;
    try {
      setBusyId(notif.id_notificacion);
      const updated = await setNotificacionLeida(notif.id_notificacion, true);
      setItems((prev) =>
        prev.map((n) => (n.id_notificacion === notif.id_notificacion ? { ...n, ...updated } : n))
      );
    } finally {
      setBusyId(null);
    }
  };

  const goToAll = () => {
    handleClose();
    navigate('/notificaciones');
  };

  const preview = items.slice(0, 8);

  return (
    <>
      <IconButton
        aria-label="notificaciones"
        onClick={handleOpen}
        className="notification-bell-btn"
        size="large"
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 380,
            maxWidth: '92vw',
            bgcolor: 'var(--app-surface)',
            color: 'var(--app-fg)',
            border: '1px solid var(--bs-border-color)',
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Notificaciones
          </Typography>
          <Button
            size="small"
            startIcon={<DoneAllIcon fontSize="small" />}
            onClick={handleMarkAll}
            disabled={markingAll || unreadCount === 0}
          >
            Leer todas
          </Button>
        </Box>
        <Divider />
        <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress size={22} />
            </Box>
          ) : preview.length === 0 ? (
            <Typography variant="body2" sx={{ p: 2, opacity: 0.85 }}>
              No hay notificaciones.
            </Typography>
          ) : (
            <List dense disablePadding>
              {preview.map((n) => (
                <ListItem
                  key={n.id_notificacion}
                  divider
                  secondaryAction={
                    <Button
                      size="small"
                      variant={n.leida ? 'outlined' : 'contained'}
                      onClick={() => handleMarkOne(n)}
                      disabled={n.leida || busyId === n.id_notificacion}
                    >
                      {n.leida ? 'Visto' : 'Visto'}
                    </Button>
                  }
                >
                  <ListItemText
                    primary={n.asunto || 'Sin asunto'}
                    secondary={
                      <>
                        <Typography component="span" variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                          {n.mensaje || ''}
                        </Typography>
                        <Typography component="span" variant="caption" sx={{ opacity: 0.7 }}>
                          {n.fecha_envio || ''}
                        </Typography>
                      </>
                    }
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: n.leida ? 500 : 800,
                        pr: 7,
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
        <Divider />
        <Box sx={{ p: 1 }}>
          <Button fullWidth variant="outlined" onClick={goToAll}>
            Ver todas
          </Button>
        </Box>
      </Popover>
    </>
  );
}
