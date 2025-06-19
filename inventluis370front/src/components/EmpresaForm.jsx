import React, { useState } from 'react';
import { createEmpresa } from '../services/empresas';
import { useNavigate } from 'react-router-dom';

const EmpresaForm = () => {
    const [form, setForm] = useState({
        nombre_empresa: '',
        direccion: '',
        telefono: '',
        email: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await createEmpresa(form);
            navigate('/empresas');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.errors) {
                setError(JSON.stringify(err.response.data.errors, null, 2));
            } else {
                setError('Error al crear empresa');
            }
        }
    };


    return (
        <form onSubmit={handleSubmit}>
        <h2>Nueva empresa</h2>
        <input value={form.nombre_empresa} onChange={handleChange} name="nombre_empresa" placeholder="Nombre" />
        <input value={form.direccion} onChange={handleChange} name="direccion" placeholder="Dirección" />
        <input value={form.telefono} onChange={handleChange} name="telefono" placeholder="Teléfono" />
        <input value={form.email} onChange={handleChange} name="email" placeholder="Email" />
        <button type="submit">Guardar</button>
        {error && <div style={{color:'red'}}>{error}</div>}
        </form>
    );
};

export default EmpresaForm;