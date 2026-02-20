import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

export default function MiniBars({ buckets = [], height = 44, showCenterLine = true, centerLineVisible = true }) {
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

  const gap = 1.4;
  const count = series.length;
  const innerW = w - pad * 2;
  const barW = count > 0 ? Math.max(1, (innerW - gap * (count - 1)) / count) : innerW;

  const last = series[series.length - 1];

  return (
    <Box sx={{ height: h, width: '100%' }} title={last ? `${last.label}: ${last.value}` : undefined}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
        {series.map((p, i) => {
          const x = pad + i * (barW + gap);
          const ratio = max > 0 ? p.value / max : 0;
          const barH = ratio > 0 ? Math.max(1, ratio * (h - pad * 2)) : 0;
          const y = h - pad - barH;
          return (
            <rect
              key={`${p.label}:${i}`}
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx="1.2"
              fill={ratio > 0 ? 'var(--dashboard-bar-fill)' : 'var(--dashboard-bar-zero)'}
            />
          );
        })}
        {showCenterLine && centerLineVisible && (
          <line
            x1={w * 0.36}
            x2={w * 0.64}
            y1={h - pad}
            y2={h - pad}
            stroke="var(--dashboard-center-line)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        )}
      </svg>
    </Box>
  );
}
