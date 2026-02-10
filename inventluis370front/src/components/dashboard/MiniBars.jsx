import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

export default function MiniBars({ buckets = [], height = 44 }) {
  const series = useMemo(() => {
    if (!Array.isArray(buckets)) return [];
    return buckets.map((b) => ({
      label: String(b?.label ?? ''),
      value: Number(b?.count || 0),
    }));
  }, [buckets]);

  const max = useMemo(() => {
    let m = 0;
    for (const p of series) {
      m = Math.max(m, Number.isFinite(p.value) ? p.value : 0);
    }
    return m;
  }, [series]);

  if (!Array.isArray(series) || series.length === 0) {
    return (
      <Typography variant="body2" sx={{ opacity: 0.8 }}>
        Sin datos
      </Typography>
    );
  }

  const w = 120;
  const h = Math.max(24, Number(height) || 44);
  const pad = 3;

  const points = series
    .map((p, i) => {
      const x = series.length === 1 ? w / 2 : (i * (w - pad * 2)) / (series.length - 1) + pad;
      const yVal = max > 0 ? p.value / max : 0;
      const y = (h - pad) - yVal * (h - pad * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const last = series[series.length - 1];

  return (
    <Box sx={{ height: h, width: '100%' }} title={last ? `${last.label}: ${last.value}` : undefined}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
      </svg>
    </Box>
  );
}
