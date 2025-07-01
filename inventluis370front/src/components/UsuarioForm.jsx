import React, { useState } from 'react';
import { createUsuario } from '../services/usuarios';
import { useNavigate } from 'react-router-dom';

export default function UsuarioForm() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipo: '',
    contrasena: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await createUsuario(form);
      navigate('/usuarios');
    } catch (err) {
        if (err.response && err.response.data && err.response.data.errors) {
            setError(JSON.stringify(err.response.data.errors, null, 2));
        } else {
            setError('Error al crear usuario');
        }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        <h2>Crear Usuario</h2>
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
        <label>Tipo:</label>
        <select name="tipo" value={form.tipo} onChange={handleChange} required>
            <option value="" disabled>Seleccione un tipo</option>
            <option value="Administrador">Administrador</option>
            <option value="Técnico">Técnico</option>
            <option value="Gerente">Gerente</option>
            <option value="Cliente">Cliente</option>
            <option value="Empresa">Empresa</option>
        </select>
        <input name="contrasena" type="password" placeholder="Contraseña" value={form.contrasena} onChange={handleChange} required />
        <button type="submit">Guardar</button>
        {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}