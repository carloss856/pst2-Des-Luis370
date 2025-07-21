import React, { useEffect, useState } from 'react';
import { getServicio, updateServicio } from '../../services/servicios';
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
      .then(res => setForm(res))
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
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <form onSubmit={handleSubmit} className="card p-4" style={{ width: 450 }}>
        <h2 className="text-center mb-4">Editar Servicio</h2>
        <div className="mb-3">
          <label className="form-label">ID Equipo</label>
          <input
            name="id_equipo"
            className="form-control"
            value={form.id_equipo}
            onChange={handleChange}
            placeholder="ID Equipo"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Código RMA</label>
          <input
            name="codigo_rma"
            className="form-control"
            value={form.codigo_rma}
            onChange={handleChange}
            placeholder="Código RMA"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Fecha Ingreso</label>
          <input
            name="fecha_ingreso"
            type="date"
            className="form-control"
            value={form.fecha_ingreso}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Problema Reportado</label>
          <input
            name="problema_reportado"
            className="form-control"
            value={form.problema_reportado}
            onChange={handleChange}
            placeholder="Problema Reportado"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Estado</label>
          <select
            name="estado"
            className="form-select"
            value={form.estado}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Seleccione un estado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Costo Estimado</label>
          <input
            name="costo_estimado"
            type="number"
            className="form-control"
            value={form.costo_estimado}
            onChange={handleChange}
            placeholder="Costo Estimado"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Costo Real</label>
          <input
            name="costo_real"
            type="number"
            className="form-control"
            value={form.costo_real}
            onChange={handleChange}
            placeholder="Costo Real"
          />
        </div>
        {(rol === 'Gerente' || rol === 'Administrador') && (
          <div className="form-check mb-3">
            <input
              name="validado_por_gerente"
              type="checkbox"
              className="form-check-input"
              checked={form.validado_por_gerente}
              onChange={handleChange}
              id="validado_por_gerente"
            />
            <label className="form-check-label" htmlFor="validado_por_gerente">
              Validado por gerente
            </label>
          </div>
        )}
        <button type="submit" className="btn btn-primary w-100 mb-2">Actualizar</button>
        <button type="button" className="btn btn-secondary w-100" onClick={() => navigate('/servicios')}>Volver</button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
};

export default ServicioEditForm;