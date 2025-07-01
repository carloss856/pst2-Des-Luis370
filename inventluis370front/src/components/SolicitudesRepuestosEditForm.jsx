import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSolicitud, updateSolicitud } from "../services/solicitudesRepuestos";
import { getRepuestos } from "../services/repuestos";
import { getServicios } from "../services/servicios";
import { getUsuarios } from "../services/usuarios";

function SolicitudesRepuestosEditForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        id_repuesto: "",
        id_servicio: "",
        fecha_solicitud: "",
        cantidad_solicitada: "",
        estado_solicitud: "",
        comentarios: "",
        id_usuario: localStorage.getItem("id_usuario"),
    });
    const [repuestos, setRepuestos] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [error, setError] = useState(null);
    const user = localStorage.getItem("id_usuario");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const solicitud = await getSolicitud(id);
                setForm({
                    id_repuesto: solicitud.id_repuesto,
                    id_servicio: solicitud.id_servicio,
                    fecha_solicitud: solicitud.fecha_solicitud.match(/^\d{4}-\d{2}-\d{2}/)[0],
                    cantidad_solicitada: solicitud.cantidad_solicitada,
                    estado_solicitud: solicitud.estado_solicitud,
                    comentarios: solicitud.comentarios,
                    id_usuario: user,
                });
                const repuestosData = await getRepuestos();
                setRepuestos(Array.isArray(repuestosData) ? repuestosData : repuestosData.data || []);
                const serviciosData = await getServicios();
                setServicios(Array.isArray(serviciosData) ? serviciosData : serviciosData.data || []);
            } catch (err) {
                setError("Error al cargar datos");
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateSolicitud(id, form);
            navigate("/solicitudes-repuestos");
        } catch (err) {
            setError("Error al actualizar la solicitud");
        }
    };

    return (
        <div>
            <h2>Editar Solicitud de Repuesto</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Repuesto:
                </label>
                <select name="id_repuesto" value={form.id_repuesto} onChange={handleChange} required>
                    <option value="">Seleccione</option>
                    {repuestos.map((r) => (
                        <option key={r.id_repuesto} value={r.id_repuesto}>
                            {r.nombre_repuesto}
                        </option>
                    ))}
                </select>
                <label>
                    Servicio:
                </label>
                <select name="id_servicio" value={form.id_servicio} onChange={handleChange} required>
                    <option value="" disabled>Seleccione</option>
                    {servicios.map((s) => (
                        <option key={s.id_servicio} value={s.id_servicio}>
                            {s.problema_reportado}
                        </option>
                    ))}
                </select>
                <p> Fecha Solicitud: <span>{form.fecha_solicitud}</span> </p>
                <label>
                    Cantidad Solicitada:
                </label>
                <input
                    type="number"
                    name="cantidad_solicitada"
                    value={form.cantidad_solicitada}
                    onChange={handleChange}
                    required
                />
                <label>
                    Estado:
                </label>
                <select name="estado_solicitud" value={form.estado_solicitud} onChange={handleChange} required>
                    <option value="" disabled>Selecciona una opcion</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aprobada">Aprobada</option>
                    <option value="Rechazada">Rechazada</option>
                </select>
                <label>
                    Comentarios:
                </label>
                <textarea
                    name="comentarios"
                    value={form.comentarios}
                    onChange={handleChange}
                />
                <button type="submit">Guardar Cambios</button>
                <button type="button" onClick={() => navigate("/solicitudes-repuestos")}>
                    Cancelar
                </button>
            </form>
        </div>
    );
}

export default SolicitudesRepuestosEditForm;
