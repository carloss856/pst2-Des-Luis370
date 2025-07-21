import React, { useEffect, useState } from 'react';
import api from '../../services/api';

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
      setEquipos(equipos.filter(e => e.id_equipo !== id));
    } catch (err) {
      alert('Error al eliminar el equipo');
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      Cargando...
    </div>
  );

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
      <h2 className="mb-4">Equipos</h2>
      <div className="table-responsive w-100">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr>
              <th className="text-center">Tipo de Equipo</th>
              <th className="text-center">Marca</th>
              <th className="text-center">Modelo</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {equipos.map(equipo => (
              <tr key={equipo.id_equipo || equipo.id}>
                <td className="text-center">{equipo.tipo_equipo}</td>
                <td className="text-center">{equipo.marca}</td>
                <td className="text-center">{equipo.modelo}</td>
                <td className="text-center">
                  <a className="btn btn-sm btn-primary me-2" href={`/equipos/${equipo.id_equipo}/editar`}>Editar</a>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(equipo.id_equipo)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a className="btn btn-success mt-3" href="/equipos/crear">Nuevo Equipo</a>
    </div>
  );
};

export default EquiposList;