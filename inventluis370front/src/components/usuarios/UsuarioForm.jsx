import React, { useState, useEffect } from 'react';
import { createUsuario } from '../../services/usuarios';
import { useNavigate } from 'react-router-dom';
import { getEmpresas } from '../../services/empresas';

export default function UsuarioForm() {
  const [formUsuario, setFormUsuario] = useState({
    'nombre': '',
    'email': '',
    'telefono': '',
    'tipo': '',
    'contrasena': '',
    'id_empresa': null,
  });
  const [Empresas, setEmpresas] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getEmpresas().then(data => setEmpresas(data));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    // Si cambia el tipo y NO es "Empresa", resetea id_empresa
    if (name === "tipo") {
      setFormUsuario(prev => ({
        ...prev,
        tipo: value,
        id_empresa: value === "Empresa" && value === "Cliente" ? prev.id_empresa : ""
      }));
    } else {
      setFormUsuario(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await createUsuario(formUsuario);
      setLoading(false);
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
          <input type='text' name="nombre" className="form-control" placeholder="Nombre" value={formUsuario.nombre} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type='email' name="email" className="form-control" placeholder="Email" value={formUsuario.email} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Teléfono</label>
          <input type='tel' name="telefono" className="form-control" placeholder="Teléfono" value={formUsuario.telefono} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Tipo</label>
          <select name="tipo" className="form-select" value={formUsuario.tipo} onChange={handleChange} required>
            <option value="" disabled>Seleccione un tipo</option>
            <option value="Administrador">Administrador</option>
            <option value="Técnico">Técnico</option>
            <option value="Gerente">Gerente</option>
            <option value="Cliente">Cliente</option>
            <option value="Empresa">Empresa</option>
          </select>
        </div>
        {formUsuario.tipo === "Empresa" || formUsuario.tipo === "Cliente" ? (
          <div className="mb-3">
            <label className="form-label">Empresa</label>
          <select name="id_empresa" className="form-select" value={formUsuario.id_empresa || ""} onChange={handleChange} required>
            <option value="" disabled>Seleccione una empresa</option>
            {Empresas.map(empresa => (
              <option key={empresa.id_empresa} value={empresa.id_empresa}>{empresa.nombre_empresa}</option>
            ))}
          </select>
          </div>
        ) : null}
        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input name="contrasena" type="password" className="form-control" placeholder="Contraseña" value={formUsuario.contrasena} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-success w-100 mb-2" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" className="btn btn-secondary w-100" onClick={() => navigate('/usuarios')}>Volver</button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
}