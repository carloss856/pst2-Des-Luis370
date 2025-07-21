import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRepuesto, updateRepuesto } from '../../services/repuestos';

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
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <form onSubmit={handleSubmit} className="card p-4" style={{ width: 400 }}>
        <h2 className="text-center mb-4">Editar Repuesto</h2>
        <div className="mb-3">
          <input
            name="nombre_repuesto"
            className="form-control"
            placeholder="Nombre"
            value={form.nombre_repuesto}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            name="cantidad_disponible"
            type="number"
            className="form-control"
            placeholder="Cantidad"
            value={form.cantidad_disponible}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            name="costo_unitario"
            type="number"
            className="form-control"
            placeholder="Costo"
            value={form.costo_unitario}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary mb-2">Actualizar</button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/repuestos')}>Volver</button>
      </form>
    </div>
  );
}