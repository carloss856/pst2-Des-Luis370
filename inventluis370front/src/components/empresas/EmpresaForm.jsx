import React, { useState } from 'react';
import { createEmpresa } from '../../services/empresas';
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
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <form onSubmit={handleSubmit} className="card p-4" style={{ width: 400 }}>
                <h2 className="text-center mb-4">Nueva empresa</h2>
                <div className="mb-3">
                    <input
                        className="form-control"
                        value={form.nombre_empresa}
                        onChange={handleChange}
                        name="nombre_empresa"
                        placeholder="Nombre"
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        className="form-control"
                        value={form.direccion}
                        onChange={handleChange}
                        name="direccion"
                        placeholder="Dirección"
                    />
                </div>
                <div className="mb-3">
                    <input
                        className="form-control"
                        value={form.telefono}
                        onChange={handleChange}
                        name="telefono"
                        placeholder="Teléfono"
                    />
                </div>
                <div className="mb-3">
                    <input
                        className="form-control"
                        value={form.email}
                        onChange={handleChange}
                        name="email"
                        placeholder="Email"
                    />
                </div>
                <button type="submit" className="btn btn-success mb-2">Guardar</button>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/empresas')}>Volver</button>
            </form>
        </div>
    );
};

export default EmpresaForm;