import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import EmpresasList from './components/EmpresasList';
import EmpresaForm from './components/EmpresaForm';
import EmpresaEditForm from './components/EmpresaEditForm';
import UsuariosList from './components/UsuariosList';
import UsuarioForm from './components/UsuarioForm';
import UsuarioEditForm from './components/UsuarioEditForm';
import EquiposList from './components/EquiposList';
import EquipoForm from './components/EquipoForm';
import EquipoEditForm from './components/EquipoEditForm';
import ServiciosList from './components/ServiciosList';
import ServicioForm from './components/ServicioForm';
import ServicioEditForm from './components/ServicioEditForm';

// Componentes vacíos para los demás módulos
const Dashboard = () => <h2>Dashboard</h2>;
const Repuestos = () => <h2>Repuestos</h2>;
const Inventario = () => <h2>Inventario</h2>;
const Solicitudes = () => <h2>Solicitudes de Repuestos</h2>;
const Notificaciones = () => <h2>Notificaciones</h2>;
const Reportes = () => <h2>Reportes</h2>;

function PrivateRoute({ children }) {
  const isLogged = !!localStorage.getItem('token');
  return isLogged ? children : <Navigate to="/login" />;
}

function Navbar() {
  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link> |{" "}
      <Link to="/empresas">Empresas</Link> |{" "}
      <Link to="/usuarios">Usuarios</Link> |{" "}
      <Link to="/equipos">Equipos</Link> |{" "}
      <Link to="/servicios">Servicios</Link> |{" "}
      <Link to="/repuestos">Repuestos</Link> |{" "}
      <Link to="/inventario">Inventario</Link> |{" "}
      <Link to="/solicitudes">Solicitudes</Link> |{" "}
      <Link to="/notificaciones">Notificaciones</Link> |{" "}
      <Link to="/reportes">Reportes</Link> |{" "}
      <button onClick={() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }}>
        Cerrar sesión
      </button>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => window.location.href = '/dashboard'} />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Navbar />
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/empresas"
          element={
            <PrivateRoute>
              <Navbar />
              <EmpresasList />
            </PrivateRoute>
          }
        />
        <Route
          path="/empresas/crear"
          element={
            <PrivateRoute>
              <Navbar />
              <EmpresaForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/empresas/:id/editar"
          element={
            <PrivateRoute>
              <Navbar />
              <EmpresaEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <Navbar />
              <UsuariosList />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios/crear"
          element={
            <PrivateRoute>
              <Navbar />
              <UsuarioForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios/:id/editar"
          element={
            <PrivateRoute>
              <Navbar />
              <UsuarioEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/equipos"
          element={
            <PrivateRoute>
              <Navbar />
              <EquiposList />
            </PrivateRoute>
          }
        />
        <Route
          path="/equipos/crear"
          element={
            <PrivateRoute>
              <Navbar />
              <EquipoForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/equipos/:id/editar"
          element={
            <PrivateRoute>
              <Navbar />
              <EquipoEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/servicios"
          element={
            <PrivateRoute>
              <Navbar />
              <ServiciosList />
            </PrivateRoute>
          }
        />
        <Route
          path="/servicios/crear"
          element={
            <PrivateRoute>
              <Navbar />
              <ServicioForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/servicios/:id/editar"
          element={
            <PrivateRoute>
              <Navbar />
              <ServicioEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/repuestos"
          element={
            <PrivateRoute>
              <Navbar />
              <Repuestos />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario"
          element={
            <PrivateRoute>
              <Navbar />
              <Inventario />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitudes"
          element={
            <PrivateRoute>
              <Navbar />
              <Solicitudes />
            </PrivateRoute>
          }
        />
        <Route
          path="/notificaciones"
          element={
            <PrivateRoute>
              <Navbar />
              <Notificaciones />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <PrivateRoute>
              <Navbar />
              <Reportes />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
