import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Button,
  TextField,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PersonIcon from '@mui/icons-material/Person';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LoadingView from '../components/LoadingView';
import {
  getPermissions,
  resetPermissions,
  updatePermissions,
  getUserPermissions,
  updateUserPermissions,
  resetUserPermissions,
} from '../services/permissions';
import { getUsuarios } from '../services/usuarios';

const ROLES = ['Administrador', 'Gerente', 'Técnico', 'Cliente', 'Empresa'];

const MENU_MODULES_ORDER = [
  'empresas',
  'usuarios',
  'equipos',
  'repuestos',
  'inventario',
  'servicios',
  'solicitud-repuestos',
  'garantias',
  'reportes',
  'notificaciones',
  'tarifas-servicio',
];

const ACTIONS = [
  { key: 'index', label: 'Menú', icon: <VisibilityIcon fontSize="small" /> },
  { key: 'store', label: 'Crear', icon: <AddCircleOutlineIcon fontSize="small" /> },
  { key: 'update', label: 'Editar', icon: <EditOutlinedIcon fontSize="small" /> },
  { key: 'destroy', label: 'Eliminar', icon: <DeleteOutlineIcon fontSize="small" /> },
];

const prettyModuleTitle = (key) => {
  const map = {
    'autenticacion-usuarios': 'Autenticación Usuarios',
    'propiedad-equipos': 'Propiedad Equipos',
    'solicitud-repuestos': 'Solicitud Repuestos',
    'tarifas-servicio': 'Tarifas Servicio',
  };
  return map[key] || key;
};

const cloneDeep = (value) => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export default function Permissions() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('global'); // global | user
  const [role, setRole] = useState('Administrador');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [effective, setEffective] = useState(null);
  const [draft, setDraft] = useState({ modules: {}, routes: {} });
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const [autosaveHint, setAutosaveHint] = useState({ text: '', tone: 'info' });

  const initializedRef = useRef(false);
  const lastSavedJsonRef = useRef('');
  const autosaveTimerRef = useRef(null);
  const autosaveSeqRef = useRef(0);
  const hintTimerRef = useRef(null);

  const serializeDraft = (value) => {
    try {
      return JSON.stringify(value || null);
    } catch {
      return '';
    }
  };

  const loadGlobal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPermissions();
      setEffective(res?.effective || null);
      const base = res?.effective || { modules: {}, routes: {} };
      // Editamos siempre el config efectivo completo (evita borrados parciales por override).
      const nextDraft = {
        modules: cloneDeep(base.modules || {}),
        routes: cloneDeep(base.routes || {}),
      };
      setDraft(nextDraft);

      const json = serializeDraft(nextDraft);
      lastSavedJsonRef.current = json;
      initializedRef.current = true;
      setAutosaveHint({ text: '', tone: 'info' });
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const ensureUsers = async () => {
    if (usersLoading) return;
    if (users && users.length > 0) return;
    setUsersLoading(true);
    try {
      const data = await getUsuarios();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadUser = async (idPersona) => {
    if (!idPersona) return;
    setLoading(true);
    setError(null);
    try {
      // Usamos el RBAC efectivo del usuario. Si había override, viene aplicado.
      // Para que la UI siempre muestre todos los módulos, completamos con la base global del rol.
      const [globalRes, userRes] = await Promise.all([getPermissions(), getUserPermissions(idPersona)]);
      const globalMatrix = globalRes?.effective || { modules: {}, routes: {} };

      const targetRole = userRes?.user?.tipo || userRes?.effective?.role || role;
      setSelectedUser(userRes?.user || null);

      const baseModulesForRole = {};
      Object.entries(globalMatrix.modules || {}).forEach(([moduleKey, roleMap]) => {
        const allowed = (roleMap && targetRole && Array.isArray(roleMap[targetRole])) ? roleMap[targetRole] : [];
        baseModulesForRole[moduleKey] = Array.isArray(allowed) ? allowed.filter(Boolean) : [];
      });

      const userModules = userRes?.effective?.modules || {};
      const mergedModules = { ...baseModulesForRole };
      Object.entries(userModules).forEach(([moduleKey, allowed]) => {
        mergedModules[moduleKey] = Array.isArray(allowed) ? allowed.filter(Boolean) : [];
      });

      const nextDraft = {
        modules: cloneDeep(mergedModules),
        routes: cloneDeep(userRes?.effective?.routes || []),
      };
      setDraft(nextDraft);
      setEffective(userRes?.effective || null);

      const json = serializeDraft(nextDraft);
      lastSavedJsonRef.current = json;
      initializedRef.current = true;
      setAutosaveHint({ text: '', tone: 'info' });
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGlobal();
  }, []);

  const saveDraft = async (payload, { silent } = { silent: false }) => {
    if (!payload) return;
    if (mode === 'user' && !userId) return;
    setSaving(true);
    setError(null);
    const currentSeq = ++autosaveSeqRef.current;
    try {
      if (mode === 'global') {
        await updatePermissions(payload);
      } else {
        await updateUserPermissions(userId, payload);
      }
      // Solo marcamos como guardado si este guardado es el último en vuelo.
      if (autosaveSeqRef.current === currentSeq) {
        lastSavedJsonRef.current = serializeDraft(payload);
        setAutosaveHint({ text: silent ? 'Cambios guardados.' : 'Guardado.', tone: 'success' });
      }

      // Refrescar RBAC del resto del sistema sin recargar toda la pantalla.
      window.dispatchEvent(new Event('rbac:refresh'));
    } catch (e) {
      setError(e);
      setAutosaveHint({ text: 'Error guardando cambios.', tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Auto-ocultar el hint en 10s.
  useEffect(() => {
    if (!autosaveHint?.text) return;
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => {
      setAutosaveHint({ text: '', tone: 'info' });
    }, 10_000);
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [autosaveHint?.text]);

  // Autosave con debounce (guardado al modificar).
  useEffect(() => {
    if (!initializedRef.current) return;
    if (mode === 'user' && !userId) return;
    const json = serializeDraft(draft);
    if (!json) return;
    if (json === lastSavedJsonRef.current) return;

    setAutosaveHint({ text: 'Cambios pendientes…', tone: 'info' });

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      saveDraft(draft, { silent: true });
    }, 700);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [draft]);

  const moduleKeys = useMemo(() => {
    const present = new Set(Object.keys(draft.modules || {}));
    const keys = MENU_MODULES_ORDER.filter((k) => present.has(k));
    if (!filter.trim()) return keys;
    const f = filter.trim().toLowerCase();
    return keys.filter((k) => k.toLowerCase().includes(f));
  }, [draft.modules, filter]);

  const filteredUsers = useMemo(() => {
    const r = role;
    return (users || []).filter((u) => (u?.tipo || '') === r);
  }, [users, role]);

  const getAllowedFor = (nextDraft, moduleKey) => {
    if (mode === 'user') {
      return Array.isArray(nextDraft.modules?.[moduleKey]) ? nextDraft.modules[moduleKey] : [];
    }
    return Array.isArray(nextDraft.modules?.[moduleKey]?.[role]) ? nextDraft.modules[moduleKey][role] : [];
  };

  const setAllowedFor = (nextDraft, moduleKey, actions) => {
    nextDraft.modules = nextDraft.modules || {};
    if (mode === 'user') {
      nextDraft.modules[moduleKey] = Array.isArray(actions) ? actions : [];
      return;
    }
    nextDraft.modules[moduleKey] = nextDraft.modules[moduleKey] || {};
    nextDraft.modules[moduleKey][role] = Array.isArray(actions) ? actions : [];
  };

  const setModuleBasePermission = (moduleKey, actionKey, enabled) => {
    setDraft((prev) => {
      const next = cloneDeep(prev);
      const current = getAllowedFor(next, moduleKey);
      const currentSet = new Set(current);

      const baseKeys = new Set(['index', 'show', 'store', 'update', 'destroy']);
      const extras = current.filter((a) => !baseKeys.has(a));

      const base = new Set(current.filter((a) => baseKeys.has(a)));

      if (actionKey === 'index') {
        if (enabled) {
          base.add('index');
          base.add('show');
        } else {
          // Si no hay "ver en menú", se deshabilita todo el módulo.
          base.clear();
          return {
            ...next,
            modules: {
              ...next.modules,
              [moduleKey]: {
                ...(next.modules?.[moduleKey] || {}),
                [role]: [],
              },
            },
          };
        }
      } else {
        // Acciones CRUD solo tienen sentido si index está habilitado
        const hasIndex = base.has('index');
        if (!hasIndex) {
          base.clear();
        } else {
          if (enabled) base.add(actionKey);
          else base.delete(actionKey);
          // show siempre acompaña a index
          base.add('show');
        }
      }

      const out = [...extras, ...Array.from(base)].filter(Boolean);
      // Orden estable: extras primero, luego base en orden estándar
      const baseOrder = ['index', 'show', 'store', 'update', 'destroy'];
      const extrasOnly = out.filter((a) => !baseOrder.includes(a));
      const baseOnly = baseOrder.filter((a) => out.includes(a));

      setAllowedFor(next, moduleKey, [...extrasOnly, ...baseOnly]);
      return next;
    });
  };

  const doReset = async () => {
    setSaving(true);
    setError(null);
    try {
      if (mode === 'global') {
        await resetPermissions();
        await loadGlobal();
      } else {
        if (!userId) return;
        await resetUserPermissions(userId);
        await loadUser(userId);
      }
      window.dispatchEvent(new Event('rbac:refresh'));
      setAutosaveHint({ text: 'Configuración por defecto aplicada.', tone: 'success' });
    } catch (e) {
      setError(e);
      setAutosaveHint({ text: 'Error aplicando configuración por defecto.', tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const doReload = async () => {
    if (mode === 'global') return loadGlobal();
    if (!userId) return;
    return loadUser(userId);
  };

  // Cuando cambia el modo, reseteamos estado de autosave.
  useEffect(() => {
    initializedRef.current = false;
    lastSavedJsonRef.current = '';
    setAutosaveHint({ text: '', tone: 'info' });

    if (mode === 'global') {
      setUserId('');
      setSelectedUser(null);
      loadGlobal();
    } else {
      ensureUsers();
      setDraft({ modules: {}, routes: [] });
    }
  }, [mode]);

  // Si cambia el usuario seleccionado, cargamos su RBAC.
  useEffect(() => {
    if (mode !== 'user') return;
    if (!userId) return;
    initializedRef.current = false;
    lastSavedJsonRef.current = '';
    setAutosaveHint({ text: '', tone: 'info' });
    loadUser(userId);
  }, [mode, userId]);

  // En modo usuario, el rol solo filtra la lista; al cambiarlo, limpiamos selección.
  useEffect(() => {
    if (mode !== 'user') return;
    setUserId('');
    setSelectedUser(null);
    initializedRef.current = false;
    lastSavedJsonRef.current = '';
    setAutosaveHint({ text: '', tone: 'info' });
    setDraft({ modules: {}, routes: [] });
  }, [mode, role]);

  return (
    <Box sx={{ color: '#fff', maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 800 }}>
        Permisos
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
        Modifica los permisos
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: 'rgba(255,255,255,0.8)' }}>Modo</InputLabel>
            <Select
              value={mode}
              label="Modo"
              onChange={(e) => setMode(e.target.value)}
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.25)' },
              }}
            >
              <MenuItem value="global">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleAltIcon fontSize="small" /> General (por rol)
                </Box>
              </MenuItem>
              <MenuItem value="user">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" /> Por usuario
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: 'rgba(255,255,255,0.8)' }}>Rol</InputLabel>
            <Select
              value={role}
              label="Rol"
              onChange={(e) => setRole(e.target.value)}
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.25)' },
              }}
            >
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {mode === 'user' && (
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" disabled={usersLoading}>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.8)' }}>Usuario</InputLabel>
              <Select
                value={userId}
                label="Usuario"
                onChange={(e) => setUserId(e.target.value)}
                sx={{
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.25)' },
                }}
              >
                <MenuItem value="">
                  <em>{usersLoading ? 'Cargando…' : 'Seleccione un usuario'}</em>
                </MenuItem>
                {filteredUsers.map((u) => (
                  <MenuItem key={u.id_persona} value={String(u.id_persona)}>
                    {u.nombre} (#{u.id_persona})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12} md={mode === 'user' ? 12 : 6}>
          <TextField
            fullWidth
            size="small"
            label="Filtrar módulos/rutas"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.8)' } }}
            sx={{
              '& .MuiInputBase-input': { color: '#fff' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.25)' },
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={doReset}
          disabled={loading || saving}
          sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}
        >
          Configuración por defecto
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={doReload}
          disabled={loading || saving}
          sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}
        >
          Recargar
        </Button>

        {!!autosaveHint?.text && (
          <Typography
            variant="body2"
            sx={{
              alignSelf: 'center',
              fontWeight: 700,
              color:
                autosaveHint.tone === 'success'
                  ? 'rgba(180, 255, 180, 0.95)'
                  : autosaveHint.tone === 'error'
                    ? 'rgba(255, 190, 190, 0.95)'
                    : 'rgba(255,255,255,0.9)',
            }}
          >
            {autosaveHint.text}
          </Typography>
        )}
      </Box>

      {error && (
        <Typography variant="body2" sx={{ color: '#ffd1d1', mb: 2 }}>
          Error cargando/guardando permisos.
        </Typography>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'rgba(255,255,255,0.10)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Permisos por módulo
              </Typography>
              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 1 }} />

              {mode === 'user' && !userId && (
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  Selecciona un usuario para editar permisos individuales.
                </Typography>
              )}

              {mode === 'user' && selectedUser && (
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  Editando: <strong>{selectedUser.nombre}</strong> · Rol: <strong>{selectedUser.tipo}</strong>
                </Typography>
              )}

              {loading && <LoadingView inline message="Cargando permisos…" />}

              {!loading && (
                <Box sx={{ overflowX: 'auto' }}>
                  <Box
                    sx={{
                      minWidth: 860,
                      display: 'grid',
                      gridTemplateColumns: 'minmax(260px, 1fr) repeat(4, 150px)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1,
                        fontWeight: 900,
                        borderRight: '1px solid rgba(255,255,255,0.18)',
                        borderBottom: '1px solid rgba(255,255,255,0.18)',
                        bgcolor: 'rgba(255,255,255,0.06)',
                      }}
                    >
                      Módulo
                    </Box>
                    {ACTIONS.map((a) => (
                      <Box
                        key={`header:${a.key}`}
                        sx={{
                          px: 1.5,
                          py: 1,
                          fontWeight: 900,
                          textAlign: 'center',
                          borderRight: '1px solid rgba(255,255,255,0.18)',
                          borderBottom: '1px solid rgba(255,255,255,0.18)',
                          bgcolor: 'rgba(255,255,255,0.06)',
                          '&:last-of-type': { borderRight: 'none' },
                        }}
                      >
                        {a.label}
                      </Box>
                    ))}

                    {moduleKeys.map((moduleKey) => {
                      const allowed = new Set(getAllowedFor(draft, moduleKey).filter(Boolean));
                      const indexEnabled = allowed.has('index');
                      const rowCellSx = {
                        px: 1.5,
                        py: 1,
                        minHeight: 54,
                        display: 'flex',
                        alignItems: 'center',
                        borderRight: '1px solid rgba(255,255,255,0.12)',
                        borderBottom: '1px solid rgba(255,255,255,0.12)',
                      };

                      return (
                        <React.Fragment key={moduleKey}>
                          <Box sx={rowCellSx}>
                            <Typography variant="subtitle2" sx={{ opacity: 0.95, fontWeight: 900, lineHeight: 1.2 }}>
                              {prettyModuleTitle(moduleKey)}
                            </Typography>
                          </Box>

                          {ACTIONS.map((a, idx) => {
                            const checked = a.key === 'index' ? indexEnabled : allowed.has(a.key);
                            const disabled = (mode === 'user' && !userId) || (a.key !== 'index' && !indexEnabled);

                            return (
                              <Box
                                key={`${moduleKey}:${a.key}`}
                                sx={{
                                  ...rowCellSx,
                                  justifyContent: 'center',
                                  borderRight: idx === ACTIONS.length - 1 ? 'none' : rowCellSx.borderRight,
                                }}
                              >
                                <Button
                                  size="small"
                                  variant={checked ? 'contained' : 'outlined'}
                                  startIcon={a.icon}
                                  fullWidth
                                  disabled={disabled || saving}
                                  onClick={() => setModuleBasePermission(moduleKey, a.key, !checked)}
                                  sx={{
                                    color: checked ? undefined : '#fff',
                                    borderColor: 'rgba(255,255,255,0.35)',
                                    minHeight: 36,
                                    textTransform: 'none',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {a.label}
                                </Button>
                              </Box>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {!loading && moduleKeys.length === 0 && (
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  Sin módulos.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
