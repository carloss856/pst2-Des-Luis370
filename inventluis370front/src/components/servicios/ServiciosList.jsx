import React, { useEffect, useState } from 'react';
import { getServicios, deleteServicio } from '../../services/servicios';
import { getEquipos } from '../../services/equipos';
import { useNavigate } from 'react-router-dom';

const ServiciosList = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipos, setEquipos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
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
      setServicios(servicios.filter(s => s.id_servicio !== id));
    } catch (err) {
      alert('Error al eliminar el servicio');
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      Cargando...
    </div>
  );

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
      <h2 className="mb-4">Servicios</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr className="text-center">
              <th className='text-nowrap'>Información Equipo</th>
              <th>Código RMA</th>
              <th className='text-nowrap'>Fecha Ingreso</th>
              <th className='text-nowrap'>Problema Reportado</th>
              <th>Estado</th>
              <th className='text-nowrap'>Costo Estimado</th>
              <th>Costo Real</th>
              <th className='text-nowrap'>Validado por Gerente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map(servicio => (
              <tr key={servicio.id_servicio}>
                <td className="text-nowrap text-center">
                  {equipos.find(eq => eq.id_equipo === servicio.id_equipo)?.tipo_equipo} -
                  {equipos.find(eq => eq.id_equipo === servicio.id_equipo)?.marca} -
                  {equipos.find(eq => eq.id_equipo === servicio.id_equipo)?.modelo || 'Desconocido'}
                </td>
                <td className='text-center'>{servicio.codigo_rma}</td>
                <td className='text-center'>{servicio.fecha_ingreso}</td>
                <td className='text-center'>{servicio.problema_reportado}</td>
                <td className='text-center'>{servicio.estado}</td>
                <td className='text-center'>{servicio.costo_estimado}</td>
                <td className='text-center'>{servicio.costo_real}</td>
                <td className='text-center'>{servicio.validado_por_gerente ? 'Sí' : 'No'}</td>
                <td className="d-flex justify-content-between">
                  <button className="btn btn-sm btn-primary me-2" onClick={() => navigate(`/servicios/${servicio.id_servicio}/editar`)}>Editar</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(servicio.id_servicio)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a className="btn btn-success mt-3" href="/servicios/crear">Nuevo Servicio</a>
    </div>
  );
};

export default ServiciosList;