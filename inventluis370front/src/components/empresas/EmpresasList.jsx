import React, { useEffect, useState } from 'react';
import ModalConfirm from "../ModalConfirm";
import ModalAlert from "../ModalAlert";
import { useLocation } from 'react-router-dom';
import api from '../../services/api';

export default function EmpresasList() {
  const location = useLocation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [empresaAEliminar, setEmpresaAEliminar] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    api.get('/empresas')
      .then(res => {
        setEmpresas(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  React.useEffect(() => {
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
      await api.delete(`/empresas/${empresaAEliminar}`);
      setEmpresas(empresas.filter(e => e.id_empresa !== empresaAEliminar));
      setAlert({ type: "success", message: "Empresa eliminada correctamente" });
    } catch (err) {
      setAlert({ type: "danger", message: "Error al eliminar la empresa" });
    }
    setEmpresaAEliminar(null);
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      Cargando...
    </div>
  );

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <h2 className="mb-4 text-white">Empresas</h2>
      <ModalAlert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />
      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr>
              <th className="text-center">Nombre</th>
              <th className="text-center">Dirección</th>
              <th className="text-center">Teléfono</th>
              <th className="text-center">Email</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map(empresa => (
              <tr key={empresa.id_empresa || empresa.id}>
                <td className="text-center">{empresa.nombre_empresa}</td>
                <td className="text-center">{empresa.direccion}</td>
                <td className="text-center">{empresa.telefono}</td>
                <td className="text-center">{empresa.email}</td>
                <td className="text-center">
                  <a className="btn btn-sm btn-primary me-2" href={`/empresas/${empresa.id_empresa}/editar`}>Editar</a>
                  <button className="btn btn-sm btn-danger" onClick={() => { setEmpresaAEliminar(empresa.id_empresa); setConfirmOpen(true); }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a className="btn btn-success mt-3" href="/empresas/crear">Crear empresa</a>
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