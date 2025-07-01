import React, { useEffect, useState } from 'react';
import { getUsuarios, deleteUsuario } from '../services/usuarios';

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarUsuarios = () => {
    getUsuarios()
      .then(data => {
        setUsuarios(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar usuario?')) {
      await deleteUsuario(id);
      cargarUsuarios();
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Usuarios</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            {/* <th>ID</th> */}
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(usuario => (
            <tr key={usuario.id_persona}>
              {/* <td>{usuario.id_persona}</td> */}
              <td>{usuario.nombre}</td>
              <td>{usuario.email}</td>
              <td>{usuario.telefono}</td>
              <td>{usuario.tipo}</td>
              <td>
                <a href={`/usuarios/${usuario.id_persona}/editar`}>Editar</a>
                <button onClick={() => handleDelete(usuario.id_persona)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href="/usuarios/crear">Crear usuario</a>
    </div>
  );
}