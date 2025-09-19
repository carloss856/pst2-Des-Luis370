import React, { useEffect, useState } from 'react';
import { getServicios, deleteServicio } from '../../services/servicios';
import { getEquipos } from '../../services/equipos';
import { useNavigate } from 'react-router-dom';
import ModalConfirm from "../ModalConfirm";
import ModalAlert from "../ModalAlert";
import { useLocation } from 'react-router-dom';
import { getRMAs } from '../../services/rma';

const ServiciosList = () => {
  const location = useLocation();
  const [servicios, setServicios] = useState([]);
  const [rmas, setRMAs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipos, setEquipos] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [servicioAEliminar, setServicioAEliminar] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const userRol = localStorage.getItem("rol_usuario");
  const navigate = useNavigate();

  useEffect(() => {
    getEquipos()
      .then(res => setEquipos(res))
      .catch(() => setEquipos([]));
    getRMAs()
      .then(res => setRMAs(res))
      .catch(() => setRMAs([]));
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
    <div className="d-flex justify-content-center align-items-center h-100">
      Cargando...
    </div>
  );


  return (
    <div className="container d-flex flex-column justify-content-center align-items-center h-100 text-">
      <h2 className="mb-4 text-white">Servicios</h2>
      <ModalAlert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />
      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle small">
          <thead className="table-dark">
            <tr className="text-center">
              <th>Información Equipo</th>
              <th>Código RMA</th>
              <th>Fecha Ingreso</th>
              <th>Problema Reportado</th>
              <th>Estado</th>
              <th>Costo</th>
              <th>Validado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((servicio) => {
              const equipoTipo = equipos.find(eq => eq.id_equipo === servicio.id_equipo)?.tipo_equipo;
              const equipoMarca = equipos.find(eq => eq.id_equipo === servicio.id_equipo)?.marca;
              const equipoModelo = equipos.find(eq => eq.id_equipo === servicio.id_equipo)?.modelo || 'Desconocido';

              return (
                <tr key={servicio.id_servicio} className="text-center">
                  <td>{equipoTipo + " - " + equipoMarca + " - " + equipoModelo}</td>
                  <td>{servicio.codigo_rma}</td>
                  <td>{servicio.fecha_ingreso}</td>
                  <td>{servicio.problema_reportado}</td>
                  <td>{servicio.estado}</td>
                  <td>{servicio.costo_real}</td>
                  <td>{servicio.validado_por_gerente ? 'Sí' : 'No'}</td>
                  <td className="bg-white text-center" style={{ minWidth: "120px" }}>
                    <div className="d-flex flex-row justify-content-center align-items-center gap-2">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate(`/servicios/${servicio.id_servicio}/editar`)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          setServicioAEliminar(servicio.id_servicio);
                          setConfirmOpen(true);
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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