import React, { useEffect, useState } from 'react';
import { getUsuario, updateUsuario } from '../services/usuarios';
import { useNavigate, useParams } from 'react-router-dom';

export default function UsuarioEditForm() {
  const { id } = useParams();
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipo: '',
    estado: 'Activo',
    contrasena: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getUsuario(id).then(res => {
      setForm({
        nombre: res.nombre,
        email: res.email,
        telefono: res.telefono,
        tipo: res.tipo,
        estado: res.estado,
        contrasena: '',
      });
    });
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const dataToSend = { ...form };
      if (!dataToSend.contrasena) {
        delete dataToSend.contrasena;
      }
      await updateUsuario(id, dataToSend);
      navigate('/usuarios');
    } catch (err) {
      setError('Error al actualizar usuario');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Editar Usuario</h2>
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
      <label>Contraseña:</label>
      <p>Dejar en blanco si no desea cambiar la contraseña</p>
      <input name="contrasena" type="password" placeholder="Nueva contraseña (opcional)" value={form.contrasena} onChange={handleChange} />
      <button type="submit">Actualizar</button>
      <button type="button" onClick={() => navigate('/usuarios')}>Volver</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}