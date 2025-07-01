import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { getServicios, deleteServicio } from '../services/servicios'; // Asegúrate de tener este servicio
import { getEquipos } from '../services/equipos'; // Asegúrate de tener este servicio
import { useNavigate } from 'react-router-dom';

const ServiciosList = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipos, setEquipos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Consultar los equipos al montar el componente
    getEquipos()
      .then(res => setEquipos(res))
      .catch(() => setEquipos([]));
  }, []);

  useEffect(() => {
    getServicios()
      .then(res => {
        setServicios(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este servicio?')) return;
    try {
      await deleteServicio(id);
      setServicios(servicios.filter(s => (s.id_servicio || s.id) !== id));
    } catch (err) {
      alert('Error al eliminar el servicio');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Servicios</h2>
      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>Informacion Equipo</th>
            <th>Código RMA</th>
            <th>Fecha Ingreso</th>
            <th>Problema Reportado</th>
            <th>Estado</th>
            <th>Costo Estimado</th>
            <th>Costo Real</th>
            <th>Validado por Gerente</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map(servicio => (
            <tr key={servicio.id_servicio || servicio.id}>
              <td>{equipos.find(eq => eq.id_equipo === servicio.id_equipo)?.tipo_equipo} - {equipos.find(eq => eq.id_equipo === servicio.id_equipo)?.marca} - {equipos.find(eq => eq.id_equipo === servicio.id_equipo)?.modelo || 'Desconocido'}</td>
              <td>{servicio.codigo_rma}</td>
              <td>{servicio.fecha_ingreso}</td>
              <td>{servicio.problema_reportado}</td>
              <td>{servicio.estado}</td>
              <td>{servicio.costo_estimado}</td>
              <td>{servicio.costo_real}</td>
              <td>{servicio.validado_por_gerente ? 'Sí' : 'No'}</td>
              <td>
                <a href={`/servicios/${servicio.id_servicio || servicio.id}/editar`}>Editar</a>
                <button onClick={() => handleDelete(servicio.id_servicio || servicio.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href="/servicios/crear">Nuevo Servicio</a>
    </div>
  );
};

export default ServiciosList;