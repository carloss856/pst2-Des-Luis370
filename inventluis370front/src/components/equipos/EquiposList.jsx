import React, { useEffect, useState } from 'react';
import ModalAlert from '../ModalAlert';
import { useLocation } from 'react-router-dom';
import ModalConfirm from '../ModalConfirm'; // Asegúrate de tener este componente
import { getEquipos, deleteEquipo } from '../../services/equipos';

const EquiposList = () => {
  const location = useLocation();
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [equipoAEliminar, setEquipoAEliminar] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });

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

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      Cargando...
    </div>
  );

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
      <h2 className="mb-4 text-white">Equipos</h2>
      <ModalAlert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />
      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr>
              <th className="text-center">Tipo de Equipo</th>
              <th className="text-center">Marca</th>
              <th className="text-center">Modelo</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {equipos.map(equipo => (
              <tr key={equipo.id_equipo || equipo.id}>
                <td className="text-center">{equipo.tipo_equipo}</td>
                <td className="text-center">{equipo.marca}</td>
                <td className="text-center">{equipo.modelo}</td>
                <td className="text-center">
                  <a className="btn btn-sm btn-primary me-2" href={`/equipos/${equipo.id_equipo}/editar`}>Editar</a>
                  <button className="btn btn-sm btn-danger" onClick={() => { setEquipoAEliminar(equipo.id_equipo); setConfirmOpen(true); }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a className="btn btn-success mt-3" href="/equipos/crear">Nuevo Equipo</a>
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