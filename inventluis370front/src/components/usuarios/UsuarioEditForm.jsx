import React, { useEffect, useState } from 'react';
import { getUsuario, updateUsuario } from '../../services/usuarios';
import { getEmpresas } from '../../services/empresas';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingView from "../LoadingView";


export default function UsuarioEditForm() {
  const { id } = useParams();
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipo: '',
    estado: 'Activo',
    contrasena: '',
    id_empresa: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmpresas().then(data => setEmpresas(data));
    getUsuario(id).then(res => {
      setForm({
        nombre: res.nombre,
        email: res.email,
        telefono: res.telefono,
        tipo: res.tipo,
        estado: res.estado,
        contrasena: '',
        id_empresa: res.id_empresa,
      });
    });
    setLoading(false);
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    // Si cambia el tipo y NO es "Empresa", resetea id_empresa
    if (name === "tipo") {
      setForm(prev => ({
        ...prev,
        tipo: value,
        id_empresa: value === "Empresa" ? prev.id_empresa : ""
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
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

  if (loading) return <LoadingView message="Cargando usuario…" />;

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <form onSubmit={handleSubmit} className="card p-4" style={{ maxWidth: "80%", width: "100%" }}>
        <h2 className="text-center mb-4">Editar Usuario</h2>
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
        {form.tipo === "Cliente" ? (
          <div className="mb-3">
            <input type="text" className='form-control disabled' placeholder='Cliente' disabled />
            <div className="mt-3">
              <label className="form-label">Empresa</label>
              <select name="id_empresa" className="form-select" value={form.id_empresa || ""} onChange={handleChange} required>
                <option value="" disabled>Seleccione una empresa</option>
                {empresas.map(empresa => (
                  <option key={empresa.id_empresa} value={empresa.id_empresa}>{empresa.nombre_empresa}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Tipo</label>
            <select name="tipo" className="form-select" value={form.tipo} onChange={handleChange} required>
              <option value="" disabled>Seleccione un tipo</option>
              <option value="Administrador">Administrador</option>
              <option value="Técnico">Técnico</option>
              <option value="Gerente">Gerente</option>
              <option value="Empresa">Empresa</option>
              <option value="Cliente">Cliente</option>
            </select>
          </div>
        )}
        {form.tipo === "Empresa" && (
          <div className="mb-3">
            <label className="form-label">Empresa</label>
            <select
              name="id_empresa"
              className="form-select"
              value={form.id_empresa || ""}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Seleccione una empresa</option>
              {empresas.map(empresa => (
                <option key={empresa.id_empresa} value={empresa.id_empresa}>
                  {empresa.nombre_empresa}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input name="contrasena" type="password" className="form-control" placeholder="Nueva contraseña (opcional)" value={form.contrasena} onChange={handleChange} />
          <small className="form-text text-muted">Dejar en blanco si no desea cambiar la contraseña</small>
        </div>
        <button type="submit" className="btn btn-primary w-100 mb-2">Actualizar</button>
        <button type="button" className="btn btn-secondary w-100" onClick={() => navigate('/usuarios')}>Volver</button>

        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
}