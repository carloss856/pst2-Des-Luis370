import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGarantia, updateGarantia } from '../../services/garantias';
import { getServicios } from '../../services/servicios';

export default function GarantiaEditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const rol = localStorage.getItem('rol_usuario');
  const userId = localStorage.getItem('id_usuario');
  const puedeEditar = rol === "Administrador" || rol === "Gerente";

  const [form, setForm] = useState({
    servicio: '',
    fecha_inicio: '',
    fecha_fin: '',
    observaciones: '',
    validado_por_gerente: false,
  });
  const [servicios, setServicios] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviciosData,] = await Promise.all([
          getServicios(),
        ]);
        setServicios(serviciosData);
        const data = await getGarantia(id);

        // Verifica si el usuario es propietario, admin o gerente
        if (
          !(rol === "Administrador" || rol === "Gerente" || String(data.id_usuario) === String(userId))
        ) {
          navigate('/garantias');
          return;
        }

        setForm({
          servicio: data.id_servicio || '',
          fecha_inicio: data.fecha_inicio || '',
          fecha_fin: data.fecha_fin || '',
          observaciones: data.observaciones || '',
          validado_por_gerente: !!data.validado_por_gerente,
        });
        setLoading(false);
      } catch (err) {
        // Si la garantía no existe o hay error, redirige
        navigate('/garantias');
      }
    };
    fetchData();
  }, [id, rol, userId, navigate]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await updateGarantia(id, form);
      navigate('/garantias');
    } catch {
      
    }
  };

  if (loading) return <div className="text-center mt-5">Cargando...</div>;

  return (
    <div className="container d-flex justify-content-center align-items-center h-100">
      <form onSubmit={handleSubmit} className="card p-4" style={{ maxWidth: 400, width: "100%" }}>
        <h2 className="text-center mb-4">Editar Garantía</h2>
        {/* Servicio */}
        <div className="mb-3">
          <label className="form-label">Servicio</label>
          <select
            name="servicio"
            className="form-select"
            value={form.servicio}
            onChange={handleChange}
            disabled={!puedeEditar}
            required
          >
            <option value="">Seleccione un servicio</option>
            {servicios.map(s => (
              <option key={s.id_servicio} value={s.id_servicio}>
                {s.codigo_rma + " - " + s.problema_reportado}
              </option>
            ))}
          </select>
        </div>
        {/* Fecha de inicio */}
        <div className="mb-3">
          <label className="form-label">Fecha de inicio</label>
          <input
            type="date"
            name="fecha_inicio"
            className="form-control"
            value={form.fecha_inicio}
            disabled
          />
        </div>
        {/* Fecha de fin */}
        <div className="mb-3">
          <label className="form-label">Fecha de fin</label>
          <input
            type="date"
            name="fecha_fin"
            className="form-control"
            value={form.fecha_fin}
            onChange={handleChange}
            disabled={!puedeEditar}
            required
          />
        </div>
        {/* Observaciones */}
        <div className="mb-3">
          <label className="form-label">Observaciones</label>
          <textarea
            name="observaciones"
            className="form-control"
            value={form.observaciones}
            onChange={handleChange}
          />
        </div>
        {/* Validado por gerente */}
        <div className="form-check mb-3">
          <input
            type="checkbox"
            name="validado_por_gerente"
            className="form-check-input"
            checked={form.validado_por_gerente}
            onChange={handleChange}
            id="validado_por_gerente"
          />
          <label className="form-check-label" htmlFor="validado_por_gerente">
            Validado por gerente
          </label>
        </div>
        <button type="submit" className="btn btn-primary w-100">Actualizar Garantía</button>
        <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => navigate('/garantias')}>Volver</button>
      </form>
    </div>
  );
}