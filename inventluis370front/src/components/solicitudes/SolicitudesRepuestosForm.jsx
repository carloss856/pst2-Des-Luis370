import React, { useEffect, useState } from "react";
import { getRepuestos } from "../../services/repuestos";
import { getServicios } from "../../services/servicios";
import { createSolicitud } from "../../services/solicitudesRepuestos";
import { useNavigate } from "react-router-dom";

const SolicitudesRepuestosForm = () => {
    const [repuestos, setRepuestos] = useState([]);
    const [servicios, setServicios] = useState([]);
    const user = localStorage.getItem("id_usuario");
    const [error, setError] = useState(null);
    const [cantidadDisponible, setCantidadDisponible] = useState(null);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        id_repuesto: "",
        id_servicio: "",
        fecha_solicitud: new Date().toISOString().split("T")[0],
        cantidad_solicitada: "",
        estado_solicitud: "Pendiente",
        comentarios: "",
        id_usuario: user,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const repuestosData = await getRepuestos();
                const serviciosData = await getServicios();
                setRepuestos(repuestosData);
                setServicios(serviciosData);
            } catch (err) {
                setError("Error al cargar datos");
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (name === "id_repuesto") {
            setForm(f => ({ ...f, cantidad_solicitada: "" }));
            const repuestoSel = repuestos.find(r => String(r.id_repuesto) === String(value));
            setCantidadDisponible(repuestoSel ? repuestoSel.cantidad_disponible : null);
        }
        if (name === "cantidad_solicitada" && form.id_repuesto) {
            const repuestoSel = repuestos.find(r => String(r.id_repuesto) === String(form.id_repuesto));
            setCantidadDisponible(repuestoSel ? repuestoSel.cantidad_disponible : null);
        }
    };

    const excedeCantidad =
        form.cantidad_solicitada &&
        cantidadDisponible !== null &&
        Number(form.cantidad_solicitada) > Number(cantidadDisponible);

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
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <form onSubmit={handleSubmit} className="card p-4" style={{ maxWidth: "680px", width: "100%" }}>
                <h2 className="text-center mb-4">Crear Solicitud de Repuesto</h2>
                <div className="mb-3">
                    <label className="form-label">Repuesto</label>
                    <select name="id_repuesto" value={form.id_repuesto} onChange={handleChange} required className="form-select">
                        <option value="" disabled>Seleccione un repuesto</option>
                        {repuestos.map((repuesto) => (
                            <option key={repuesto.id_repuesto} value={repuesto.id_repuesto}>
                                {repuesto.nombre_repuesto}
                            </option>
                        ))}
                    </select>
                    {cantidadDisponible !== null && (
                        <span className=" text-small text-lighter mt-3 d-block">
                            cantidad disponible: {cantidadDisponible}
                        </span>
                    )}
                </div>
                <div className="mb-3">
                    <label className="form-label">Cantidad Solicitada</label>
                    <input
                        type="number"
                        name="cantidad_solicitada"
                        value={form.cantidad_solicitada}
                        onChange={handleChange}
                        required
                        min={1}
                        className="form-control"
                    />
                    {excedeCantidad && (
                        <div className="text-danger text-small text-lighter mt-3 d-block">
                            La cantidad solicitada excede la cantidad disponible.
                        </div>
                    )}
                </div>
                <div className="mb-3">
                    <label className="form-label">Servicio Asociado</label>
                    <select name="id_servicio" value={form.id_servicio} onChange={handleChange} required className="form-select">
                        <option value="" disabled>Seleccione un servicio</option>
                        {servicios.map((servicio) => (
                            <option key={servicio.id_servicio} value={servicio.id_servicio}>
                                {servicio.problema_reportado}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Estado</label>
                    <input type="text" name="estado_solicitud" value={form.estado_solicitud} onChange={handleChange} className="form-control disabled" disabled />
                    {/* <select name="estado_solicitud" value={form.estado_solicitud} onChange={handleChange} className="form-select">
                        <option value="" disabled>Selecciona una opcion</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Aprobada">Aprobada</option>
                        <option value="Rechazada">Rechazada</option>
                    </select> */}
                </div>
                <div className="mb-3">
                    <label className="form-label">Comentarios</label>
                    <textarea name="comentarios" value={form.comentarios} onChange={handleChange} className="form-control"></textarea>
                </div>
                <button type="submit" className="btn btn-success w-100 mb-2" disabled={excedeCantidad} > Guardar Solicitud </button>
                <button type="button" className="btn btn-secondary w-100" onClick={() => navigate("/solicitudes-repuestos")}>Volver</button>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
            </form>
        </div>
    );
};

export default SolicitudesRepuestosForm;
