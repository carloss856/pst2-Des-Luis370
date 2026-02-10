import React, { useEffect, useState } from 'react';
import ModalConfirm from "../ModalConfirm";
import ModalAlert from "../ModalAlert";
import { getRepuestos, deleteRepuesto } from '../../services/repuestos';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { canModule, getRbacCache } from '../../utils/rbac';
import LoadingView from "../LoadingView";

export default function RepuestosList() {
    const location = useLocation();
    const navigate = useNavigate();
    const [repuestos, setRepuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [repuestoAEliminar, setRepuestoAEliminar] = useState(null);
    const [alert, setAlert] = useState({ type: "", message: "" });

    const rbac = getRbacCache();
    const canCreate = canModule(rbac, 'repuestos', 'store');
    const canEdit = canModule(rbac, 'repuestos', 'update');
    const canDelete = canModule(rbac, 'repuestos', 'destroy');

    useEffect(() => {
        getRepuestos()
            .then(res => {
                setRepuestos(res);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (location.state && location.state.showAlert) {
            setAlert({
                type: "success",
                message: location.state.alertMessage || "Repuesto creado correctamente"
            });
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleConfirmDelete = async () => {
        setConfirmOpen(false);
        try {
            await deleteRepuesto(`${repuestoAEliminar}`);
            setRepuestos(repuestos.filter(r => r.id_repuesto !== repuestoAEliminar));
            setAlert({ type: "success", message: "Repuesto eliminado correctamente" });
        } catch (err) {
            setAlert({ type: "danger", message: "Error al eliminar el repuesto" });
        }
        setRepuestoAEliminar(null);
    };

    if (loading) return <LoadingView message="Cargando repuestos…" />;

    return (
        <div className="container d-flex flex-column justify-content-center align-items-center h-100">
            <h2 className="mb-4 text-white">Repuestos</h2>
            <ModalAlert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />
            <div className="table-responsive">
                <table className="table table-bordered table-striped align-middle">
                    <thead className="table-dark">
                        <tr className="text-center">
                            <th>Nombre</th>
                            <th>Cantidad</th>
                            <th>Costo</th>
                            <th>Nivel critico</th>
                            {(canEdit || canDelete) && <th>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {repuestos.map(repuesto => (
                            <tr key={repuesto.id_repuesto} className="text-center">
                                <td>{repuesto.nombre_repuesto}</td>
                                <td>{repuesto.cantidad_disponible}</td>
                                <td>{repuesto.costo_unitario}</td>
                                <td>{repuesto.nivel_critico}</td>
                                {(canEdit || canDelete) && (
                                    <td>
                                        {canEdit && (
                                            <button className="btn btn-sm btn-primary me-2 mb-2" onClick={() => navigate(`/repuestos/${repuesto.id_repuesto}/editar`)}>Editar</button>
                                        )}
                                        {canDelete && (
                                            <button className="btn btn-sm btn-danger mb-2" onClick={() => { setRepuestoAEliminar(repuesto.id_repuesto); setConfirmOpen(true); }}>Eliminar</button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {canCreate && <Link className="btn btn-success mt-3" to="/repuestos/crear">Crear Repuesto</Link>}
            <ModalConfirm
                show={confirmOpen}
                title="Confirmar Eliminación"
                onClose={() => setConfirmOpen(false)}
            >
                <p>¿Estás seguro de que deseas continuar?</p>
                <div className="d-flex justify-content-end">
                    <button className="btn btn-secondary me-2" onClick={() => setConfirmOpen(false)}>Cancelar</button>
                    <button className="btn btn-danger" onClick={handleConfirmDelete}>Eliminar</button>
                </div>
            </ModalConfirm>
        </div>
    );
}