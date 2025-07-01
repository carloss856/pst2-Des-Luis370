import React from "react";
import { useEffect, useState } from "react";
import { getRepuestos } from "../services/repuestos";
import { getSolicitudes, deleteSolicitud } from "../services/solicitudesRepuestos";
import { getUsuarios } from "../services/usuarios";
import { getServicios } from "../services/servicios";

const SolicitudesRepuestosList = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [repuestos, setRepuestos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            // setLoading(true);
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
        return <div>Cargando...</div>;
    }

    return (
        <div>
            <h2>Solicitudes de Repuestos</h2>
            <table border={1} cellPadding={5}>
                <thead>
                    <tr>
                        <th>Numero solicitud</th>
                        <th>Repuesto</th>
                        <th>Servicio</th>
                        <th>Fecha Solicitud</th>
                        <th>Nombre Repuesto</th>
                        <th>Stock Actual</th>
                        <th>Cantidad Solicitada</th>
                        <th>Estado</th>
                        <th>Comentarios</th>
                        <th>Usuario</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {solicitudes.map((solicitud) => {
                        const repuesto = repuestos.find(r => r.id_repuesto === solicitud.id_repuesto);
                        const usuario = usuarios.find(u => u.id_persona === solicitud.id_usuario);
                        const servicio = servicios.find(s => s.id_servicio === solicitud.id_servicio);

                        return (
                            <tr key={solicitud.id_solicitud}>
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
                                <td>
                                    <button onClick={() => handleEdit(solicitud.id_solicitud)}>Editar</button>
                                    <button onClick={() => handleDelete(solicitud.id_solicitud)}>Eliminar</button>
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
            <a href="/solicitudes-repuestos/crear">Nueva Solicitud de Repuesto</a>
        </div>
    );
};

export default SolicitudesRepuestosList;
