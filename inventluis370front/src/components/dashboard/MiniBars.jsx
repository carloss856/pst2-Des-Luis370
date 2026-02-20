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
  const baseY = h - pad;

  const last = series[series.length - 1];
  const points = series.map((p, i) => {
    const x = pad + i * (barW + gap) + barW / 2;
    const ratio = max > 0 ? p.value / max : 0;
    const y = ratio > 0 ? baseY - Math.max(1, ratio * (h - pad * 2)) : baseY;
    return { x, y, ratio };
  });

  const areaPath = points.length
    ? `M ${points[0].x} ${baseY} L ${points.map((pt) => `${pt.x} ${pt.y}`).join(' L ')} L ${
        points[points.length - 1].x
      } ${baseY} Z`
    : '';

  return (
    <Box sx={{ height: h, width: '100%' }} title={last ? `${last.label}: ${last.value}` : undefined}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
        {areaPath && <path d={areaPath} fill="var(--dashboard-bar-fill)" />}
        {points.length > 1 && (
          <polyline
            points={points.map((pt) => `${pt.x},${pt.y}`).join(' ')}
            fill="none"
            stroke="var(--dashboard-bar-stroke)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {points.length === 1 && (
          <line
            x1={points[0].x - 0.2}
            x2={points[0].x + 0.2}
            y1={points[0].y}
            y2={points[0].y}
            stroke="var(--dashboard-bar-stroke)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        )}
        {points.some((pt) => pt.ratio === 0) && (
          <line
            x1={pad}
            x2={w - pad}
            y1={baseY}
            y2={baseY}
            stroke="var(--dashboard-bar-zero)"
            strokeWidth="1"
          />
        )}
        {showCenterLine && centerLineVisible && (
          <line
            x1={w * 0.36}
            x2={w * 0.64}
            y1={baseY}
            y2={baseY}
            stroke="var(--dashboard-center-line)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        )}
      </svg>
    </Box>
  );
}
