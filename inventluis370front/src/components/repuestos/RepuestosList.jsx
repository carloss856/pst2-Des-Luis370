import React, { useEffect, useState } from 'react';
import ModalConfirm from "../ModalConfirm";
import ModalAlert from "../ModalAlert";
import { getRepuestos, deleteRepuesto } from '../../services/repuestos';
import { useLocation } from 'react-router-dom';

export default function RepuestosList() {
    const location = useLocation();
    const [repuestos, setRepuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [repuestoAEliminar, setRepuestoAEliminar] = useState(null);
    const [alert, setAlert] = useState({ type: "", message: "" });

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

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            Cargando...
        </div>
    );

    return (
        <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
            <h2 className="mb-4 text-white">Repuestos</h2>
            <ModalAlert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />
            <div className="table-responsive">
                <table className="table table-bordered table-striped align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th className="text-center">Nombre</th>
                            <th className="text-center">Cantidad</th>
                            <th className="text-center">Costo</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {repuestos.map(repuesto => (
                            <tr key={repuesto.id_repuesto}>
                                <td className="text-center">{repuesto.nombre_repuesto}</td>
                                <td className="text-center">{repuesto.cantidad_disponible}</td>
                                <td className="text-center">{repuesto.costo_unitario}</td>
                                <td className="text-center">
                                    <a className="btn btn-sm btn-primary me-2" href={`/repuestos/${repuesto.id_repuesto}/editar`}>Editar</a>
                                    <button className="btn btn-sm btn-danger" onClick={() => { setRepuestoAEliminar(repuesto.id_repuesto); setConfirmOpen(true); }}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <a className="btn btn-success mt-3" href="/repuestos/crear">Crear Repuesto</a>
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