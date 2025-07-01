import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { getRepuesto, updateRepuesto } from '../services/repuestos';

export default function RepuestoEditForm() {
  const [form, setForm] = useState({ nombre_repuesto: '', cantidad_disponible: 0, costo_unitario: 0 });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    getRepuesto(id).then(res => setForm(res));
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await updateRepuesto(id, form);
      navigate('/repuestos');
    } catch (err) {
      setError('Error al actualizar repuesto');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Editar Repuesto</h2>
      <input name="nombre_repuesto" placeholder="Nombre" value={form.nombre_repuesto} onChange={handleChange} required />
      <input name="cantidad_disponible" type="number" placeholder="Cantidad" value={form.cantidad_disponible} onChange={handleChange} required />
      <input name="costo_unitario" type="number" placeholder="Costo" value={form.costo_unitario} onChange={handleChange} required />
      <button type="submit">Actualizar</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );

}