import React, { useState, useEffect } from 'react';
import { createServicio } from '../../services/servicios';
import { getEquipos } from '../../services/equipos';
import { useNavigate } from 'react-router-dom';
import { getRMAs } from '../../services/rma';
import { getUsuarios } from '../../services/usuarios';

const ServicioForm = () => {
  const [form, setForm] = useState({
    id_equipo: '',
    codigo_rma: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    problema_reportado: '',
    estado: 'Pendiente',
    costo_estimado: '',
    costo_real: 0,
    validado_por_gerente: false
  });
  const [rmas, setRMAs] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getRMAs().then(setRMAs);
    getUsuarios().then(setUsuarios);
    getEquipos().then(setEquipos);
  }, []);
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
            <option value="" disabled>Seleccione un equipo</option>
            {equipos.map(equipo => (
              <option key={equipo.id_equipo} value={equipo.id_equipo}>
                {equipo.tipo_equipo} - {equipo.marca} - {equipo.modelo}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Seleccione un Usuario</label>
          <select
            name="codigo_rma"
            className="form-select"
            value={form.codigo_rma}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Seleccione una opción</option>
            {rmas.map(rma => {
              const users = usuarios.find(u => u.id_persona === rma.id_persona);
              return (
                <option key={rma.rma} value={rma.rma}>
                  { users && ( users.nombre) }
                </option>
              );
            })}
          </select>
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
            disabled
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
          <input type="text" name="estado" className="form-control" value={form.estado} onChange={handleChange} disabled required />
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
        <button className="btn btn-secondary" onClick={() => navigate('/servicios')}>Volver</button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}

      </form>
    </div>
  );
};

export default ServicioForm;