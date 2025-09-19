import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInventario, updateInventario } from '../../services/inventario';
import { getRepuesto } from '../../services/repuestos';

export default function InventarioEditForm() {
  const [formRepuesto, setFormRepuesto] = useState({nombre_repuesto: '', cantidad_disponible: 0, costo_unitario: 0 });
  const [formInventario, setFormInventario] = useState({ cantidad_entrada: 0, nivel_critico: 0, fecha_entrada: '' });

  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    getRepuesto().then(res => setFormRepuesto(res));
    getInventario(id).then(res => setFormInventario(res));
  }, [id]);

  const handleChange = e => setFormInventario({ ...formInventario, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await updateInventario(id, formInventario);
      navigate('/Inventario');
    } catch (err) {
      setError('Error al actualizar Inventario');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <form onSubmit={handleSubmit} className="card p-4" style={{ width: 400 }}>
        <h2 className="text-center mb-4">Editar Inventario</h2>
        <div className="mb-3">
          <input
            disabled
            name="nombre_repuesto"
            className="form-control"
            placeholder="Nombre"
            value={formRepuesto.nombre_repuesto}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            disabled
            name="cantidad_entrada"
            type="number"
            className="form-control"
            placeholder="Cantidad"
            value={formInventario.cantidad_entrada}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            disabled
            name="costo_unitario"
            type="number"
            className="form-control"
            placeholder="Costo"
            value={formRepuesto.costo_unitario}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary mb-2">Actualizar</button>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/inventario')}>Volver</button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
}