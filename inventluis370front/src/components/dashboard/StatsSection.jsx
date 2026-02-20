import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import { Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ModuleStatsCard from './ModuleStatsCard';
import { canModule, getRbacCache } from '../../utils/rbac';

const MODULES = [
  { key: 'empresas', title: 'Empresas' },
  { key: 'usuarios', title: 'Usuarios' },
  { key: 'equipos', title: 'Equipos' },
  { key: 'propiedad-equipos', title: 'Asignaciones' },
  { key: 'servicios', title: 'Servicios' },
  { key: 'garantias', title: 'Garantías' },
  { key: 'repuestos', title: 'Repuestos' },
  { key: 'inventario', title: 'Inventario (entradas)' },
  { key: 'solicitud-repuestos', title: 'Solicitudes de repuestos' },
  { key: 'notificaciones', title: 'Notificaciones' },
  { key: 'reportes', title: 'Reportes' },
  { key: 'rma', title: 'RMA' },
  { key: 'tarifas-servicio', title: 'Tarifas' },
  { key: 'tarifas-servicio-historial', title: 'Historial de tarifas' },
];

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS_BY_BREAKPOINT = { lg: 24, md: 24, sm: 24, xs: 12, xxs: 12 };
const ROW_HEIGHT = 24;

const KPI_W = { lg: 6, md: 8, sm: 12, xs: 12, xxs: 12 };
const LIST_W = { lg: 12, md: 12, sm: 24, xs: 12, xxs: 12 };
const MODULE_W = { lg: 6, md: 8, sm: 12, xs: 12, xxs: 12 };

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

function wForKind(kind, bp) {
  if (kind === 'kpi') return KPI_W[bp] ?? 12;
  if (kind === 'list') return LIST_W[bp] ?? 12;
  return MODULE_W[bp] ?? 12;
}

function hForKind(kind) {
  if (kind === 'kpi') return 4;
  if (kind === 'list') return 6;
  return 8;
}

function minWForKind(kind) {
  if (kind === 'kpi') return 3;
  if (kind === 'list') return 6;
  return 3;
}

function minHForKind(kind) {
  if (kind === 'kpi') return 3;
  if (kind === 'list') return 4;
  return 5;
}

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function clampItem(item, cols) {
  const w = Math.max(1, Math.min(cols, Number(item?.w) || 1));
  const h = Math.max(1, Number(item?.h) || 1);
  const minW = Math.max(1, Math.min(cols, Number(item?.minW) || 1));
  const minH = Math.max(1, Number(item?.minH) || 1);
  const safeW = Math.max(minW, w);
  const safeH = Math.max(minH, h);
  const x = Math.max(0, Math.min(cols - safeW, Number(item?.x) || 0));
  const y = Math.max(0, Number(item?.y) || 0);
  return { i: String(item?.i ?? ''), x, y, w: safeW, h: safeH, minW, minH };
}

function buildPackedLayout(items, bp) {
  const cols = COLS_BY_BREAKPOINT[bp];
  let cursorX = 0;
  let cursorY = 0;
  let rowMaxH = 0;

  return items.map((it) => {
    const w = Math.max(1, Math.min(cols, wForKind(it.kind, bp)));
    const h = hForKind(it.kind);
    const minW = minWForKind(it.kind);
    const minH = minHForKind(it.kind);

    if (cursorX + w > cols) {
      cursorX = 0;
      cursorY += rowMaxH;
      rowMaxH = 0;
    }

    const placed = { i: String(it.i), x: cursorX, y: cursorY, w, h, minW, minH };
    cursorX += w;
    rowMaxH = Math.max(rowMaxH, h);
    return placed;
  });
}

function generateLayouts(items) {
  return Object.keys(COLS_BY_BREAKPOINT).reduce((memo, bp) => {
    memo[bp] = buildPackedLayout(items, bp);
    return memo;
  }, {});
}

function normalizeLayouts(nextLayouts, items, defaults, previousLayouts) {
  const ids = new Set(items.map((it) => String(it.i)));
  const out = {};

  for (const bp of Object.keys(COLS_BY_BREAKPOINT)) {
    const cols = COLS_BY_BREAKPOINT[bp];

    const candidate = Array.isArray(nextLayouts?.[bp])
      ? nextLayouts[bp]
      : Array.isArray(previousLayouts?.[bp])
        ? previousLayouts[bp]
        : [];

    const filtered = candidate.filter((it) => ids.has(String(it?.i))).map((it) => clampItem(it, cols));
    const existing = new Set(filtered.map((it) => it.i));
    const missing = (defaults?.[bp] || []).filter((it) => !existing.has(String(it.i)));
    out[bp] = [...filtered, ...missing];
  }

  return out;
}

function useElementRect({ initialWidth = 1200, initialHeight = 720 } = {}) {
  const [node, setNode] = useState(null);
  const ref = React.useCallback((el) => {
    setNode(el || null);
  }, []);
  const [rect, setRect] = useState({ width: initialWidth, height: initialHeight });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const el = node;
    if (!el) return;

    const update = () => {
      // clientWidth/clientHeight reflejan el área útil (sin scrollbars),
      // y suelen ser más estables para calcular el width real del grid.
      const nextWidth = Math.max(0, Math.round(el.clientWidth || 0));
      const nextHeight = Math.max(0, Math.round(el.clientHeight || 0));
      setRect({
        width: nextWidth || initialWidth,
        height: nextHeight || initialHeight,
      });
    };

    update();

    // Re-mediciones para casos donde el layout cambia después del primer paint
    // (navegación, scrollbars, fuentes, etc.) y el width inicial queda chico.
    let rafId = 0;
    let t1 = 0;
    let t2 = 0;
    rafId = requestAnimationFrame(() => update());
    t1 = window.setTimeout(() => update(), 50);
    t2 = window.setTimeout(() => update(), 250);

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => {
        cancelAnimationFrame(rafId);
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        window.removeEventListener('resize', update);
      };
    }

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ro.disconnect();
    };
  }, [node, initialWidth, initialHeight]);

  return { ref, width: rect.width, height: rect.height, mounted };
}

function RecentNotifications({ notifications }) {
  const containerRef = React.useRef(null);
  const [isNarrow, setIsNarrow] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.getBoundingClientRect().width;
      setIsNarrow(w < 520);
    };

    update();

    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Box ref={containerRef} sx={{ width: '100%' }}>
      {isNarrow ? (
        <List dense>
          {notifications.map((n) => (
            <ListItem key={n.id_notificacion} disableGutters>
              <ListItemText
                primary={n.asunto || n.id_notificacion}
                secondary={`${n.estado_envio || '—'}${n.fecha_envio ? ` | ${new Date(n.fecha_envio).toLocaleString()}` : ''}`}
                primaryTypographyProps={{ sx: { color: '#fff' } }}
                secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.75)' } }}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 1,
          }}
        >
          {notifications.map((n) => (
            <Box
              key={n.id_notificacion}
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 1,
                minWidth: 0,
                py: 0.25,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#fff',
                  flex: 1,
                  minWidth: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={n.asunto || n.id_notificacion}
              >
                {n.asunto || n.id_notificacion}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.75)',
                  flexShrink: 0,
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                }}
              >
                {`${n.estado_envio || '—'}${n.fecha_envio ? ` | ${new Date(n.fecha_envio).toLocaleString()}` : ''}`}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default function StatsSection({ cards = [], lists = {}, role }) {
  const [rbac, setRbac] = useState(() => getRbacCache());
  const [layouts, setLayouts] = useState(null);
  const [breakpoint, setBreakpoint] = useState('lg');

  const { ref: containerRef, width, height: availableHeight, mounted } = useElementRect({ initialWidth: 1200, initialHeight: 720 });

  useEffect(() => {
    const refresh = () => setRbac(getRbacCache());
    const onStorage = (e) => {
      if (!e || (typeof e.key === 'string' && (e.key.startsWith('rbac_cache_v') || e.key === 'rbac_cache_version'))) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    refresh();
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const visibleModules = useMemo(() => {
    // Si no hay RBAC cargado aún, no filtramos para evitar un tablero vacío.
    if (!rbac) return MODULES;
    return MODULES.filter((m) => canModule(rbac, m.key, 'index'));
  }, [rbac]);

  const effectiveRole = role || localStorage.getItem('rol_usuario') || '—';
  const userId = localStorage.getItem('id_usuario') || 'me';
  const layoutKey = useMemo(() => `stats_rgl_unified_v2:${userId}:${effectiveRole}`, [userId, effectiveRole]);

  const items = useMemo(() => {
    const out = [];

    for (const c of cards) {
      out.push({ i: `kpi:${c.key}`, kind: 'kpi', data: c });
    }

    if (Array.isArray(lists?.repuestos_criticos) && lists.repuestos_criticos.length > 0) {
      out.push({ i: 'list:repuestos_criticos', kind: 'list' });
    }

    if (Array.isArray(lists?.notificaciones_recientes) && lists.notificaciones_recientes.length > 0) {
      out.push({ i: 'list:notificaciones_recientes', kind: 'list' });
    }

    for (const m of visibleModules) {
      out.push({ i: `module:${m.key}`, kind: 'module', data: m });
    }

    return out;
  }, [cards, lists, visibleModules]);

  const defaultLayouts = useMemo(() => generateLayouts(items), [items]);

  const desiredGridHeight = useMemo(() => {
    const current = layouts?.[breakpoint];
    const base = Array.isArray(current) ? current : [];
    const bottomRows = base.reduce((max, it) => Math.max(max, (Number(it?.y) || 0) + (Number(it?.h) || 0)), 0);
    const contentHeight = bottomRows * ROW_HEIGHT;
    return Math.max(availableHeight || 0, contentHeight || 0, 1);
  }, [layouts, breakpoint, availableHeight]);

  useEffect(() => {
    const saved = safeJsonParse(localStorage.getItem(layoutKey) || '');
    setLayouts(normalizeLayouts(saved?.layouts, items, defaultLayouts, null));
  }, [layoutKey, items, defaultLayouts]);

  const onLayoutsChange = (_current, all) => {
    setLayouts((prev) => {
      const normalized = normalizeLayouts(all, items, defaultLayouts, prev);
      localStorage.setItem(layoutKey, JSON.stringify({ v: 1, layouts: normalized, updatedAt: Date.now() }));
      return normalized;
    });
  };

  const renderItem = (it) => {
    if (it.kind === 'kpi') {
      const c = it.data;
      return (
        <Card sx={{ bgcolor: 'var(--dashboard-card-bg)', color: '#fff', border: '1px solid var(--dashboard-card-border)', height: '100%', width: '100%' }}>
          <CardContent sx={{ height: '100%', overflow: 'auto' }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
              {c.title}
            </Typography>
            {isObject(c.value) ? (
              <Box sx={{ mt: 1 }}>
                {Object.entries(c.value).map(([k, v]) => (
                  <Typography key={k} variant="body2">
                    {k}: <b>{v}</b>
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 800 }}>
                {c.value}
              </Typography>
            )}
          </CardContent>
        </Card>
      );
    }

    if (it.kind === 'list' && it.i === 'list:repuestos_criticos') {
      return (
        <Card sx={{ bgcolor: 'var(--dashboard-card-bg)', color: '#fff', border: '1px solid var(--dashboard-card-border)', height: '100%', width: '100%' }}>
          <CardContent sx={{ height: '100%', overflow: 'auto' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.9 }}>
              Repuestos críticos (top 10)
            </Typography>
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 1 }} />
            <List dense>
              {lists.repuestos_criticos.map((r) => (
                <ListItem key={r.id_repuesto} disableGutters>
                  <ListItemText
                    primary={`${r.nombre_repuesto || r.id_repuesto}`}
                    secondary={`Stock: ${r.cantidad_disponible ?? '—'} | Crítico: ${r.nivel_critico ?? '—'}`}
                    primaryTypographyProps={{ sx: { color: '#fff' } }}
                    secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.75)' } }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      );
    }

    if (it.kind === 'list' && it.i === 'list:notificaciones_recientes') {
      return (
        <Card sx={{ bgcolor: 'var(--dashboard-card-bg)', color: '#fff', border: '1px solid var(--dashboard-card-border)', height: '100%', width: '100%' }}>
          <CardContent sx={{ height: '100%', overflow: 'auto' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.9 }}>
              Notificaciones recientes
            </Typography>
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 1 }} />
            <RecentNotifications notifications={lists.notificaciones_recientes} />
          </CardContent>
        </Card>
      );
    }

    if (it.kind === 'module') {
      const m = it.data;
      return <ModuleStatsCard title={m.title} moduleKey={m.key} />;
    }

    return null;
  };

  return (
    <Card
      sx={{
        bgcolor: 'var(--dashboard-panel-bg)',
        color: '#fff',
        border: '1px solid var(--dashboard-card-border)',
        width: '100%',
        maxWidth: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          Estadísticas
        </Typography>

        {items.length === 0 ? (
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            No hay datos para mostrar.
          </Typography>
        ) : !layouts ? (
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            Cargando…
          </Typography>
        ) : (
          <Box
            ref={containerRef}
            sx={{
              width: '100%',
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {mounted && (
              <Responsive
                className="layout"
                breakpoints={BREAKPOINTS}
                cols={COLS_BY_BREAKPOINT}
                rowHeight={ROW_HEIGHT}
                width={width}
                layouts={layouts}
                onLayoutChange={onLayoutsChange}
                onBreakpointChange={(bp) => setBreakpoint(bp)}
                autoSize={false}
                style={{ height: desiredGridHeight }}
                compactType={null}
                preventCollision={true}
                isDraggable={true}
                isResizable={true}
                resizeHandles={['se', 'e', 's']}
                draggableCancel=".MuiButtonBase-root,input,textarea,select,option,a"
                onDrag={(_layout, oldItem, newItem, placeholder) => {
                  // Movimiento solo horizontal: fijar Y.
                  if (oldItem?.y != null) {
                    newItem.y = oldItem.y;
                    placeholder.y = oldItem.y;
                  }
                }}
              >
                {items.map((it) => (
                  <div key={it.i} style={{ width: '100%', height: '100%' }}>
                    {renderItem(it)}
                  </div>
                ))}
              </Responsive>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
