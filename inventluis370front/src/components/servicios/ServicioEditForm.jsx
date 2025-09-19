import React, { useEffect, useState } from 'react';
import { getServicio, updateServicio } from '../../services/servicios';
import { useNavigate, useParams } from 'react-router-dom';
import { getRMAs } from '../../services/rma';
import { getUsuarios } from '../../services/usuarios';
import { getEquipos } from '../../services/equipos';

const ServicioEditForm = () => {
  const { id } = useParams();
  const rol = localStorage.getItem('rol_usuario');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [rmas, setRMAs] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [equipos, setEquipos] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      const [rmasData, usuariosData, equiposData] = await Promise.all([
        getRMAs(),
        getUsuarios(),
        getEquipos()
      ]);
      setRMAs(rmasData);
      setUsuarios(usuariosData);
      setEquipos(equiposData);

      const servicio = await getServicio(id);
      setForm({
        id_equipo: servicio.id_equipo ?? '',
        codigo_rma: servicio.codigo_rma ?? '',
        fecha_ingreso: servicio.fecha_ingreso
          ? servicio.fecha_ingreso.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
          : '',
        problema_reportado: servicio.problema_reportado ?? '',
        estado: servicio.estado ?? '',
        costo_estimado: servicio.costo_estimado ?? '',
        costo_real: servicio.costo_real ?? '',
        validado_por_gerente: servicio.validado_por_gerente ?? false
      });
    };
    fetchData();
  }, [id]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // console.log(form);
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
          <label className="form-label">Equipo</label>
          {(() => {
            const equipo = equipos.find(e => e.id_equipo === form.id_equipo);
            return equipo ? (
              <input
                name="id_equipo"
                className="form-control"
                value={`${equipo.tipo_equipo} - ${equipo.marca} - ${equipo.modelo}`}
                disabled
              />
            ) : (
              <input
                name="id_equipo"
                className="form-control"
                value=""
                disabled
              />
            );
          })()}
        </div>
        <div className="mb-3">
          <label className="form-label">Usuario</label>
          <select name="codigo_rma" className="form-select" value={form.codigo_rma} onChange={handleChange} required>
            <option value="" disabled>Seleccione un usuario</option>
            {rmas.map(rma => {
              const usuario = usuarios.find(u => u.id_persona === rma.id_persona);
              return usuario ? (
                <option key={rma.rma} value={rma.rma}>{usuario.nombre} (RMA: {rma.rma})</option>
              ) : null;
            })}
          </select>
        </div>
        {/* <div className="mb-3">
          <label className="form-label">Usuario</label>
          {rmas.length > 0 && usuarios.length > 0 && form.codigo_rma ? (() => {
            const rma = rmas.find(r => r.rma === form.codigo_rma);
            const usuario = usuarios.find(u => u.id_persona === rma?.id_persona);
            return usuario ? (
              <input
                name="codigo_rma"
                className="form-control"
                value={`${usuario.nombre}`}
                disabled
              />
            ) : (
              <input
                name="codigo_rma"
                className="form-control"
                value=""
              />
            );
          })() : (
            <input
              name="codigo_rma"
              className="form-control"
              value=""
              disabled
            />
          )}
        </div> */}
        <div className="mb-3">
          <label className="form-label">Fecha Ingreso</label>
          <input
            name="fecha_ingreso"
            type="date"
            className="form-control"
            placeholder="Código RMA"
            required
            value={form.fecha_ingreso}
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
        {(rol === 'Técnico' || rol === 'Gerente' || rol === 'Administrador') && (
          <div className="mb-3">
            <label className="form-label">Costo Estimado</label>
            <input
              name="costo_estimado"
              type="number"
              className="form-control"
              value={form.costo_estimado}
              onChange={handleChange}
              placeholder="Costo Estimado"
              disabled={!(rol === 'Gerente' || rol === 'Administrador')}
            />
          </div>
        )}
        {(rol === 'Gerente' || rol === 'Administrador') && (
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
        )}
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
              Validado
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