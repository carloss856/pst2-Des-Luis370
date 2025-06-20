import React, { useEffect, useState } from 'react';
import { getServicio, updateServicio } from '../services/servicios';
import { useNavigate, useParams } from 'react-router-dom';

const ServicioEditForm = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    id_equipo: '',
    codigo_rma: '',
    fecha_ingreso: '',
    problema_reportado: '',
    estado: '',
    costo_estimado: '',
    costo_real: '',
    validado_por_gerente: false
  });
  const rol = localStorage.getItem('rol_usuario');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getServicio(id)
      .then(res => setForm(res.data))
      .catch(() => setError('Error al cargar servicio'));
  }, [id]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await updateServicio(id, form);
      navigate('/servicios');
    } catch (err) {
      setError('Error al actualizar servicio');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Editar Servicio</h2>
      <input name="id_equipo" value={form.id_equipo} onChange={handleChange} placeholder="ID Equipo" required />
      <input name="codigo_rma" value={form.codigo_rma} onChange={handleChange} placeholder="Código RMA" required />
      <input name="fecha_ingreso" type="date" value={form.fecha_ingreso} onChange={handleChange} required />
      <input name="problema_reportado" value={form.problema_reportado} onChange={handleChange} placeholder="Problema Reportado" required />
      <input name="estado" value={form.estado} onChange={handleChange} placeholder="Estado" required />
      <input name="costo_estimado" type="number" value={form.costo_estimado} onChange={handleChange} placeholder="Costo Estimado" />
      <input name="costo_real" type="number" value={form.costo_real} onChange={handleChange} placeholder="Costo Real" />
      {(rol === 'Gerente' || rol === 'Administrador') && (
        <label>
          Validado por gerente
          <input name="validado_por_gerente" type="checkbox" checked={form.validado_por_gerente} onChange={handleChange} />
        </label>
      )}
      <button type="submit">Actualizar</button>
      <button type="button" onClick={() => navigate('/servicios')}>Volver</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

export default ServicioEditForm;