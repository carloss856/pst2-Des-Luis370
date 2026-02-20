import React, { useEffect, useState } from 'react';
import { getUsuario, updateUsuario } from '../../services/usuarios';
import { getEmpresas } from '../../services/empresas';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingView from '../LoadingView';
import ModalAlert from '../ModalAlert';

export default function UsuarioEditForm({ selfOnly = false }) {
  const { id } = useParams();
  const myUserId = localStorage.getItem('id_usuario');
  const targetId = selfOnly ? myUserId : id;

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
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!targetId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [empresasData, userData] = await Promise.all([
          getEmpresas(),
          getUsuario(targetId),
        ]);

        if (!mounted) return;

        setEmpresas(Array.isArray(empresasData) ? empresasData : []);
        setForm({
          nombre: userData?.nombre || '',
          email: userData?.email || '',
          telefono: userData?.telefono || '',
          tipo: userData?.tipo || '',
          estado: userData?.estado || 'Activo',
          contrasena: '',
          id_empresa: userData?.id_empresa || '',
        });
      } catch {
        if (!mounted) return;
        setError('Error al cargar usuario');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [targetId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tipo') {
      setForm((prev) => ({
        ...prev,
        tipo: value,
        id_empresa: value === 'Empresa' ? prev.id_empresa : '',
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const dataToSend = { ...form };
      if (!dataToSend.contrasena) {
        delete dataToSend.contrasena;
      }

      await updateUsuario(targetId, dataToSend);

      if (selfOnly && dataToSend.nombre) {
        localStorage.setItem('nombre_usuario', dataToSend.nombre);
      }

      if (selfOnly) {
        setSuccess('Cambio realizado');
      } else {
        navigate('/usuarios');
      }
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      const apiMessage = err?.response?.data?.message;
      if (apiErrors && typeof apiErrors === 'object') {
        const firstField = Object.keys(apiErrors)[0];
        const firstMessage = Array.isArray(apiErrors[firstField]) ? apiErrors[firstField][0] : null;
        setError(firstMessage || 'Error al actualizar usuario');
      } else {
        setError(apiMessage || 'Error al actualizar usuario');
      }
    }
  };

  if (loading) return <LoadingView message="Cargando usuario..." />;

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <ModalAlert
        type="success"
        message={success}
        onClose={() => setSuccess('')}
        autoCloseMs={10000}
        closeOnBackdropClick={true}
      />
      <form onSubmit={handleSubmit} className="card p-4" style={{ maxWidth: '680px', width: '100%' }}>
        <h2 className="text-center mb-4">{selfOnly ? 'Mi perfil' : 'Editar Usuario'}</h2>

        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input name="nombre" className="form-control" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input name="email" className="form-control" placeholder="Email" value={form.email} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Telefono</label>
          <input name="telefono" className="form-control" placeholder="Telefono" value={form.telefono} onChange={handleChange} />
        </div>

        {selfOnly ? (
          <div className="mb-3">
            <label className="form-label">Tipo</label>
            <input type="text" className="form-control" value={form.tipo} disabled />
          </div>
        ) : form.tipo === 'Cliente' ? (
          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Cliente" disabled />
            <div className="mt-3">
              <label className="form-label">Empresa</label>
              <select name="id_empresa" className="form-select" value={form.id_empresa || ''} onChange={handleChange} required>
                <option value="" disabled>Seleccione una empresa</option>
                {empresas.map((empresa) => (
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
              <option value="Tecnico">Tecnico</option>
              <option value="Gerente">Gerente</option>
              <option value="Empresa">Empresa</option>
              <option value="Cliente">Cliente</option>
            </select>
          </div>
        )}

        {!selfOnly && form.tipo === 'Empresa' && (
          <div className="mb-3">
            <label className="form-label">Empresa</label>
            <select
              name="id_empresa"
              className="form-select"
              value={form.id_empresa || ''}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Seleccione una empresa</option>
              {empresas.map((empresa) => (
                <option key={empresa.id_empresa} value={empresa.id_empresa}>
                  {empresa.nombre_empresa}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Contrasena</label>
          <input name="contrasena" type="password" className="form-control" placeholder="Nueva Contrasena (opcional)" value={form.contrasena} onChange={handleChange} />
          <small className="form-text text-muted">Dejar en blanco si no desea cambiar la Contrasena</small>
        </div>

        <button type="submit" className="btn btn-primary w-100 mb-2">Actualizar</button>
        <button type="button" className="btn btn-secondary w-100" onClick={() => navigate(selfOnly ? '/dashboard' : '/usuarios')}>Volver</button>

        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
}
