import React from "react";
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, IconButton
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import BuildIcon from "@mui/icons-material/Build";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReportIcon from "@mui/icons-material/Assessment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useLocation } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import logo from "../assets/Logo_Luis370.png";
import SettingsIcon from "@mui/icons-material/Settings";


function SidebarContent({ location, rol, handleLogout, onClose }) {
  const commonLinks = [
    { to: "/empresas", label: "Empresas", icon: <BusinessIcon /> },
    { to: "/equipos", label: "Equipos", icon: <BuildIcon /> },
    { to: "/servicios", label: "Servicios", icon: <BuildIcon /> },
    { to: "/repuestos", label: "Repuestos", icon: <InventoryIcon /> },
    { to: "/solicitudes-repuestos", label: "Solicitudes de Repuestos", icon: <BuildIcon /> },
  ];
  const adminLinks = [
    { to: "/inventario", label: "Inventario", icon: <InventoryIcon /> },
    { to: "/notificaciones", label: "Notificaciones", icon: <NotificationsIcon /> },
    { to: "/reportes", label: "Reportes", icon: <ReportIcon /> },
    { to: "/usuarios", label: "Usuarios del Sistema", icon: <PeopleIcon /> },
    { to: "/garantias", label: "Garantías", icon: <BuildIcon /> },
  ];

  const renderLinks = (links) => links.map(link => (
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
          bgcolor: location.pathname.startsWith(link.to) ? "#1976d2" : "transparent",
          fontWeight: location.pathname.startsWith(link.to) ? "bold" : "normal",
          "&:hover": { bgcolor: location.pathname.startsWith(link.to) ? "#1565c0" : "rgba(255,255,255,0.08)" }
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

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 2, pt: 2, pb: 1, textAlign: "center" }}>
        <img src={logo} alt="Logo" style={{ width: "100%", maxWidth: 160, objectFit: "contain" }} />
      </Box>
      <Divider />
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <List sx={{ py: 1 }}>
          {renderLinks(commonLinks)}
          {(rol === "Administrador" || rol === "Gerente") && (
            <>
              <Divider sx={{ my: 1 }} />
              {renderLinks(adminLinks)}
            </>
          )}
        </List>
      </Box>
      <Divider />
      <List sx={{ py: 0.5 }}>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/configuracion/notificaciones"
            sx={{ width: "100%", color: "#fff", px: 2, py: 1, "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}
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
            sx={{ width: "100%", color: "#fff", px: 2, py: 1, "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}
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

export default function NavBar({ mobileOpen, setMobileOpen }) {
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
            bgcolor: "#1976d2",
            color: "#fff",
            "&:hover": { bgcolor: "#1565c0" }
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
              bgcolor: "#555",
              color: "#fff",
              borderRight: "1px solid #444"
            }
          }}
        >
          <SidebarContent
            location={location}
            rol={rol}
            handleLogout={handleLogout}
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
        bgcolor: "#555",
        color: "#fff",
        borderRight: "1px solid #444"
      }}
    >
      <SidebarContent
        location={location}
        rol={rol}
        handleLogout={handleLogout}
      />
    </Box>
  );
}