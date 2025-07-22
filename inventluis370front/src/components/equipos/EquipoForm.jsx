import React, { useState } from 'react';
import { createEquipo } from '../../services/equipos';
import { useNavigate } from 'react-router-dom';

const EquipoForm = () => {
  const [form, setForm] = useState({
    tipo_equipo: '',
    marca: '',
    modelo: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const id_persona = localStorage.getItem('id_usuario');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await createEquipo({ ...form, id_persona });
      navigate('/equipos', { state: { showAlert: true, alertMessage: "Equipo creado correctamente" } });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        setError(Object.values(err.response.data.errors).flat().join(" "));
      } else {
        setError('Error al crear equipo');
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <form onSubmit={handleSubmit} className="card p-4" style={{ width: 400 }}>
        <h2 className="text-center mb-4">Nuevo Equipo</h2>
        <div className="mb-3">
          <input
            className="form-control"
            value={form.tipo_equipo}
            onChange={handleChange}
            name="tipo_equipo"
            placeholder="Tipo de Equipo"
            required
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            value={form.marca}
            onChange={handleChange}
            name="marca"
            placeholder="Marca"
            required
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            value={form.modelo}
            onChange={handleChange}
            name="modelo"
            placeholder="Modelo"
            required
          />
        </div>
        <button type="submit" className="btn btn-success mb-2">Guardar</button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/equipos')}>Volver</button>
      </form>
    </div>
  );
};

export default EquipoForm;