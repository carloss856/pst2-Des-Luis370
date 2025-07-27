import React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import NavBar from "./components/NavBar";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import EmpresasList from "./components/empresas/EmpresasList";
import EmpresaForm from "./components/empresas/EmpresaForm";
import EmpresaEditForm from "./components/empresas/EmpresaEditForm";
import UsuariosList from "./components/usuarios/UsuariosList";
import UsuarioForm from "./components/usuarios/UsuarioForm";
import UsuarioEditForm from "./components/usuarios/UsuarioEditForm";
import EquiposList from "./components/equipos/EquiposList";
import EquipoForm from "./components/equipos/EquipoForm";
import EquipoEditForm from "./components/equipos/EquipoEditForm";
import ServiciosList from "./components/servicios/ServiciosList";
import ServicioForm from "./components/servicios/ServicioForm";
import ServicioEditForm from "./components/servicios/ServicioEditForm";
import RepuestosList from "./components/repuestos/RepuestosList";
import RepuestosForm from "./components/repuestos/RepuestosForm";
import RepuestoEditForm from "./components/repuestos/RepuestoEditForm";
import Inventario from "./components/Inventario";
import Solicitudes from "./components/solicitudes/SolicitudesRepuestosList";
import SolicitudesForm from "./components/solicitudes/SolicitudesRepuestosForm";
import SolicitudesEditForm from "./components/solicitudes/SolicitudesRepuestosEditForm";
import Notificaciones from "./components/NotificacionesList";
import Reportes from "./components/ReportesList";

// Dashboard de ejemplo
const Dashboard = () => (
  <div className="text-center mt-40 text-white">
    <h2>Bienvenido al sistema</h2>
    <p>Selecciona una opción del menú.</p>
  </div>
);

function PrivateRoute({ children, roles }) {
  const isLogged = !!localStorage.getItem("token");
  const rol = localStorage.getItem("rol_usuario");
  if (!isLogged) return <Navigate to="/login" />;
  if (roles && !roles.includes(rol || "")) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

function AppContent({ isLogged }) {
  return (
    <Box
      sx={{
        bgcolor: "#48c",
        minHeight: "100vh",
        width: "100vw",
        transition: "margin-left 0.3s",
      }}
    >
      <Routes>
        <Route
          path="/login"
          element={
            <Login onLogin={() => (window.location.href = "/dashboard")} />
          }
        />
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
            <PrivateRoute>
              <EmpresasList />
            </PrivateRoute>
          }
        />
        <Route
          path="/empresas/crear"
          element={
            <PrivateRoute>
              <EmpresaForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/empresas/:id/editar"
          element={
            <PrivateRoute>
              <EmpresaEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute roles={["Administrador", "Gerente"]}>
              <UsuariosList />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios/crear"
          element={
            <PrivateRoute roles={["Administrador", "Gerente"]}>
              <UsuarioForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios/:id/editar"
          element={
            <PrivateRoute roles={["Administrador", "Gerente"]}>
              <UsuarioEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/equipos"
          element={
            <PrivateRoute>
              <EquiposList />
            </PrivateRoute>
          }
        />
        <Route
          path="/equipos/crear"
          element={
            <PrivateRoute>
              <EquipoForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/equipos/:id/editar"
          element={
            <PrivateRoute>
              <EquipoEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/servicios"
          element={
            <PrivateRoute>
              <ServiciosList />
            </PrivateRoute>
          }
        />
        <Route
          path="/servicios/crear"
          element={
            <PrivateRoute>
              <ServicioForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/servicios/:id/editar"
          element={
            <PrivateRoute>
              <ServicioEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/repuestos"
          element={
            <PrivateRoute>
              <RepuestosList />
            </PrivateRoute>
          }
        />
        <Route
          path="/repuestos/crear"
          element={
            <PrivateRoute>
              <RepuestosForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/repuestos/:id/editar"
          element={
            <PrivateRoute>
              <RepuestoEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario"
          element={
            <PrivateRoute>
              <Inventario />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitudes-repuestos"
          element={
            <PrivateRoute>
              <Solicitudes />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitudes-repuestos/crear"
          element={
            <PrivateRoute>
              <SolicitudesForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitudes-repuestos/:id/editar"
          element={
            <PrivateRoute>
              <SolicitudesEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/notificaciones"
          element={
            <PrivateRoute>
              <Notificaciones />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <PrivateRoute>
              <Reportes />
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

  return (
    <BrowserRouter>
      <CssBaseline />
      {isLogged && <NavBar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />}
      <AppContent isLogged={isLogged} />
    </BrowserRouter>
  );
}

export default App;