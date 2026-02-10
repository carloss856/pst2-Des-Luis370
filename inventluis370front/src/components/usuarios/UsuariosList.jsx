import React, { useEffect, useState } from 'react';
import { getUsuarios, deleteUsuario } from '../../services/usuarios';
import ModalAlert from "../ModalAlert";
import { Link, useLocation } from 'react-router-dom';
import ModalConfirm from "../ModalConfirm";
import { canModule, getRbacCache } from '../../utils/rbac';
import LoadingView from "../LoadingView";

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const location = useLocation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  const rbac = getRbacCache();
  const canCreate = canModule(rbac, 'usuarios', 'store');
  const canEdit = canModule(rbac, 'usuarios', 'update');
  const canDelete = canModule(rbac, 'usuarios', 'destroy');

  useEffect(() => {
    getUsuarios()
      .then(res => {
        setUsuarios(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (location.state && location.state.showAlert) {
      setAlert({
        type: "success",
        message: location.state.alertMessage || "Usuario creado correctamente"
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    try {
      await deleteUsuario(`${usuarioAEliminar}`);
      setUsuarios(usuarios.filter(u => u.id_persona !== usuarioAEliminar));
      setAlert({ type: "success", message: "Usuario eliminado correctamente" });
    } catch (err) {
      setAlert({ type: "danger", message: "Error al eliminar el usuario" });
    }
    setUsuarioAEliminar(null);
  };

  if (loading) return <LoadingView message="Cargando usuarios…" />;

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center h-100">
      <h2 className="mb-4 text-white">Usuarios</h2>
      <ModalAlert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />
      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr className="text-center">
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Tipo</th>
              {(canEdit || canDelete) && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id_persona} className="text-center">
                <td>{usuario.nombre}</td>
                <td>{usuario.email}</td>
                <td>{usuario.telefono}</td>
                <td>{usuario.tipo}</td>
                {(canEdit || canDelete) && (
                  <td>
                    {canEdit && (
                      <Link className="btn btn-sm btn-primary me-2" to={`/usuarios/${usuario.id_persona}/editar`}>Editar</Link>
                    )}
                    {canDelete && (
                      <button className="btn btn-sm btn-danger" onClick={() => { setUsuarioAEliminar(usuario.id_persona); setConfirmOpen(true); }}>Eliminar</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canCreate && <Link className="btn btn-success mt-3" to="/usuarios/crear">Crear usuario</Link>}
      <ModalConfirm
        show={confirmOpen}
        title="Eliminar usuario"
        onClose={() => setConfirmOpen(false)}
      >
        <p>¿Seguro que deseas eliminar este usuario?</p>
        <div className="d-flex justify-content-end">
          <button className="btn btn-secondary me-2" onClick={() => setConfirmOpen(false)}>Cancelar</button>
          <button className="btn btn-danger" onClick={handleConfirmDelete}>Eliminar</button>
        </div>
      </ModalConfirm>
    </div>
  );
}