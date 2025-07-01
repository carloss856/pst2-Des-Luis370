import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import EmpresasList from "./components/EmpresasList";
import EmpresaForm from "./components/EmpresaForm";
import EmpresaEditForm from "./components/EmpresaEditForm";
import UsuariosList from "./components/UsuariosList";
import UsuarioForm from "./components/UsuarioForm";
import UsuarioEditForm from "./components/UsuarioEditForm";
import EquiposList from "./components/EquiposList";
import EquipoForm from "./components/EquipoForm";
import EquipoEditForm from "./components/EquipoEditForm";
import ServiciosList from "./components/ServiciosList";
import ServicioForm from "./components/ServicioForm";
import ServicioEditForm from "./components/ServicioEditForm";
import RepuestosList from "./components/RepuestosList";
import RepuestosForm from "./components/RepuestosForm";
import RepuestoEditForm from "./components/RepuestoEditForm";
import Inventario from "./components/Inventario";
import Solicitudes from "./components/SolicitudesRepuestosList";
import SolicitudesForm from "./components/SolicitudesRepuestosForm";
import SolicitudesEditForm from "./components/SolicitudesRepuestosEditForm";
import Notificaciones from "./components/NotificacionesList";
import Reportes from "./components/ReportesList";

// Componentes vacíos para los demás módulos
const Dashboard = () => {};

function PrivateRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) {
  const isLogged = !!localStorage.getItem("token");
  const rol = localStorage.getItem("rol_usuario");
  if (!isLogged) return <Navigate to="/login" />;
  if (roles && !roles.includes(rol || "")) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

function Navbar() {
  const rol = localStorage.getItem("rol_usuario");
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const navLinks = [
    { to: "/empresas", label: "Empresas" },
    ...(rol === "Administrador" || rol === "Gerente"
      ? [{ to: "/usuarios", label: "Usuarios" }]
      : []),
    { to: "/equipos", label: "Equipos" },
    { to: "/servicios", label: "Servicios" },
    { to: "/repuestos", label: "Repuestos" },
    { to: "/inventario", label: "Inventario" },
    { to: "/solicitudes-repuestos", label: "Solicitudes" },
    { to: "/notificaciones", label: "Notificaciones" },
    { to: "/reportes", label: "Reportes" },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <AppBar position="fixed" sx={{ bgcolor: "#424242", color: "#fff" }}>
      <Toolbar variant="dense" sx={{ minHeight: "45px !important" }}>
        <Typography variant="h6" sx={{ flexGrow: 0 }}>
          <Link
            to="/dashboard"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            Inventario Luis370
          </Link>
        </Typography>
        {isMobile ? (
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              keepMounted
            >
              {navLinks.map((link) => (
                <MenuItem
                  key={link.to}
                  component={Link}
                  to={link.to}
                  onClick={handleClose}
                  selected={isActive(link.to)}
                >
                  {link.label}
                </MenuItem>
              ))}
              <MenuItem
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
              >
                Cerrar sesión
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            {navLinks.map((link) => (
              <Button
                key={link.to}
                color="inherit"
                component={Link}
                to={link.to}
                sx={{
                  borderBottom: isActive(link.to) ? "2px solid #fff" : "none",
                  color: "#fff",
                }}
              >
                {link.label}
              </Button>
            ))}
            <Button
              color="inherit"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
            >
              Cerrar sesión
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

function AppContent() {
  return (
    <Box
      sx={{
        bgcolor: "#fffde7",
        minHeight: "100vh",
        width: "100vw",
        pt: "45px", // Separación para el AppBar fijo
        overflow: "hidden",
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
  return (
    <BrowserRouter>
      <CssBaseline />
      <Navbar />
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
