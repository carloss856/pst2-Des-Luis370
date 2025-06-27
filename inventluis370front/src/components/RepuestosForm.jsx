import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { createRepuesto } from '../services/repuestos';

export default function RepuestoForm() {
    const [form, setForm] = useState({
        nombre_repuesto: '',
        cantidad_disponible: 0,
        costo_unitario: 0 });
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
        <form onSubmit={handleSubmit}>
            <h2>Crear Repuesto</h2>
            <input name="nombre_repuesto" placeholder="Nombre" value={form.nombre_repuesto} onChange={handleChange} required />
            <input name="cantidad_disponible" type="number" placeholder="Cantidad" value={form.cantidad_disponible} onChange={handleChange} required />
            <input name="costo_unitario" type="number" placeholder="Costo" value={form.costo_unitario} onChange={handleChange} required />
            <button type="submit">Guardar</button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
    );
}