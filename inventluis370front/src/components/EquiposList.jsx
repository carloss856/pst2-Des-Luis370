import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const EquiposList = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/equipos')
      .then(res => {
        setEquipos(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
  
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este equipo?')) return;
    try {
      await api.delete(`/equipos/${id}`);
      setEquipos(equipos.filter(e => (e.id_equipo || e.id) !== id));
    } catch (err) {
      alert('Error al eliminar el equipo');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Equipos</h2>
      <table  border={1} cellPadding={5}>
        <thead>
          <tr>
            {/* <th>ID</th> */}
            <th>Tipo de Equipo</th>
            <th>Marca</th>
            <th>Modelo</th>
            {/* <th>ID Persona</th> */}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {equipos.map(equipo => (
            <tr key={equipo.id_equipo || equipo.id}>
              <td>{equipo.tipo_equipo}</td>
              <td>{equipo.marca}</td>
              <td>{equipo.modelo}</td>
              {/* <td>{equipo.id_persona}</td> */}
              <td>
                <a href={`/equipos/${equipo.id_equipo || equipo.id}/editar`}>Editar</a>
                <button onClick={() => handleDelete(equipo.id_equipo || equipo.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
      <a href="/equipos/crear">Nuevo Equipo</a>
    </div>
  );
};

export default EquiposList;