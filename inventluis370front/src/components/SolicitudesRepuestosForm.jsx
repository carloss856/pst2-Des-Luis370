import React, { useEffect, useState } from "react";
import { getRepuestos } from "../services/repuestos";
import { getServicios } from "../services/servicios";
import { createSolicitud } from "../services/solicitudesRepuestos";
import { useNavigate } from "react-router-dom";

const SolicitudesRepuestosForm = () => {
    const [repuestos, setRepuestos] = useState([]);
    const [servicios, setServicios] = useState([]);
    const user = localStorage.getItem("id_usuario");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        id_repuesto: "",
        id_servicio: "",
        fecha_solicitud: "",
        cantidad_solicitada: "",
        estado_solicitud: "",
        comentarios: "",
        id_usuario: user,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const repuestosData = await getRepuestos();
                const serviciosData = await getServicios();
                setRepuestos(Array.isArray(repuestosData) ? repuestosData : repuestosData.data || []);
                setServicios(Array.isArray(serviciosData) ? serviciosData : serviciosData.data || []);
            } catch (err) {
                setError("Error al cargar datos");
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createSolicitud(form);
            navigate('/solicitudes-repuestos');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.errors) {
                setError(JSON.stringify(err.response.data.errors, null, 2));
            } else {
                setError('Error al crear solicitud');
            }
        }
    };

    return (
        <div>
            <h2>Crear Solicitud de Repuesto</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Repuesto:</label>
                    <select name="id_repuesto" value={form.id_repuesto} onChange={handleChange} required>
                        <option value="" disabled>Seleccione un repuesto</option>
                        {repuestos.map((repuesto) => (
                            <option key={repuesto.id_repuesto} value={repuesto.id_repuesto}>
                                {repuesto.nombre_repuesto}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Servicio Asociado:</label>
                    <select name="id_servicio" value={form.id_servicio} onChange={handleChange} required>
                        <option value="" disabled>Seleccione un servicio</option>
                        {servicios.map((servicio) => (
                            <option key={servicio.id_servicio} value={servicio.id_servicio}>
                                {servicio.problema_reportado}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Fecha Solicitud:</label>
                    <input type="date" name="fecha_solicitud" value={form.fecha_solicitud} onChange={handleChange} required />
                </div>
                <div>
                    <label>Cantidad Solicitada:</label>
                    <input type="number" name="cantidad_solicitada" value={form.cantidad_solicitada} onChange={handleChange} required min={1} />
                </div>
                <div>
                    <label>Comentarios:</label>
                    <textarea name="comentarios" value={form.comentarios} onChange={handleChange}></textarea>
                </div>
                <div>
                    <label>Estado:</label>
                    <select name="estado_solicitud" value={form.estado_solicitud} onChange={handleChange}>
                        <option value="" disabled>Selecciona una opcion</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Aprobada">Aprobada</option>
                        <option value="Rechazada">Rechazada</option>
                    </select>
                </div>
                {error && <div style={{ color: "red" }}>{error}</div>}
                <button type="submit">Guardar Solicitud</button>
                <button type="button" onClick={() => window.history.back()}>Volver</button>
            </form>
        </div>
    );
};

export default SolicitudesRepuestosForm;
