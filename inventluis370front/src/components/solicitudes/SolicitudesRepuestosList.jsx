import React, { useEffect, useState } from "react";
import { getRepuestos } from "../../services/repuestos";
import { getSolicitudes, deleteSolicitud } from "../../services/solicitudesRepuestos";
import { getUsuarios } from "../../services/usuarios";
import { getServicios } from "../../services/servicios";
import ModalConfirm from "../ModalConfirm";
import ModalAlert from "../ModalAlert";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { canModule, getRbacCache } from "../../utils/rbac";
import LoadingView from "../LoadingView";

const SolicitudesRepuestosList = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [repuestos, setRepuestos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [solicitudAEliminar, setSolicitudAEliminar] = useState(null);
    const [alert, setAlert] = useState({ type: "", message: "" });
    const userId = localStorage.getItem("id_usuario");
    const userRol = localStorage.getItem("rol_usuario");
    const location = useLocation();
    const navigate = useNavigate();

    const rbac = getRbacCache();
    const canCreate = canModule(rbac, 'solicitud-repuestos', 'store');
    const canEdit = canModule(rbac, 'solicitud-repuestos', 'update');
    const canDelete = canModule(rbac, 'solicitud-repuestos', 'destroy');
    const canListUsuarios = canModule(rbac, 'usuarios', 'index');
    const canListRepuestos = canModule(rbac, 'repuestos', 'index');
    const canListServicios = canModule(rbac, 'servicios', 'index');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [solRes, repRes, usuRes, serRes] = await Promise.allSettled([
                    getSolicitudes(),
                    canListRepuestos ? getRepuestos() : Promise.resolve([]),
                    canListUsuarios ? getUsuarios() : Promise.resolve([]),
                    canListServicios ? getServicios() : Promise.resolve([]),
                ]);

                if (solRes.status === 'fulfilled') {
                    setSolicitudes(Array.isArray(solRes.value) ? solRes.value : []);
                } else {
                    setSolicitudes([]);
                }

                if (repRes.status === 'fulfilled') setRepuestos(Array.isArray(repRes.value) ? repRes.value : []);
                else setRepuestos([]);
                if (usuRes.status === 'fulfilled') setUsuarios(Array.isArray(usuRes.value) ? usuRes.value : []);
                else setUsuarios([]);
                if (serRes.status === 'fulfilled') setServicios(Array.isArray(serRes.value) ? serRes.value : []);
                else setServicios([]);

                // Si falló lo principal (solicitudes), mostramos error.
                if (solRes.status === 'rejected') {
                    const status = solRes.reason?.response?.status;
                    const msg = solRes.reason?.response?.data?.message;
                    setAlert({
                        type: "danger",
                        message: `Error cargando solicitudes${status ? ` (HTTP ${status})` : ''}${msg ? `: ${msg}` : ''}.`,
                    });
                    return;
                }

                // Si falló alguna dependencia, no bloqueamos: solo avisamos.
                const warnings = [];
                if (repRes.status === 'rejected') warnings.push('Repuestos');
                if (usuRes.status === 'rejected') warnings.push('Usuarios');
                if (serRes.status === 'rejected') warnings.push('Servicios');
                if (warnings.length > 0) {
                    const firstErr = [repRes, usuRes, serRes].find((r) => r.status === 'rejected')?.reason;
                    const status = firstErr?.response?.status;
                    setAlert({
                        type: "warning",
                        message: `Solicitudes cargadas, pero no se pudieron cargar: ${warnings.join(', ')}${status ? ` (HTTP ${status})` : ''}.`,
                    });
                }
            } catch (e) {
                const status = e?.response?.status;
                const msg = e?.response?.data?.message;
                setAlert({ type: "danger", message: `Error cargando solicitudes${status ? ` (HTTP ${status})` : ''}${msg ? `: ${msg}` : ''}.` });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (location.state && location.state.showAlert) {
            setAlert({
                type: "success",
                message: location.state.alertMessage || "Solicitud creada correctamente"
            });
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleConfirmDelete = async () => {
        setConfirmOpen(false);
        try {
            await deleteSolicitud(`${solicitudAEliminar}`);
            setSolicitudes(solicitudes.filter(s => s.id_solicitud !== solicitudAEliminar));
            setAlert({ type: "success", message: "Solicitud eliminada correctamente" });
        } catch (err) {
            setAlert({ type: "danger", message: "Error al eliminar la solicitud" });
        }
        setSolicitudAEliminar(null);
    };

    if (loading) return <LoadingView message="Cargando solicitudes…" />;

    return (
        <div className="container d-flex flex-column justify-content-center align-items-center h-100">
            <h2 className="mb-4 text-white">Solicitudes de Repuestos</h2>
            <ModalAlert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />
            <div className="table-responsive">
                <table className="table table-bordered table-striped align-middle">
                    <thead className="table-dark">
                        <tr className="text-center">
                            <th>Repuesto</th>
                            <th>Servicio</th>
                            <th>Fecha Solicitud</th>
                            <th>Cantidad Solicitada</th>
                            <th>Estado</th>
                            <th>Comentarios</th>
                            <th>Usuario</th>
                            {(canEdit || canDelete) && <th>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {solicitudes.map((solicitud) => {
                            const repuesto = repuestos.find(r => r.id_repuesto === solicitud.id_repuesto);
                            const usuario = usuarios.find(u => u.id_persona === solicitud.id_usuario);
                            const servicio = servicios.find(s => s.id_servicio === solicitud.id_servicio);

                            const puedeGestionarPorNegocio =
                                (userRol === "Administrador" || userRol === "Gerente" || String(solicitud.id_usuario) === String(userId)) &&
                                (solicitud.estado_solicitud !== "Rechazada" && solicitud.estado_solicitud !== "Aprobada");

                            const showRowActions = (canEdit || canDelete);
                            const showEdit = canEdit && puedeGestionarPorNegocio;
                            const showDelete = canDelete && puedeGestionarPorNegocio;

                            return (
                                <tr key={solicitud.id_solicitud} className="text-center">
                                    <td>{repuesto ? repuesto.nombre_repuesto : "N/A"}</td>
                                    <td>{servicio ? servicio.problema_reportado : "N/A"} - {servicio ? servicio.codigo_rma : "N/A"}</td>
                                    <td>{new Date(solicitud.fecha_solicitud).toLocaleDateString()}</td>
                                    <td>{solicitud.cantidad_solicitada}</td>
                                    <td>{solicitud.estado_solicitud}</td>
                                    <td>{solicitud.comentarios || "N/A"}</td>
                                    <td>{usuario ? usuario.nombre : "N/A"}</td>
                                    {showRowActions && (
                                        <td>
                                            {(showEdit || showDelete) ? (
                                                <>
                                                    {showEdit && (
                                                        <button
                                                            className="btn btn-sm btn-primary me-2 mb-2"
                                                            onClick={() => navigate(`/solicitudes-repuestos/${solicitud.id_solicitud}/editar`)}
                                                        >
                                                            Editar
                                                        </button>
                                                    )}
                                                    {showDelete && (
                                                        <button
                                                            className="btn btn-sm btn-danger mb-2"
                                                            onClick={() => {
                                                                setSolicitudAEliminar(solicitud.id_solicitud);
                                                                setConfirmOpen(true);
                                                            }}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-muted fst-italic">Sin acciones</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={11}>Total Solicitudes: {solicitudes.length}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            {canCreate && <Link className="btn btn-success mt-3" to="/solicitudes-repuestos/crear">Nueva Solicitud de Repuesto</Link>}
            <ModalConfirm
                show={confirmOpen}
                title="Eliminar Solicitud"
                onClose={() => setConfirmOpen(false)}
            >
                <p>¿Estás seguro de que deseas eliminar esta solicitud?</p>
                <div className="d-flex justify-content-end">
                    <button className="btn btn-secondary me-2" onClick={() => setConfirmOpen(false)}>Cancelar</button>
                    <button className="btn btn-danger" onClick={handleConfirmDelete}>Eliminar</button>
                </div>
            </ModalConfirm>
        </div>
    );
};

export default SolicitudesRepuestosList;