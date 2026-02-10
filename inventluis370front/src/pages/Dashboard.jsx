import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { getDashboard } from '../services/dashboard';
import StatsSection from '../components/dashboard/StatsSection';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    getDashboard()
      .then((d) => {
        if (mounted) setData(d);
      })
      .catch((e) => {
        if (mounted) setError(e);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const cards = useMemo(() => data?.cards || [], [data]);
  const lists = useMemo(() => data?.lists || {}, [data]);

  const role = data?.role || localStorage.getItem('rol_usuario') || '—';

  return (
    <Box
      sx={{
        color: '#fff',
        width: '100%',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {error && (
        <Typography variant="body2" sx={{ color: '#ffd1d1', mb: 2 }}>
          No se pudo cargar el dashboard.
        </Typography>
      )}

      {!data && !error ? (
        <Typography variant="body2" sx={{ mt: 2, opacity: 0.85 }}>
          Cargando…
        </Typography>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', width: '100%' }}>
          <StatsSection cards={cards} lists={lists} role={role} />
        </Box>
      )}
    </Box>
  );
}
