import React, { useEffect, useState } from 'react';
import { getServicios, deleteServicio } from '../../services/servicios';
import { getEquipos } from '../../services/equipos';
import { Link, useNavigate } from 'react-router-dom';
import ModalConfirm from "../ModalConfirm";
import ModalAlert from "../ModalAlert";
import { useLocation } from 'react-router-dom';
import { getRMAs } from '../../services/rma';
import { canModule, canRoute, getRbacCache } from '../../utils/rbac';
import LoadingView from "../LoadingView";

const ServiciosList = () => {
  const location = useLocation();
  const [servicios, setServicios] = useState([]);
  const [rmas, setRMAs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipos, setEquipos] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [servicioAEliminar, setServicioAEliminar] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  const rbac = getRbacCache();
  const canCreate = canModule(rbac, 'servicios', 'store');
  const canEdit = canModule(rbac, 'servicios', 'update');
  const canDelete = canModule(rbac, 'servicios', 'destroy');
  const canParts = canRoute(rbac, 'servicios.partes.index');

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

  if (loading) return <LoadingView message="Cargando servicios…" />;


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
              {(canParts || canEdit || canDelete) && <th>Acciones</th>}
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
                  {(canParts || canEdit || canDelete) && (
                    <td>
                      {canParts && (
                        <button
                          className="btn btn-sm btn-outline-secondary me-2 mb-2 disabled"
                          onClick={() => navigate(`/servicios/${servicio.id_servicio}/partes`)}
                        >
                          Partes
                        </button>
                      )}
                      {canEdit && (
                        <button
                          className="btn btn-sm btn-primary me-2 mb-2"
                          onClick={() => navigate(`/servicios/${servicio.id_servicio}/editar`)}
                        >
                          Editar
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn btn-sm btn-danger mb-2"
                          onClick={() => {
                            setServicioAEliminar(servicio.id_servicio);
                            setConfirmOpen(true);
                          }}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {canCreate && <Link className="btn btn-success mt-3" to="/servicios/crear">Nuevo Servicio</Link>}
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