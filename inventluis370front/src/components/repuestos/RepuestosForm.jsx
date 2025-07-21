import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRepuesto } from '../../services/repuestos';

export default function RepuestoForm() {
    const [form, setForm] = useState({
        nombre_repuesto: '',
        cantidad_disponible: '',
        costo_unitario: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await createRepuesto(form);
            navigate('/repuestos');
        } catch (err) {
            setError('Error al crear repuesto');
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <form onSubmit={handleSubmit} className="card p-4" style={{ width: 400 }}>
                <h2 className="text-center mb-4">Crear Repuesto</h2>
                <div className="mb-3">
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
                    <input
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
                <button type="submit" className="btn btn-success w-100 mb-2">Guardar</button>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
                <button type="button" className="btn btn-secondary w-100" onClick={() => navigate('/repuestos')}>Volver</button>
            </form>
        </div>
    );
}