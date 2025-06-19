import React, { useState } from 'react';
import { createEquipo } from '../services/equipos';
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
        await createEquipo({...form, id_persona});
        navigate('/equipos');
      } catch (err) {
          if (err.response && err.response.data && err.response.data.errors) {
              setError(JSON.stringify(err.response.data.errors, null, 2));
          } else {
              setError('Error al crear equipo');
          }
      }
  };


  return (
    <form onSubmit={handleSubmit}>
      <h2>Nuevo Equipo</h2>
      <input value={form.tipo_equipo} onChange={handleChange} name="tipo_equipo" placeholder="Tipo de Equipo" />
      <input value={form.marca} onChange={handleChange} name="marca" placeholder="Marca" />
      <input value={form.modelo} onChange={handleChange} name="modelo" placeholder="Modelo" />
      <button type="submit">Guardar</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
};

export default EquipoForm;