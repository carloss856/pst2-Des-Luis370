import React, { useState } from 'react';
import api from '../services/api';
import logo from "../assets/Logo_Luis370.png";
import FloatingInput from "../components/FloatingInput";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { email, contrasena });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('id_usuario', res.data.usuario.id_persona);
      localStorage.setItem('nombre_usuario', res.data.usuario.nombre);
      const rol = res?.data?.usuario?.tipo ?? res?.data?.usuario?.rol ?? '';
      localStorage.setItem('rol_usuario', rol);
      onLogin && onLogin();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Credenciales incorrectas');
      }
    }
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center h-100">
      <img className='mb-4' src={logo} alt="Logo" style={{ maxWidth: 420, marginBottom: 20, borderRadius: 20, width: '100%' }} />
      <form onSubmit={handleSubmit} className="card p-4" style={{ maxWidth: 420, width: "100%" }}>
        <h2 className="text-center mb-4">Iniciar sesión</h2>
        <FloatingInput
          id="email"
          label="Correo"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="username"
        />
        <FloatingInput
          id="contrasena"
          label="Contraseña"
          type="password"
          value={contrasena}
          onChange={e => setContrasena(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button type="submit" className="btn btn-primary w-100 mb-2">Iniciar sesión</button>
        {error && <div className="alert alert-danger mt-2">{error}</div>}
        <button type="button" className="btn btn-link" onClick={() => (window.location.href = "/forgot-password")}>
          ¿Olvidaste tu contraseña?
        </button>
      </form>
    </div>
  );
}