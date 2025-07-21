import React, { useState } from 'react';
import { createUsuario } from '../../services/usuarios';
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
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <form onSubmit={handleSubmit} className="card p-4" style={{ maxWidth: 400, width: "100%" }}>
        <h2 className="text-center mb-4">Crear Usuario</h2>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input name="nombre" className="form-control" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input name="email" className="form-control" placeholder="Email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Teléfono</label>
          <input name="telefono" className="form-control" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Tipo</label>
          <select name="tipo" className="form-select" value={form.tipo} onChange={handleChange} required>
            <option value="" disabled>Seleccione un tipo</option>
            <option value="Administrador">Administrador</option>
            <option value="Técnico">Técnico</option>
            <option value="Gerente">Gerente</option>
            <option value="Cliente">Cliente</option>
            <option value="Empresa">Empresa</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input name="contrasena" type="password" className="form-control" placeholder="Contraseña" value={form.contrasena} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-success w-100 mb-2">Guardar</button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        <button type="button" className="btn btn-secondary w-100" onClick={() => navigate('/usuarios')}>Volver</button>
      </form>
    </div>
  );
}