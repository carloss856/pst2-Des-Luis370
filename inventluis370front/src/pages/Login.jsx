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
      console.log(res.data);
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
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Correo</label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Correo"
        required
        autoComplete="username"
      />
      <label htmlFor="contrasena">Contraseña</label>
      <input
        type="password"
        value={contrasena}
        onChange={e => setContrasena(e.target.value)}
        placeholder="Contraseña"
        required
        autoComplete="current-password"
      />
      <button type="submit">Iniciar sesión</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
