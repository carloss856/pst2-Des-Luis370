import React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import NavBar from "./components/NavBar";
import LoadingView from "./components/LoadingView";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { getMyRbac } from "./services/rbac";
import { canModule, canRoute, getRbacCache, setRbacCache } from "./utils/rbac";
import { warmUpCoreData } from "./utils/warmup";

// Lazy routes (code-splitting)
const loadLogin = () => import("./pages/Login");
const loadDashboard = () => import("./pages/Dashboard");
const loadEmpresasList = () => import("./components/empresas/EmpresasList");
const loadEmpresaForm = () => import("./components/empresas/EmpresaForm");
const loadEmpresaEditForm = () => import("./components/empresas/EmpresaEditForm");
const loadUsuariosList = () => import("./components/usuarios/UsuariosList");
const loadUsuarioForm = () => import("./components/usuarios/UsuarioForm");
const loadUsuarioEditForm = () => import("./components/usuarios/UsuarioEditForm");
const loadEquiposList = () => import("./components/equipos/EquiposList");
const loadEquipoForm = () => import("./components/equipos/EquipoForm");
const loadEquipoEditForm = () => import("./components/equipos/EquipoEditForm");
const loadInventario = () => import("./components/inventario/Inventario");
const loadInventarioForm = () => import("./components/inventario/InventarioForm");
const loadServiciosList = () => import("./components/servicios/ServiciosList");
const loadServicioForm = () => import("./components/servicios/ServicioForm");
const loadServicioEditForm = () => import("./components/servicios/ServicioEditForm");
const loadRepuestosList = () => import("./components/repuestos/RepuestosList");
const loadRepuestosForm = () => import("./components/repuestos/RepuestosForm");
const loadRepuestoEditForm = () => import("./components/repuestos/RepuestoEditForm");
const loadSolicitudes = () => import("./components/solicitudes/SolicitudesRepuestosList");
const loadSolicitudesForm = () => import("./components/solicitudes/SolicitudesRepuestosForm");
const loadSolicitudesEditForm = () => import("./components/solicitudes/SolicitudesRepuestosEditForm");
const loadNotificaciones = () => import("./components/NotificacionesList");
const loadNotificacionesConfigForm = () => import("./components/usuarios/NotificacionesConfigForm");
const loadReportes = () => import("./components/ReportesList");
const loadForgotPassword = () => import("./components/usuarios/ResetPassword");
const loadResetPassword = () => import("./components/usuarios/ResetPasswordForm");
const loadGarantiasList = () => import("./components/Garantias/GarantiasList");
const loadGarantiaEditForm = () => import("./components/garantias/GarantiasEditForm");
const loadServicePartsPanel = () => import("./components/ServicePartsPanel");
const loadTarifasPanel = () => import("./components/TarifasPanel");
const loadPermissions = () => import("./pages/Permissions");

const Login = React.lazy(loadLogin);
const Dashboard = React.lazy(loadDashboard);
const EmpresasList = React.lazy(loadEmpresasList);
const EmpresaForm = React.lazy(loadEmpresaForm);
const EmpresaEditForm = React.lazy(loadEmpresaEditForm);
const UsuariosList = React.lazy(loadUsuariosList);
const UsuarioForm = React.lazy(loadUsuarioForm);
const UsuarioEditForm = React.lazy(loadUsuarioEditForm);
const EquiposList = React.lazy(loadEquiposList);
const EquipoForm = React.lazy(loadEquipoForm);
const EquipoEditForm = React.lazy(loadEquipoEditForm);
const Inventario = React.lazy(loadInventario);
const InventarioForm = React.lazy(loadInventarioForm);
const ServiciosList = React.lazy(loadServiciosList);
const ServicioForm = React.lazy(loadServicioForm);
const ServicioEditForm = React.lazy(loadServicioEditForm);
const RepuestosList = React.lazy(loadRepuestosList);
const RepuestosForm = React.lazy(loadRepuestosForm);
const RepuestoEditForm = React.lazy(loadRepuestoEditForm);
const Solicitudes = React.lazy(loadSolicitudes);
const SolicitudesForm = React.lazy(loadSolicitudesForm);
const SolicitudesEditForm = React.lazy(loadSolicitudesEditForm);
const Notificaciones = React.lazy(loadNotificaciones);
const NotificacionesConfigForm = React.lazy(loadNotificacionesConfigForm);
const Reportes = React.lazy(loadReportes);
const ForgotPassword = React.lazy(loadForgotPassword);
const ResetPassword = React.lazy(loadResetPassword);
const GarantiasList = React.lazy(loadGarantiasList);
const GarantiaEditForm = React.lazy(loadGarantiaEditForm);
const ServicePartsPanel = React.lazy(loadServicePartsPanel);
const TarifasPanel = React.lazy(loadTarifasPanel);
const Permissions = React.lazy(loadPermissions);

const preloadAllModules = () => {
  [
    loadDashboard,
    loadEmpresasList,
    loadEmpresaForm,
    loadEmpresaEditForm,
    loadUsuariosList,
    loadUsuarioForm,
    loadUsuarioEditForm,
    loadEquiposList,
    loadEquipoForm,
    loadEquipoEditForm,
    loadInventario,
    loadInventarioForm,
    loadServiciosList,
    loadServicioForm,
    loadServicioEditForm,
    loadRepuestosList,
    loadRepuestosForm,
    loadRepuestoEditForm,
    loadSolicitudes,
    loadSolicitudesForm,
    loadSolicitudesEditForm,
    loadNotificaciones,
    loadNotificacionesConfigForm,
    loadReportes,
    loadForgotPassword,
    loadResetPassword,
    loadGarantiasList,
    loadGarantiaEditForm,
    loadServicePartsPanel,
    loadTarifasPanel,
    loadPermissions,
  ].forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
};

const preloadPriorityModules = () => {
  [loadServiciosList, loadSolicitudes, loadGarantiasList].forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
};


function PrivateRoute({ children, roles, module, action, routeName, rbac, rbacLoading }) {
  const isLogged = !!localStorage.getItem("token");
  const rol = localStorage.getItem("rol_usuario");
  if (!isLogged) return <Navigate to="/login" />;
  if (roles && !roles.includes(rol || "")) return <Navigate to="/dashboard" />;

  if ((module && action) || routeName) {
    if (rbacLoading) {
      return <LoadingView message="Cargando permisos…" />;
    }

    const ok = routeName
      ? canRoute(rbac, routeName)
      : canModule(rbac, module, action);
    if (!ok) return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}
function AppContent({ rbac, rbacLoading }) {
  return (
    <Box
      className="app-content"
      sx={{
        flex: 1,
        height: "100%",
        minHeight: 0,
        bgcolor: "#48c",
        px: { xs: 2, md: 3 },
        py: 2,
        overflowX: "hidden"
      }}
    >
      <Routes>
        <Route
          path="/login"
          element={
            <Login onLogin={() => (window.location.href = "/dashboard")} />
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/empresas"
          element={
            <PrivateRoute module="empresas" action="index" rbac={rbac} rbacLoading={rbacLoading}>
              <EmpresasList />
            </PrivateRoute>
          }
        />
        <Route
          path="/empresas/crear"
          element={
            <PrivateRoute module="empresas" action="store" rbac={rbac} rbacLoading={rbacLoading}>
              <EmpresaForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/empresas/:id/editar"
          element={
            <PrivateRoute module="empresas" action="update" rbac={rbac} rbacLoading={rbacLoading}>
              <EmpresaEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute module="usuarios" action="index" rbac={rbac} rbacLoading={rbacLoading}>
              <UsuariosList />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios/crear"
          element={
            <PrivateRoute module="usuarios" action="store" rbac={rbac} rbacLoading={rbacLoading}>
              <UsuarioForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios/:id/editar"
          element={
            <PrivateRoute module="usuarios" action="update" rbac={rbac} rbacLoading={rbacLoading}>
              <UsuarioEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/equipos"
          element={
            <PrivateRoute module="equipos" action="index" rbac={rbac} rbacLoading={rbacLoading}>
              <EquiposList />
            </PrivateRoute>
          }
        />
        <Route
          path="/equipos/crear"
          element={
            <PrivateRoute module="equipos" action="store" rbac={rbac} rbacLoading={rbacLoading}>
              <EquipoForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/equipos/:id/editar"
          element={
            <PrivateRoute module="equipos" action="update" rbac={rbac} rbacLoading={rbacLoading}>
              <EquipoEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario"
          element={
            <PrivateRoute module="inventario" action="index" rbac={rbac} rbacLoading={rbacLoading}>
              <Inventario />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario/crear"
          element={
            <PrivateRoute module="inventario" action="store" rbac={rbac} rbacLoading={rbacLoading}>
              <InventarioForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/servicios"
          element={
            <PrivateRoute module="servicios" action="index" rbac={rbac} rbacLoading={rbacLoading}>
              <ServiciosList />
            </PrivateRoute>
          }
        />
        <Route
          path="/servicios/crear"
          element={
            <PrivateRoute module="servicios" action="store" rbac={rbac} rbacLoading={rbacLoading}>
              <ServicioForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/servicios/:id/editar"
          element={
            <PrivateRoute module="servicios" action="update" rbac={rbac} rbacLoading={rbacLoading}>
              <ServicioEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/repuestos"
          element={
            <PrivateRoute module="repuestos" action="index" rbac={rbac} rbacLoading={rbacLoading}>
              <RepuestosList />
            </PrivateRoute>
          }
        />
        <Route
          path="/repuestos/crear"
          element={
            <PrivateRoute module="repuestos" action="store" rbac={rbac} rbacLoading={rbacLoading}>
              <RepuestosForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/repuestos/:id/editar"
          element={
            <PrivateRoute module="repuestos" action="update" rbac={rbac} rbacLoading={rbacLoading}>
              <RepuestoEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitudes-repuestos"
          element={
            <PrivateRoute module="solicitud-repuestos" action="index" rbac={rbac} rbacLoading={rbacLoading}>
              <Solicitudes />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitudes-repuestos/crear"
          element={
            <PrivateRoute module="solicitud-repuestos" action="store" rbac={rbac} rbacLoading={rbacLoading}>
              <SolicitudesForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitudes-repuestos/:id/editar"
          element={
            <PrivateRoute module="solicitud-repuestos" action="update" rbac={rbac} rbacLoading={rbacLoading}>
              <SolicitudesEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/notificaciones"
          element={
            <PrivateRoute module="notificaciones" action="index" rbac={rbac} rbacLoading={rbacLoading}>
              <Notificaciones />
            </PrivateRoute>
          }
        />
        <Route
          path="/configuracion/notificaciones"
          element={
            <PrivateRoute>
              <NotificacionesConfigForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <PrivateRoute module="reportes" action="index" rbac={rbac} rbacLoading={rbacLoading}>
              <Reportes />
            </PrivateRoute>
          }
        />
        <Route
          path="/garantias"
          element={
            <PrivateRoute module="garantias" action="index" rbac={rbac} rbacLoading={rbacLoading}>
              <GarantiasList />
            </PrivateRoute>
          }
        />
        <Route
          path="/garantias/:id/editar"
          element={
            <PrivateRoute module="garantias" action="update" rbac={rbac} rbacLoading={rbacLoading}>
              <GarantiaEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/servicios/:id/partes"
          element={
            <PrivateRoute routeName="servicios.partes.index" rbac={rbac} rbacLoading={rbacLoading}>
              <ServicePartsPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/tarifas-servicio"
          element={
            <PrivateRoute module="tarifas-servicio" action="index" rbac={rbac} rbacLoading={rbacLoading}>
              <TarifasPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/permisos"
          element={
            <PrivateRoute roles={["Administrador", "Gerente"]}>
              <Permissions />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Box>
  );
}

function App() {
  const isLogged = !!localStorage.getItem("token");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [rbac, setRbac] = React.useState(() => getRbacCache());
  const [rbacLoading, setRbacLoading] = React.useState(() => isLogged && !getRbacCache());
  const [bootLoading, setBootLoading] = React.useState(false);
  const rbacRef = React.useRef(rbac);

  React.useEffect(() => {
    rbacRef.current = rbac;
  }, [rbac]);

  const refreshRbac = React.useCallback(() => {
    if (!isLogged) return;
    const shouldBlock = !rbacRef.current;
    if (shouldBlock) setRbacLoading(true);
    getMyRbac()
      .then((data) => {
        setRbac(data);
        setRbacCache(data);
      })
      .catch(() => {
        // Si ya había RBAC cacheado, mantenemos el último conocido (carga pasiva).
        if (shouldBlock) {
          setRbac(null);
          setRbacCache(null);
        }
      })
      .finally(() => {
        if (shouldBlock) setRbacLoading(false);
      });
  }, [isLogged]);

  React.useEffect(() => {
    if (!isLogged) {
      setRbac(null);
      setRbacLoading(false);
      return;
    }

    refreshRbac();
  }, [isLogged, refreshRbac]);

  // Precarga pasiva (para que los módulos abran rápido y no quede la vista en “Cargando”).
  React.useEffect(() => {
    if (!isLogged) return;

    // 1) Prioridad: módulos que el usuario siente “lentos” (chunk + datos)
    try { preloadPriorityModules(); } catch {}
    Promise.resolve().then(() => warmUpCoreData()).catch(() => {});

    // 2) Resto: en idle para no bloquear el hilo
    const id = typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback(() => preloadAllModules())
      : window.setTimeout(() => preloadAllModules(), 600);
    return () => {
      if (typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(id);
      } else {
        window.clearTimeout(id);
      }
    };
  }, [isLogged]);

  // Warmup “tipo AJAX”: una sola ventana de carga por sesión y luego navegas sin esperas.
  React.useEffect(() => {
    if (!isLogged) return;
    const key = 'warmup_done_v1';
    if (sessionStorage.getItem(key) === '1') return;

    let cancelled = false;
    setBootLoading(true);

    (async () => {
      try {
        preloadAllModules();
        await warmUpCoreData();
      } finally {
        if (cancelled) return;
        sessionStorage.setItem(key, '1');
        setBootLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLogged]);

  React.useEffect(() => {
    if (!isLogged) return;
    const handler = () => refreshRbac();
    window.addEventListener('rbac:refresh', handler);
    return () => window.removeEventListener('rbac:refresh', handler);
  }, [isLogged]);

  return (
    <BrowserRouter>
      <CssBaseline />
      <React.Suspense fallback={<LoadingView message="Cargando módulo…" />}>
        {isLogged ? (
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, height: "100dvh", minHeight: 0, bgcolor: "#48c" }}>
            <NavBar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} rbac={rbac} rbacLoading={rbacLoading} />
            <Box
              sx={{
                flex: 1,
                flexBasis: "100%",
                maxWidth: { md: "100%" },
                height: "100%",
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              {bootLoading ? (
                <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
                  <LoadingView message="Cargando datos del sistema…" />
                </Box>
              ) : (
                <AppContent rbac={rbac} rbacLoading={rbacLoading} />
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ height: "100dvh", width: "100dvw", bgcolor: "#48c" }}>
            <Routes>
              <Route
                path="/login"
                element={
                  <>
                    <Login onLogin={() => (window.location.href = "/dashboard")} />
                  </>
                }
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </Box>
        )}
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;