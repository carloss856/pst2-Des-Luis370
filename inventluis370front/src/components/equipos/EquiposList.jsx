import React, { useEffect, useState } from 'react';
import ModalAlert from '../ModalAlert';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ModalConfirm from '../ModalConfirm'; // Asegúrate de tener este componente
import { getEquipos, deleteEquipo } from '../../services/equipos';
import { canModule, getRbacCache } from '../../utils/rbac';
import LoadingView from "../LoadingView";

const EquiposList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [equipoAEliminar, setEquipoAEliminar] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const rbac = getRbacCache();
  const canCreate = canModule(rbac, 'equipos', 'store');
  const canEdit = canModule(rbac, 'equipos', 'update');
  const canDelete = canModule(rbac, 'equipos', 'destroy');

  useEffect(() => {
    getEquipos()
      .then(res => {
        setEquipos(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (location.state && location.state.showAlert) {
      setAlert({
        type: "success",
        message: location.state.alertMessage || "Equipo creado correctamente"
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    try {
      await deleteEquipo(`${equipoAEliminar}`);
      setEquipos(equipos.filter(e => e.id_equipo !== equipoAEliminar));
      setAlert({ type: "success", message: "Equipo eliminado correctamente" });
    } catch (err) {
      setAlert({ type: "danger", message: "Error al eliminar el equipo" });
    }
    setEquipoAEliminar(null);
  };

  if (loading) return <LoadingView message="Cargando equipos…" />;

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center h-100">
      <h2 className="mb-4 text-white">Equipos</h2>
      <ModalAlert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />
      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr className="text-center">
              <th>Tipo de Equipo</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Usuario Asignado</th>
              {(canEdit || canDelete) && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {equipos.map(equipo => (
              <tr key={equipo.id_equipo} className="text-center">
                <td>{equipo.tipo_equipo}</td>
                <td>{equipo.marca}</td>
                <td>{equipo.modelo}</td>
                <td>{equipo.propiedad?.usuario?.nombre || "Sin asignar"}</td>
                {(canEdit || canDelete) && (
                  <td>
                    {canEdit && (
                      <button className="btn btn-sm btn-primary me-2 mb-2" onClick={() => navigate(`/equipos/${equipo.id_equipo}/editar`)}>
                        Editar
                      </button>
                    )}
                    {canDelete && (
                      <button className="btn btn-sm btn-danger mb-2" onClick={() => { setEquipoAEliminar(equipo.id_equipo); setConfirmOpen(true); }}>
                        Eliminar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canCreate && <Link className="btn btn-success mt-3" to="/equipos/crear">Nuevo Equipo</Link>}
      <ModalConfirm
        show={confirmOpen}
        title="Eliminar equipo"
        onClose={() => setConfirmOpen(false)}
      >
        <p>¿Seguro que deseas eliminar este equipo?</p>
        <div className="d-flex justify-content-end">
          <button className="btn btn-secondary me-2" onClick={() => setConfirmOpen(false)}>Cancelar</button>
          <button className="btn btn-danger" onClick={handleConfirmDelete}>Eliminar</button>
        </div>
      </ModalConfirm>
    </div>
  );
};

export default EquiposList;