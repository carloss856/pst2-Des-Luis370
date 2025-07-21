import React, { useState, useEffect } from 'react';
import { createServicio } from '../../services/servicios';
import { getEquipos } from '../../services/equipos';
import { useNavigate } from 'react-router-dom';

const ServicioForm = () => {
  const [form, setForm] = useState({
    id_equipo: '',
    codigo_rma: '',
    fecha_ingreso: '',
    problema_reportado: '',
    estado: '',
    costo_estimado: '',
    costo_real: 0,
    validado_por_gerente: false
  });
  const [equipos, setEquipos] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getEquipos()
      .then(res => setEquipos(res))
      .catch(() => setEquipos([]));
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await createServicio(form);
      navigate('/servicios');
    } catch (err) {
      setError('Error al crear servicio');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <form onSubmit={handleSubmit} className="card p-4" style={{ width: 450 }}>
        <h2 className="text-center mb-4">Nuevo Servicio</h2>
        <div className="mb-3">
          <label className="form-label">Equipo</label>
          <select
            name="id_equipo"
            className="form-select"
            value={form.id_equipo}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un equipo</option>
            {equipos.map(equipo => (
              <option key={equipo.id_equipo} value={equipo.id_equipo}>
                {equipo.tipo_equipo} - {equipo.marca} - {equipo.modelo}
              </option>
            ))}
          </select>
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
            <option value="" disabled>Seleccione estado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En proceso">En proceso</option>
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
        <button type="submit" className="btn btn-success mb-2">Guardar</button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        <button className="btn btn-secondary" onClick={() => navigate('/servicios')}>Volver</button>

      </form>
    </div>
  );
};

export default ServicioForm;