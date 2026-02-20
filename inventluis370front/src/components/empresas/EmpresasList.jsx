import React, { useEffect, useState } from 'react';
import ModalConfirm from "../ModalConfirm";
import ModalAlert from "../ModalAlert";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getEmpresas, deleteEmpresa } from '../../services/empresas';
import { canModule, getRbacCache } from '../../utils/rbac';
import LoadingView from "../LoadingView";

export default function EmpresasList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [empresaAEliminar, setEmpresaAEliminar] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const rbac = getRbacCache();
  const canCreate = canModule(rbac, 'empresas', 'store');
  const canEdit = canModule(rbac, 'empresas', 'update');
  const canDelete = canModule(rbac, 'empresas', 'destroy');

  useEffect(() => {
    getEmpresas()
      .then(res => {
        setEmpresas(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (location.state && location.state.showAlert) {
      setAlert({
        type: "success",
        message: location.state.alertMessage || "Empresa creada correctamente"
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    try {
      await deleteEmpresa(`${empresaAEliminar}`);
      setEmpresas(empresas.filter(e => e.id_empresa !== empresaAEliminar));
      setAlert({ type: "success", message: "Empresa eliminada correctamente" });
    } catch (err) {
      setAlert({ type: "danger", message: "Error al eliminar la empresa" });
    }
    setEmpresaAEliminar(null);
  };

  if (loading) return <LoadingView message="Cargando empresas…" />;

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center h-100">
      <h2 className="mb-4 text-white">Empresas</h2>
      <ModalAlert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />
      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr className="text-center">
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Email</th>
              {(canEdit || canDelete) && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {empresas.map(empresa => (
              <tr key={empresa.id_empresa} className="text-center">
                <td>{empresa.nombre_empresa}</td>
                <td>{empresa.direccion}</td>
                <td>{empresa.telefono}</td>
                <td>{empresa.email}</td>
                {(canEdit || canDelete) && (
                  <td>
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                      {canEdit && (
                        <button className="btn btn-sm btn-primary" onClick={() => navigate(`/empresas/${empresa.id_empresa}/editar`)}>
                          Editar
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => { setEmpresaAEliminar(empresa.id_empresa); setConfirmOpen(true); }}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canCreate && <Link className="btn btn-success mt-3" to="/empresas/crear">Crear empresa</Link>}
      <ModalConfirm
        show={confirmOpen}
        title="Eliminar empresa"
        onClose={() => setConfirmOpen(false)}
      >
        <p>¿Seguro que deseas eliminar esta empresa?</p>
        <div className="d-flex justify-content-end">
          <button className="btn btn-secondary me-2" onClick={() => setConfirmOpen(false)}>Cancelar</button>
          <button className="btn btn-danger" onClick={handleConfirmDelete}>Eliminar</button>
        </div>
      </ModalConfirm>
    </div>
  );
}
