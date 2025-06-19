import React, { useEffect, useState } from 'react';
import api from '../services/api';
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
      .then(() => navigate('/equipos'));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Editar Equipo</h2>
      <input value={form.tipo_equipo} onChange={e => setForm({ ...form, tipo_equipo: e.target.value })} placeholder="Tipo de Equipo" required />
      <input value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} placeholder="Marca" />
      <input value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} placeholder="Modelo" />
      <button type="submit">Actualizar</button>
      <button type="button" onClick={() => navigate('/equipos')}>Volver</button>
    </form>
  );
};

export default EquipoEditForm;