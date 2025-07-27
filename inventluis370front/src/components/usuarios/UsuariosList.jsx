import React, { useEffect, useState } from 'react';
import { getUsuarios, deleteUsuario } from '../../services/usuarios';

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const rol = localStorage.getItem('rol');

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

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      Cargando...
    </div>
  );

  return (
        <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
      <h2 className="mb-4 text-white">Usuarios</h2>
      <div className="table-responsive w-100">
                <table className="table table-bordered table-striped align-middle">
                    <thead className="table-dark">
            <tr className="text-center">
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id_persona} className="text-center">
                <td>{usuario.nombre}</td>
                <td>{usuario.email}</td>
                <td>{usuario.telefono}</td>
                <td>{usuario.tipo}</td>
                <td>
                  <a className="btn btn-sm btn-primary me-2" href={`/usuarios/${usuario.id_persona}/editar`}>Editar</a>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(usuario.id_persona)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a className="btn btn-success mt-3" href="/usuarios/crear">Crear usuario</a>
    </div>
  );
}