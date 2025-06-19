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
    contrasena: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getUsuario(id).then(res => {
      setForm({
        nombre: res.data.nombre,
        email: res.data.email,
        telefono: res.data.telefono,
        tipo: res.data.tipo,
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
      await updateUsuario(id, form);
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
      <input name="tipo" placeholder="Tipo" value={form.tipo} onChange={handleChange} required />
      <input name="contrasena" type="password" placeholder="Nueva contraseña (opcional)" value={form.contrasena} onChange={handleChange} />
      <button type="submit">Actualizar</button>
      <button type="button" onClick={() => navigate('/usuarios')}>Volver</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}