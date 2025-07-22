import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

const EquipoEditForm = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    tipo_equipo: '',
    marca: '',
    modelo: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/equipos/${id}`)
      .then(res => {
        setForm({
          tipo_equipo: res.data.tipo_equipo,
          marca: res.data.marca,
          modelo: res.data.modelo
        });
      });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    api.put(`/equipos/${id}`, form)
      .then(() => navigate('/equipos', { state: { showAlert: true, alertMessage: "Equipo actualizado correctamente" } }));
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <form onSubmit={handleSubmit} className="card p-4" style={{ width: 400 }}>
        <h2 className="text-center mb-4">Editar Equipo</h2>
        <div className="mb-3">
          <label className="form-label" htmlFor='tipo_equipo'>Tipo de Equipo</label>
          <input
            className="form-control"
            value={form.tipo_equipo}
            onChange={e => setForm({ ...form, tipo_equipo: e.target.value })}
            placeholder="Tipo de Equipo"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor='marca'>Marca</label>
          <input
            className="form-control"
            value={form.marca}
            onChange={e => setForm({ ...form, marca: e.target.value })}
            placeholder="Marca"
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor='modelo'>Modelo</label>
          <input
            className="form-control"
            value={form.modelo}
            onChange={e => setForm({ ...form, modelo: e.target.value })}
            placeholder="Modelo"
          />
        </div>
        <button type="submit" className="btn btn-primary mb-2">Actualizar</button>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/equipos')}>Volver</button>
      </form>
    </div>
  );
};

export default EquipoEditForm;