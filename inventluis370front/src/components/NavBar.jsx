import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import BuildIcon from "@mui/icons-material/Build";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReportIcon from "@mui/icons-material/Assessment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../assets/Logo_Luis370.png";
import { Link, useLocation } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

function SidebarContent({ location, rol, handleLogout, onClose }) {
  const commonLinks = [
    // { to: "/dashboard", label: "Inicio", icon: <HomeIcon /> },
    { to: "/empresas", label: "Empresas", icon: <BusinessIcon /> },
    { to: "/equipos", label: "Equipos", icon: <BuildIcon /> },
    { to: "/servicios", label: "Servicios", icon: <BuildIcon /> },
    { to: "/repuestos", label: "Repuestos", icon: <InventoryIcon /> },
    { to: "/solicitudes-repuestos", label: "Solicitudes", icon: <BuildIcon /> },
  ];
  const adminLinks = [
    { to: "/inventario", label: "Inventario", icon: <InventoryIcon /> },
    { to: "/notificaciones", label: "Notificaciones", icon: <NotificationsIcon /> },
    { to: "/reportes", label: "Reportes", icon: <ReportIcon /> },
    { to: "/usuarios", label: "Usuarios", icon: <PeopleIcon /> },
  ];

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img src={logo} alt="Logo" style={{ width: "100%", marginBottom: 16, objectFit: "contain" }} />
      </Box>
      <Divider sx={{ bgcolor: "#000" }} />
      <List sx={{ flexGrow: 1, overflowY: "auto" }}>
        {commonLinks.map((link) => (
          <ListItem key={link.to} disablePadding>
            <ListItemButton
              component={Link}
              to={link.to}
              selected={location.pathname.startsWith(link.to)}
              sx={{
                color: "#fff",
                bgcolor: location.pathname.startsWith(link.to) ? "#1976d2" : "inherit",
                fontWeight: location.pathname.startsWith(link.to) ? "bold" : "normal",
                borderRadius: 1,
                mx: 1,
                my: 0.5,
              }}
              onClick={onClose}
            >
              <ListItemIcon sx={{ color: "#fff" }}>{link.icon}</ListItemIcon>
              <ListItemText primary={link.label} />
            </ListItemButton>
          </ListItem>
        ))}
        {(rol === "Administrador" || rol === "Gerente") && (
          <>
            <Divider sx={{ bgcolor: "#000", my: 1 }} />
            {adminLinks.map((link) => (
              <ListItem key={link.to} disablePadding>
                <ListItemButton
                  component={Link}
                  to={link.to}
                  selected={location.pathname.startsWith(link.to)}
                  sx={{
                    color: "#fff",
                    bgcolor: location.pathname.startsWith(link.to) ? "#1976d2" : "inherit",
                    fontWeight: location.pathname.startsWith(link.to) ? "bold" : "normal",
                    borderRadius: 1,
                    mx: 1,
                    my: 0.5,
                  }}
                  onClick={onClose}
                >
                  <ListItemIcon sx={{ color: "#fff" }}>{link.icon}</ListItemIcon>
                  <ListItemText primary={link.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </>
        )}
      </List>
      <Divider sx={{ bgcolor: "#000" }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ color: "#fff" }}>
            <ListItemIcon sx={{ color: "#fff" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Cerrar sesión" />
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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <>
      {isMobile ? (
        <>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{
              position: "fixed",
              top: 16,
              left: 16,
              zIndex: 1300,
              bgcolor: "#1976d2",
              color: "#fff",
            }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", sm: "none", md: "none", lg: "none", xl: "none", xxl: "none" },
              "& .MuiDrawer-paper": {
                width: "40vw",
                boxSizing: "border-box",
                bgcolor: "#888",
                color: "#fff",
                pt: 8,
              },
            }}
          >
            <SidebarContent location={location} rol={rol} handleLogout={handleLogout} onClose={() => setMobileOpen(false)} />
          </Drawer>
        </>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: "15vw",
            flexShrink: 0,
            display: { xs: "none", md: "block"},
            "& .MuiDrawer-paper": {
              width: "10vw",
              pt: 3,
              boxSizing: "border-box",
              bgcolor: "#888",
              color: "#fff",
              overflow: "hidden",
            },
          }}
        >
          <SidebarContent location={location} rol={rol} handleLogout={handleLogout} />
        </Drawer>
      )}
    </>
  );
}