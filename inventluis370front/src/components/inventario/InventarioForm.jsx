import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEntrada } from '../../services/inventario';
import { getRepuestos } from '../../services/repuestos';

export default function InventarioForm() {
    const [form, setForm] = useState({
        id_repuesto: '',
        cantidad_entrada: '',
        fecha_entrada: new Date().toISOString().split('T')[0],
    });
    const [repuestos, setRepuestos] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const repuestosRes = await getRepuestos();
            setRepuestos(repuestosRes);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            // El backend ya incrementa cantidad_disponible del repuesto al crear la entrada
            // (InventarioController::store). Antes este formulario ADEMAS hacia un PUT manual
            // a /repuestos/{id} para sumar la cantidad, lo cual duplicaba el incremento de stock
            // y encima requeria permiso de "editar" repuestos (que Tecnico no tiene, solo "ver"),
            // rompiendo el formulario con 403 para ese rol.
            await createEntrada(form);
            navigate('/inventario');
        } catch (err) {
            setError('Error al crear entrada');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center h-100">
            <form onSubmit={handleSubmit} className="card p-4" style={{ width: "100%", maxWidth: "680px" }}>
                <h2 className="text-center mb-4">Entrada de mercancia</h2>
                <label htmlFor="id_repuesto">Repuesto</label>
                <select className="mb-3" onChange={handleChange} name="id_repuesto" value={form.id_repuesto} required>
                    <option value="" disabled>Seleccione un repuesto</option>
                    {repuestos.map(rep => (
                        <option key={rep.id_repuesto} value={rep.id_repuesto}>
                            {rep.nombre_repuesto}
                        </option>
                    ))}
                </select>
                <div className="mb-3">
                    <label htmlFor="cantidad_entrada">Cantidad de Entrada</label>
                    <input
                        name="cantidad_entrada"
                        type="number"
                        className="form-control"
                        placeholder="Cantidad"
                        value={form.cantidad_entrada}
                        onChange={handleChange}
                        required
                        min={1}
                    />
                </div>
                <button type="submit" className="btn btn-success w-100 mb-2" disabled={saving || loading}>
                    {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" className="btn btn-secondary w-100" onClick={() => navigate('/inventario')} disabled={saving}>
                    Volver
                </button>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
            </form>
        </div>
    );
}
