import React, { useState } from 'react';
import { createEmpresa } from '../../services/empresas';
import { useNavigate } from 'react-router-dom';
import ModalAlert from '../ModalAlert';

const EmpresaForm = () => {
    const [form, setForm] = useState({
        nombre_empresa: '',
        direccion: '',
        telefono: '',
        email: '',
    });
    const [alert, setAlert] = useState({ type: "", message: "" });
    const navigate = useNavigate();

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await createEmpresa(form);
            navigate('/empresas', { state: { showAlert: true } });
        } catch (err) {
            let msg = "Error al crear empresa";
            if (err.response && err.response.data && err.response.data.errors) {
                msg = Object.values(err.response.data.errors).flat().join(" ");
            }
            setAlert({ type: "danger", message: msg });
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <form onSubmit={handleSubmit} className="card p-4" style={{ width: 400 }}>
                <h2 className="text-center mb-4">Nueva empresa</h2>
                <div className="mb-3">
                    <label htmlFor="nombre_empresa">Nombre de la Empresa</label>
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
                    <label htmlFor="direccion">Dirección</label>
                    <input
                        className="form-control"
                        value={form.direccion}
                        onChange={handleChange}
                        name="direccion"
                        placeholder="Dirección"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                        className="form-control"
                        value={form.telefono}
                        onChange={handleChange}
                        name="telefono"
                        placeholder="Teléfono"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="email">Email</label>
                    <input
                        className="form-control"
                        value={form.email}
                        onChange={handleChange}
                        name="email"
                        placeholder="Email"
                    />
                </div>
                <button type="submit" className="btn btn-success mb-2">Guardar</button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/empresas')}>Volver</button>
            </form>
            <ModalAlert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ type: "", message: "" })}
            />
        </div>
    );
};

export default EmpresaForm;