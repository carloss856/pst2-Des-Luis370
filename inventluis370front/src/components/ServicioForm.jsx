import React, { useState, useEffect } from 'react';
import { createServicio } from '../services/servicios';
import { getEquipos } from '../services/equipos'; // Asegúrate de tener este servicio
import { useNavigate } from 'react-router-dom';

const ServicioForm = () => {
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
  const [equipos, setEquipos] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Consultar los equipos al montar el componente
    getEquipos()
      .then(res => setEquipos(res.data))
      .catch(() => setEquipos([]));
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      console.log('Formulario enviado:', form);
      await createServicio(form);
      navigate('/servicios');
    } catch (err) {
      setError('Error al crear servicio');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nuevo Servicio</h2>
      <select
        name="id_equipo"
        value={form.id_equipo}
        onChange={handleChange}
        required
      >
        <option value="">Seleccione un equipo</option>
        {equipos.map(equipo => (
          <option key={equipo.id_equipo || equipo.id} value={equipo.id_equipo || equipo.id}>
            {equipo.tipo_equipo} - {equipo.marca} - {equipo.modelo}
          </option>
        ))}
      </select>
      <input name="codigo_rma" value={form.codigo_rma} onChange={handleChange} placeholder="Código RMA" required />
      <input name="fecha_ingreso" type="date" value={form.fecha_ingreso} onChange={handleChange} required />
      <input name="problema_reportado" value={form.problema_reportado} onChange={handleChange} placeholder="Problema Reportado" required />
      <select
        name="estado"
        value={form.estado}
        onChange={handleChange}
        required
      >
        <option value="" disabled>Seleccione estado</option>
        <option value="Pendiente">Pendiente</option>
        <option value="En proceso">En proceso</option>
        <option value="Finalizado">Finalizado</option>
      </select>
      <input name="costo_estimado" type="number" value={form.costo_estimado} onChange={handleChange} placeholder="Costo Estimado" />
      <input name="costo_real" type="number" value={form.costo_real} onChange={handleChange} placeholder="Costo Real" />
      <button type="submit">Guardar</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

export default ServicioForm;