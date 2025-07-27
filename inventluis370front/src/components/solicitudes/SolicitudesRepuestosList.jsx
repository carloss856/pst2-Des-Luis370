import React, { useEffect, useState } from "react";
import { getRepuestos } from "../../services/repuestos";
import { getSolicitudes, deleteSolicitud } from "../../services/solicitudesRepuestos";
import { getUsuarios } from "../../services/usuarios";
import { getServicios } from "../../services/servicios";

const SolicitudesRepuestosList = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [repuestos, setRepuestos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const [solicitudesData, repuestosData, usuariosData, serviciosData] = await Promise.all([
                getSolicitudes(),
                getRepuestos(),
                getUsuarios(),
                getServicios()
            ]);
            setSolicitudes(Array.isArray(solicitudesData) ? solicitudesData : solicitudesData.data || []);
            setRepuestos(Array.isArray(repuestosData) ? repuestosData : repuestosData.data || []);
            setUsuarios(Array.isArray(usuariosData) ? usuariosData : usuariosData.data || []);
            setServicios(Array.isArray(serviciosData) ? serviciosData : serviciosData.data || []);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleEdit = (id) => {
        window.location.href = `/solicitudes-repuestos/${id}/editar`;
    };

    const cargarSolicitudes = () => {
        getSolicitudes()
            .then(res => {
                setSolicitudes(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar solicitud?')) {
            await deleteSolicitud(id);
            cargarSolicitudes();
        }
    };

    if (loading) {
        return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>Cargando...</div>;
    }

    return (
        <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
            <h2 className="mb-4 text-white">Solicitudes de Repuestos</h2>
            <div className="table-responsive">
                <table className="table table-bordered table-striped align-middle">
                    <thead className="table-dark">
                        <tr className="text-center">
                            <th className="text-nowrap">Numero solicitud</th>
                            <th className="text-nowrap">Repuesto</th>
                            <th className="text-nowrap">Servicio</th>
                            <th className="text-nowrap">Fecha Solicitud</th>
                            <th className="text-nowrap">Nombre Repuesto</th>
                            <th className="text-nowrap">Stock Actual</th>
                            <th className="text-nowrap">Cantidad Solicitada</th>
                            <th className="text-nowrap">Estado</th>
                            <th className="text-nowrap">Comentarios</th>
                            <th className="text-nowrap">Usuario</th>
                            <th className="text-nowrap">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {solicitudes.map((solicitud) => {
                            const repuesto = repuestos.find(r => r.id_repuesto === solicitud.id_repuesto);
                            const usuario = usuarios.find(u => u.id_persona === solicitud.id_usuario);
                            const servicio = servicios.find(s => s.id_servicio === solicitud.id_servicio);

                            return (
                                <tr key={solicitud.id_solicitud} className="text-center">
                                    <td>{solicitud.id_solicitud}</td>
                                    <td>{repuesto ? repuesto.nombre_repuesto : "N/A"}</td>
                                    <td>{servicio ? servicio.problema_reportado : "N/A"}</td>
                                    <td>{new Date(solicitud.fecha_solicitud).toLocaleDateString()}</td>
                                    <td>{repuesto ? repuesto.nombre_repuesto : "N/A"}</td>
                                    <td>{repuesto ? repuesto.cantidad_disponible : "N/A"}</td>
                                    <td>{solicitud.cantidad_solicitada}</td>
                                    <td>{solicitud.estado_solicitud}</td>
                                    <td>{solicitud.comentarios || "N/A"}</td>
                                    <td>{usuario ? usuario.nombre : "N/A"}</td>
                                    <td className="d-flex justify-content-between">
                                        <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(solicitud.id_solicitud)}>Editar</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(solicitud.id_solicitud)}>Eliminar</button>
                                    </td>
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
            <a className="btn btn-success mt-3" href="/solicitudes-repuestos/crear">Nueva Solicitud de Repuesto</a>
        </div>
    );
};

export default SolicitudesRepuestosList;