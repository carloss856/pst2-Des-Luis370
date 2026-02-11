import React from "react";
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, IconButton
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import BuildIcon from "@mui/icons-material/Build";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReportIcon from "@mui/icons-material/Assessment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { Link, useLocation } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import logo from "../assets/Logo_Luis370.png";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { canModule, canRoute } from "../utils/rbac";


function SidebarContent({ location, rol, handleLogout, onClose, rbac, rbacLoading }) {
  const linksGeneral = [
    { to: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { to: "/empresas", label: "Empresas", icon: <BusinessIcon />, module: 'empresas' },
    { to: "/equipos", label: "Equipos", icon: <BuildIcon />, module: 'equipos' },
    { to: "/repuestos", label: "Repuestos", icon: <InventoryIcon />, module: 'repuestos' },
    { to: "/inventario", label: "Inventario", icon: <InventoryIcon />, module: 'inventario' },
  ];

  const linksTecnicos = [
    { to: "/servicios", label: "Servicios", icon: <BuildIcon />, module: 'servicios' },
    { to: "/solicitudes-repuestos", label: "Solicitudes de Repuestos", icon: <BuildIcon />, module: 'solicitud-repuestos' },
    { to: "/garantias", label: "Garantías", icon: <BuildIcon />, module: 'garantias' },
  ];

  const linksAdministracion = [
    { to: "/usuarios", label: "Usuarios del Sistema", icon: <PeopleIcon />, module: 'usuarios' },
    { to: "/notificaciones", label: "Notificaciones", icon: <NotificationsIcon />, module: 'notificaciones' },
    { to: "/tarifas-servicio", label: "Tarifas de Servicio", icon: <BuildIcon />, module: 'tarifas-servicio' },
    { to: "/reportes", label: "Reportes", icon: <ReportIcon />, module: 'reportes' },
    { to: "/permisos", label: "Permisos", icon: <AdminPanelSettingsIcon />, routeName: 'permissions.index' },
  ];
  const user = localStorage.getItem("nombre_usuario");

  const isLinkAllowed = (link) => {
    if (link.to === '/dashboard') return true;
    if (rbacLoading) return false;
    if (link.module) return canModule(rbac, link.module, 'index');
    if (link.routeName) return canRoute(rbac, link.routeName);
    return false;
  };

  const renderLinks = (links) => links.filter(isLinkAllowed).map(link => (
    <ListItem key={link.to} disablePadding sx={{ width: "100%" }}>
      <ListItemButton
        component={Link}
        to={link.to}
        selected={location.pathname.startsWith(link.to)}
        onClick={onClose}
        sx={{
          width: "100%",
          alignItems: "flex-start",
          py: 1,
          px: 2,
          gap: 1,
          color: "#fff",
          bgcolor: location.pathname.startsWith(link.to) ? "var(--app-nav-active-bg)" : "transparent",
          fontWeight: location.pathname.startsWith(link.to) ? "bold" : "normal",
          "&:hover": { bgcolor: location.pathname.startsWith(link.to) ? "var(--app-nav-active-hover-bg)" : "var(--app-nav-hover-bg)" }
        }}
      >
        <ListItemIcon sx={{ minWidth: 36, color: "#fff", mt: "2px" }}>{link.icon}</ListItemIcon>
        <ListItemText
          primary={link.label}
          primaryTypographyProps={{
            sx: {
              fontSize: 14,
              lineHeight: 1.25,
              whiteSpace: "normal",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              pr: 0
            }
          }}
        />
      </ListItemButton>
    </ListItem>
  ));

  const visibleGeneral = linksGeneral.filter(isLinkAllowed);
  const visibleTecnicos = linksTecnicos.filter(isLinkAllowed);
  const visibleAdmin = linksAdministracion.filter(isLinkAllowed);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 2, pt: 2, pb: 1, textAlign: "center" }}>
        <img src={logo} alt="Logo" style={{ width: "100%", maxWidth: 160, objectFit: "contain" }} />
      </Box>
      <Divider sx={{ bgcolor: 'var(--app-nav-divider)' }} />
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <List sx={{ py: 1 }}>
          {renderLinks(linksGeneral)}
          {visibleTecnicos.length > 0 && <Divider sx={{ my: 1, bgcolor: 'var(--app-nav-divider)' }} />}
          {renderLinks(linksTecnicos)}
          {visibleAdmin.length > 0 && <Divider sx={{ my: 1, bgcolor: 'var(--app-nav-divider)' }} />}
          {renderLinks(linksAdministracion)}
        </List>
      </Box>
      <Divider sx={{ bgcolor: 'var(--app-nav-divider)' }} />
      <List sx={{ py: 0.5 }}>
        <ListItem disablePadding>
          <ListItemButton
            disabled
            sx={{
              width: "100%",
              color: "#fff",
              px: 2,
              py: 1,
              "&.Mui-disabled": { opacity: 1 }
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "#fff" }}>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText
              primary={`Usuario: ${user}`}
              primaryTypographyProps={{ sx: { fontSize: 14 } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/configuracion/notificaciones"
            sx={{ width: "100%", color: "#fff", px: 2, py: 1, "&:hover": { bgcolor: "var(--app-nav-hover-bg)" } }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "#fff" }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText
              primary="Configuración"
              primaryTypographyProps={{ sx: { fontSize: 14 } }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{ width: "100%", color: "#fff", px: 2, py: 1, "&:hover": { bgcolor: "var(--app-nav-hover-bg)" } }}
          >

            <ListItemIcon sx={{ minWidth: 36, color: "#fff" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Cerrar sesión"
              primaryTypographyProps={{ sx: { fontSize: 14, lineHeight: 1.25, whiteSpace: "normal", wordBreak: "break-word" } }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}

export default function NavBar({ mobileOpen, setMobileOpen, rbac, rbacLoading }) {
  const rol = localStorage.getItem("rol_usuario");
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // <900px

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (isMobile) {
    return (
      <>
        <IconButton
          aria-label="menu"
          onClick={() => setMobileOpen(p => !p)}
          sx={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 1300,
            bgcolor: "var(--app-nav-active-bg)",
            color: "#fff",
            "&:hover": { bgcolor: "var(--app-nav-active-hover-bg)" }
          }}
          size="large"
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: "75%",
              maxWidth: 320,
              boxSizing: "border-box",
              bgcolor: "var(--app-nav-bg)",
              color: "#fff",
              borderRight: "1px solid var(--app-nav-border)"
            }
          }}
        >
          <SidebarContent
            location={location}
            rol={rol}
            handleLogout={handleLogout}
            rbac={rbac}
            rbacLoading={rbacLoading}
            onClose={() => setMobileOpen(false)}
          />
        </Drawer>
      </>
    );
  }

  // Escritorio: ocupar 25% del ancho contenedor padre (flex)
  return (
    <Box
      sx={{
        flexBasis: "25%",
        maxWidth: "25%",
        minWidth: 240,
        display: "flex",
        flexDirection: "column",
        bgcolor: "var(--app-nav-bg)",
        color: "#fff",
        borderRight: "1px solid var(--app-nav-border)"
      }}
    >
      <SidebarContent
        location={location}
        rol={rol}
        handleLogout={handleLogout}
        rbac={rbac}
        rbacLoading={rbacLoading}
      />
    </Box>
  );
}