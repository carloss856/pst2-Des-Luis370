import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRepuesto, getRepuestos } from '../../services/repuestos';

export default function RepuestoForm() {
    const [form, setForm] = useState({
        nombre_repuesto: '',
        cantidad_disponible: "0",
        costo_unitario: '',
        nivel_critico: "0"
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            // Verifica si ya existe un repuesto con ese nombre
            const repuestos = await getRepuestos();
            const existe = repuestos.some(
                r => r.nombre_repuesto.trim().toLowerCase() === form.nombre_repuesto.trim().toLowerCase()
            );
            if (existe) {
                setError('Ya existe un repuesto con ese nombre.');
                return;
            }
            await createRepuesto(form);
            navigate('/repuestos');
        } catch (err) {
            setError('Error al crear repuesto');
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center h-100">
            <form onSubmit={handleSubmit} className="card p-4" style={{ width: 400 }}>
                <h2 className="text-center mb-4">Crear Repuesto</h2>
                <div className="mb-3">
                    <label htmlFor="nombre_repuesto">Nombre</label>
                    <input
                        name="nombre_repuesto"
                        className="form-control"
                        placeholder="Nombre"
                        value={form.nombre_repuesto}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="cantidad_disponible">Cantidad Disponible</label>
                    <input
                        disabled
                        name="cantidad_disponible"
                        type="number"
                        className="form-control"
                        placeholder="Cantidad"
                        value={form.cantidad_disponible}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="costo_unitario">Costo Unitario</label>
                    <input
                        name="costo_unitario"
                        type="number"
                        className="form-control"
                        placeholder="Costo"
                        value={form.costo_unitario}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="nivel_critico">Nivel Crítico</label>
                    <input
                        name="nivel_critico"
                        type="number"
                        className="form-control"
                        placeholder="Nivel Crítico"
                        value={form.nivel_critico}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-success w-100 mb-2">Guardar</button>
                <button type="button" className="btn btn-secondary w-100" onClick={() => navigate('/repuestos')}>Volver</button>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
            </form>
        </div>
    );
}