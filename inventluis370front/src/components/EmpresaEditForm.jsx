import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';

const EmpresaEditForm = () => {
    const { id } = useParams();
    const [form, setForm] = useState({
        nombre_empresa: '',
        direccion: '',
        telefono: '',
        email: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        api.get(`/empresas/${id}`)
            .then(res => {
                setForm({
                    nombre_empresa: res.data.nombre_empresa,
                    direccion: res.data.direccion,
                    telefono: res.data.telefono,
                    email: res.data.email
                });
            });
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        api.put(`/empresas/${id}`, form)
            .then(() => navigate('/empresas'));
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Editar Empresa</h2>
            <input value={form.nombre_empresa} onChange={e => setForm({ ...form, nombre_empresa: e.target.value })} placeholder="Nombre de la Empresa" required />
            <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} placeholder="Dirección" />
            <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="Teléfono" />
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" />
            <button type="submit">Actualizar</button>
            <button type="button" onClick={() => navigate('/empresas')}>Volver</button>
        </form>
    );
};

export default EmpresaEditForm;