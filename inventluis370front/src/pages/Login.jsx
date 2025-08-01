import React, { useState } from 'react';
import api from '../services/api';

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
      localStorage.setItem('rol_usuario', res.data.usuario.tipo);
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
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <form onSubmit={handleSubmit} className="card p-4" style={{ maxWidth: 350, width: "100%" }}>
        <h2 className="text-center mb-4">Iniciar sesión</h2>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Correo"
            required
            autoComplete="username"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="contrasena" className="form-label">Contraseña</label>
          <input
            type="password"
            id="contrasena"
            className="form-control"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            placeholder="Contraseña"
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn btn-primary w-100 mb-2">Iniciar sesión</button>
        {error && <div className="alert alert-danger mt-2">{error}</div>}
      </form>
    </div>
  );
}