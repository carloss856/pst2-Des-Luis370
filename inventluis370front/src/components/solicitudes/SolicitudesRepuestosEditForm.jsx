import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSolicitud, updateSolicitud } from "../../services/solicitudesRepuestos";
import { getRepuestos } from "../../services/repuestos";
import { getServicios } from "../../services/servicios";

function SolicitudesRepuestosEditForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [repuestos, setRepuestos] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [error, setError] = useState(null);
    const user = {
        id: localStorage.getItem("id_usuario"),
        rol: localStorage.getItem("rol_usuario")
    };
    const [form, setForm] = useState({
        id_repuesto: "",
        id_servicio: "",
        fecha_solicitud: "",
        cantidad_solicitada: "",
        estado_solicitud: "",
        comentarios: "",
        id_usuario: user.id,
    });
    const [solicitudPropia, setSolicitudPropia] = useState(false);
    const [cantidadDisponible, setCantidadDisponible] = useState(null);

    const esAdminOGerente = user.rol === "Administrador" || user.rol === "Gerente";

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
                    id_usuario: user.id,
                });
                setSolicitudPropia(String(solicitud.id_usuario) === String(user.id));
                const repuestosData = await getRepuestos();
                setRepuestos(Array.isArray(repuestosData) ? repuestosData : repuestosData.data || []);
                const serviciosData = await getServicios();
                setServicios(Array.isArray(serviciosData) ? serviciosData : serviciosData.data || []);
            } catch (err) {
                setError("Error al cargar datos");
            }
        };
        fetchData();
    }, [id, user.id]);

    useEffect(() => {
        // Redirige si no es propia y no es admin/gerente
        if (!solicitudPropia && !esAdminOGerente && form.id_repuesto) {
            navigate("/solicitudes-repuestos");
        }
    }, [solicitudPropia, esAdminOGerente, form.id_repuesto, navigate]);

    useEffect(() => {
        // Actualiza la cantidad disponible cuando cambia el repuesto seleccionado
        const repuestoSel = repuestos.find(r => String(r.id_repuesto) === String(form.id_repuesto));
        setCantidadDisponible(repuestoSel ? repuestoSel.cantidad_disponible : null);
    }, [form.id_repuesto, repuestos]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (name === "id_repuesto") {
            const repuestoSel = repuestos.find(r => String(r.id_repuesto) === String(value));
            setCantidadDisponible(repuestoSel ? repuestoSel.cantidad_disponible : null);
        }
    };

    const excedeCantidad =
        form.cantidad_solicitada &&
        cantidadDisponible !== null &&
        Number(form.cantidad_solicitada) > Number(cantidadDisponible);

    // Helpers para mostrar nombres en modo solo lectura
    const repuestoNombre = repuestos.find(r => String(r.id_repuesto) === String(form.id_repuesto))?.nombre_repuesto || "";
    const servicioNombre = servicios.find(s => String(s.id_servicio) === String(form.id_servicio))?.problema_reportado || "";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (excedeCantidad) return;

        try {
            await updateSolicitud(id, form);
            navigate("/solicitudes-repuestos");
        } catch (err) {

            const msg =
                err.response?.data?.error ||
                (err.response?.data?.errors
                    ? Object.values(err.response.data.errors).flat().join(", ")
                    : "Error al actualizar la solicitud");

            setError(msg);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <form onSubmit={handleSubmit} className="card p-4" style={{ maxWidth: 500, width: "100%" }}>
                <h2 className="text-center mb-4">Editar Solicitud de Repuesto</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Repuesto */}
                <div className="mb-3">
                    <label className="form-label">Repuesto</label>
                    {solicitudPropia && !esAdminOGerente ? (
                        <input className="form-control" value={repuestoNombre} disabled />
                    ) : (
                        <select name="id_repuesto" value={form.id_repuesto} onChange={handleChange} required className="form-select">
                            <option value="">Seleccione</option>
                            {repuestos.map((r) => (
                                <option key={r.id_repuesto} value={r.id_repuesto}>
                                    {r.nombre_repuesto}
                                </option>
                            ))}
                        </select>
                    )}
                    {cantidadDisponible !== null && (
                        <span className="text-small text-lighter mt-2 d-block">
                            Cantidad disponible: {cantidadDisponible}
                        </span>
                    )}
                </div>
                {/* Cantidad Solicitada */}
                <div className="mb-3">
                    <label className="form-label">Cantidad Solicitada</label>
                    <input
                        type="number"
                        name="cantidad_solicitada"
                        className="form-control"
                        value={form.cantidad_solicitada}
                        onChange={handleChange}
                        required
                        min={1}
                        disabled={!(solicitudPropia || esAdminOGerente)}
                    />
                    {excedeCantidad && (
                        <div className="text-danger text-small text-lighter">
                            La cantidad solicitada excede la cantidad disponible.
                        </div>
                    )}
                </div>

                {/* Servicio */}
                <div className="mb-3">
                    <label className="form-label">Servicio</label>
                    {solicitudPropia && !esAdminOGerente ? (
                        <input className="form-control" value={servicioNombre} disabled />
                    ) : (
                        <select name="id_servicio" value={form.id_servicio} onChange={handleChange} required className="form-select">
                            <option value="" disabled>Seleccione</option>
                            {servicios.map((s) => (
                                <option key={s.id_servicio} value={s.id_servicio}>
                                    {s.problema_reportado}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Fecha Solicitud */}
                <div className="mb-3">
                    <label className="form-label">Fecha Solicitud</label>
                    <input
                        type="text"
                        className="form-control"
                        value={form.fecha_solicitud}
                        disabled
                    />
                </div>

                {/* Estado */}
                {esAdminOGerente ? (
                    <div className="mb-3">
                        <label className="form-label">Estado</label>
                        <select name="estado_solicitud" value={form.estado_solicitud} onChange={handleChange} required className="form-select">
                            <option value="" disabled>Selecciona una opcion</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Aprobada">Aprobada</option>
                            <option value="Rechazada">Rechazada</option>
                        </select>
                    </div>
                ) : (
                    <div className="mb-3">
                        <label className="form-label">Estado</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.estado_solicitud}
                            disabled
                        />
                    </div>
                )}

                {/* Comentarios */}
                <div className="mb-3">
                    <label className="form-label">Comentarios</label>
                    <textarea
                        name="comentarios"
                        className="form-control"
                        value={form.comentarios}
                        onChange={handleChange}
                        disabled={!(solicitudPropia || esAdminOGerente)}
                    />
                </div>
                <button type="submit" className="btn btn-success w-100 mb-2" disabled={excedeCantidad}>Guardar Cambios</button>
                <button type="button" className="btn btn-secondary w-100" onClick={() => navigate("/solicitudes-repuestos")}>
                    Volver
                </button>
            </form>
        </div>
    );
}

export default SolicitudesRepuestosEditForm;