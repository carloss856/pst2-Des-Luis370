import React, { useEffect, useState } from 'react';
import { getServicios, deleteServicio } from '../../services/servicios';
import { getEquipos } from '../../services/equipos';
import { useNavigate } from 'react-router-dom';
import ModalConfirm from "../ModalConfirm";
import ModalAlert from "../ModalAlert";
import { useLocation } from 'react-router-dom';

const ServiciosList = () => {
  const location = useLocation();
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipos, setEquipos] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [servicioAEliminar, setServicioAEliminar] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });
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

  useEffect(() => {
    if (location.state && location.state.showAlert) {
      setAlert({
        type: "success",
        message: location.state.alertMessage || "Servicio creado correctamente"
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    try {
      await deleteServicio(`${servicioAEliminar}`);
      setServicios(servicios.filter(s => s.id_servicio !== servicioAEliminar));
      setAlert({ type: "success", message: "Servicio eliminado correctamente" });
    } catch (err) {
      setAlert({ type: "danger", message: "Error al eliminar el servicio" });
    }
    setServicioAEliminar(null);
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      Cargando...
    </div>
  );

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
      <h2 className="mb-4 text-white">Servicios</h2>
      <ModalAlert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />
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
                  <button className="btn btn-sm btn-danger" onClick={() => { setServicioAEliminar(servicio.id_servicio); setConfirmOpen(true); }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a className="btn btn-success mt-3" href="/servicios/crear">Nuevo Servicio</a>
      <ModalConfirm
        show={confirmOpen}
        title="Eliminar servicio"
        onClose={() => setConfirmOpen(false)}
      >
        <p>¿Seguro que deseas eliminar este servicio?</p>
        <div className="d-flex justify-content-end">
          <button className="btn btn-secondary me-2" onClick={() => setConfirmOpen(false)}>Cancelar</button>
          <button className="btn btn-danger" onClick={handleConfirmDelete}>Eliminar</button>
        </div>
      </ModalConfirm>
    </div>
  );
};

export default ServiciosList;