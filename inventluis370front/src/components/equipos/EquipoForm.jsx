import React, { useState, useEffect } from 'react';
import { createEquipo } from '../../services/equipos';
import { useNavigate } from 'react-router-dom';
import { getUsuarios } from '../../services/usuarios';

const EquipoForm = () => {
  const [form, setForm] = useState({
    tipo_equipo: '',
    marca: '',
    modelo: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const id_persona = localStorage.getItem('id_usuario');

  useEffect(() => {
    getUsuarios().then(setUsuarios);
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await createEquipo({ ...form, id_persona, id_asignado: form.id_asignado });
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
          <label>Tipo de Equipo</label>
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
          <label>Marca</label>
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
          <label>Modelo</label>
          <input
            className="form-control"
            value={form.modelo}
            onChange={handleChange}
            name="modelo"
            placeholder="Modelo"
            required
          />
        </div>
        <div className="mb-3">
          <label>Asignar a usuario</label>
          <select
            name="id_asignado"
            className="form-select"
            value={form.id_asignado || ""}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un usuario</option>
            {usuarios.map(u => (
              <option key={u.id_persona} value={u.id_persona}>{u.nombre}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-success mb-2">Guardar</button>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/equipos')}>Volver</button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
};

export default EquipoForm;