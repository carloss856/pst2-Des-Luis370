import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, ToggleButton, ToggleButtonGroup } from '@mui/material';
import MiniBars from './MiniBars';
import { getModuleStatsCached } from '../../services/stats';

const PERIOD_LABELS = {
  day: 'Dia',
  week: 'Semana',
  month: 'Mes',
  year: 'Ano',
};

export default function ModuleStatsCard({ title, moduleKey }) {
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!moduleKey) return;
    setLoading(true);
    setError(false);

    getModuleStatsCached(moduleKey, { period })
      .then((res) => {
        if (!mounted) return;
        setStats(res);
      })
      .catch(() => {
        if (!mounted) return;
        setError(true);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [moduleKey, period]);

  const total = stats?.total ?? 0;
  const buckets = Array.isArray(stats?.buckets) ? stats.buckets.slice(-12) : [];
  const apiPeriod = stats?.period;
  const apiPeriodLabel = apiPeriod ? PERIOD_LABELS[apiPeriod] || apiPeriod : null;
  const totalNumber = Number(total) || 0;

  return (
    <Card
      sx={{
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        flex: 1,
        minWidth: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'var(--dashboard-card-bg)',
        color: '#fff',
        border: '1px solid var(--dashboard-card-border)',
      }}
    >
      <CardContent sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
            {title}
          </Typography>
          {apiPeriodLabel && <Chip size="small" label={apiPeriodLabel} sx={{ bgcolor: 'var(--dashboard-chip-bg)', color: '#fff' }} />}
        </Box>

        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(_, v) => v && setPeriod(v)}
            size="small"
            sx={{
              bgcolor: 'var(--dashboard-control-bg)',
              border: '1px solid var(--dashboard-card-border)',
              '& .MuiToggleButton-root': {
                color: '#fff',
                borderColor: 'var(--dashboard-card-border)',
                textTransform: 'none',
                fontWeight: 600,
              },
              '& .MuiToggleButton-root.Mui-selected': {
                color: '#fff',
                bgcolor: 'var(--app-nav-active-bg)',
              },
              '& .MuiToggleButton-root.Mui-selected:hover': {
                bgcolor: 'var(--app-nav-active-hover-bg)',
              },
            }}
          >
            <ToggleButton value="day">Dia</ToggleButton>
            <ToggleButton value="week">Semana</ToggleButton>
            <ToggleButton value="month">Mes</ToggleButton>
            <ToggleButton value="year">Ano</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Typography variant="h5" sx={{ mt: 1, fontWeight: 900 }}>
          {total}
        </Typography>

        <Box sx={{ mt: 1.25, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Cargando...
            </Typography>
          ) : error ? (
            <Typography variant="body2" sx={{ color: '#ffd1d1' }}>
              No se pudo cargar.
            </Typography>
          ) : buckets.length === 0 ? (
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Sin datos
            </Typography>
          ) : (
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <MiniBars buckets={buckets} showCenterLine={true} centerLineVisible={totalNumber > 0} />
            </Box>
          )}
        </Box>

        {buckets.length > 0 && (
          <Typography variant="caption" sx={{ opacity: 0.75, flexShrink: 0 }}>
            Ultimos {buckets.length} puntos
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
