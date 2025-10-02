import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEntrada } from '../../services/inventario';
import { getRepuestos, getRepuesto, updateRepuesto } from '../../services/repuestos';

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
            const repuesto = await getRepuesto(form.id_repuesto);
            const cantidad_disponible = repuesto ? parseInt(repuesto.cantidad_disponible) : 0;
            const nuevaCantidad = cantidad_disponible + parseInt(form.cantidad_entrada);
            await updateRepuesto(form.id_repuesto, {
                nombre_repuesto: repuesto.nombre_repuesto,
                cantidad_disponible: nuevaCantidad,
                costo_unitario: repuesto.costo_unitario ?? 0,
                nivel_critico: repuesto.nivel_critico ?? 0
            });
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
            <form onSubmit={handleSubmit} className="card p-4" style={{ width: 400 }}>
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