import React, { useEffect, useState } from 'react';
import api from '../../services/api';
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
            .then(() => navigate('/empresas', { state: { showAlert: true, alertMessage: "Empresa actualizada correctamente" } }));
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <form onSubmit={handleSubmit} className="card p-4" style={{ width: "100%", maxWidth: "680px" }}>
                <h2 className="text-center mb-4">Editar Empresa</h2>
                <div className="mb-3">
                    <label htmlFor="nombre_empresa">Nombre de la Empresa</label>
                    <input className="form-control" value={form.nombre_empresa} onChange={e => setForm({ ...form, nombre_empresa: e.target.value })} placeholder="Nombre de la Empresa" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="direccion">Direccion</label>
                    <input className="form-control" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} placeholder="Direccion" />
                </div>
                <div className="mb-3">
                    <label htmlFor="telefono">Telefono</label>
                    <input className="form-control" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="Telefono" />
                </div>
                <div className="mb-3">
                    <label htmlFor="email">Email</label>
                    <input className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" />
                </div>
                <button type="submit" className="btn btn-primary mb-2">Actualizar</button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/empresas')}>Volver</button>
            </form>
        </div>
    );
};

export default EmpresaEditForm;

