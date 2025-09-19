import React, { useEffect, useState } from 'react';
import { getEquipo, updateEquipo } from '../../services/equipos';
import { getUsuarios } from '../../services/usuarios';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropiedadEquipoByEquipo } from '../../services/propiedadEquipo';

const EquipoEditForm = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    tipo_equipo: '',
    marca: '',
    modelo: '',
    id_asignado: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [creador, setCreador] = useState('');
  const [loading, setLoading] = useState(true);

  const id_persona = localStorage.getItem('id_usuario');
  const rol = localStorage.getItem('rol_usuario');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const equipoData = await getEquipo(id);
        setForm({
          tipo_equipo: equipoData.tipo_equipo,
          marca: equipoData.marca,
          modelo: equipoData.modelo,
          id_asignado: ''
        });
        setCreador(String(equipoData.id_persona));
        const propiedad = await getPropiedadEquipoByEquipo(id);
        if (propiedad && propiedad.id_persona) {
          setForm(f => ({ ...f, id_asignado: propiedad.id_persona }));
        }
        const usuariosData = await getUsuarios();
        setUsuarios(usuariosData);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar datos del equipo');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Redirige si no es propio ni gerente/administrador
  useEffect(() => {
    if (!loading && !(String(id_persona) === String(creador) || rol === "Administrador" || rol === "Gerente")) {
      navigate('/equipos');
    }
  }, [loading, id_persona, creador, rol, navigate]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await updateEquipo(id, { ...form, id_persona, id_asignado: form.id_asignado });
      navigate('/equipos', { state: { showAlert: true, alertMessage: "Equipo actualizado correctamente" } });
    } catch (err) {
      setError('Error al actualizar el equipo');
    }
  };

  const puedeEditarAsignado = rol === "Administrador" || rol === "Gerente";

  if (loading) return <div className="text-center mt-5">Cargando...</div>;

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <form onSubmit={handleSubmit} className="card p-4" style={{ width: 400 }}>
        <h2 className="text-center mb-4">Editar Equipo</h2>
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
          <label>Asignar a Usuario</label>
          <select
            className="form-select"
            name="id_asignado"
            value={form.id_asignado}
            onChange={handleChange}
            required
            disabled={!puedeEditarAsignado}
          >
            <option value="">Seleccione un usuario</option>
            {usuarios.map(usuario => (
              <option key={usuario.id_persona} value={usuario.id_persona}>
                {usuario.nombre}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary w-100">Actualizar Equipo</button>
        <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => navigate('/equipos')}>Volver</button>
        {error && <div className="alert alert-danger">{error}</div>}
      </form>
    </div>
  );
}

export default EquipoEditForm;