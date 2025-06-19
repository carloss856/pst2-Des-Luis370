import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function EmpresasList() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/empresas')
      .then(res => {
        setEmpresas(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta empresa?')) return;
    try {
      await api.delete(`/empresas/${id}`);
      setEmpresas(empresas.filter(e => (e.id_empresa || e.id) !== id));
    } catch (err) {
      alert('Error al eliminar la empresa');
    }
  };
  
  if (loading) return <div>Cargando...</div>;

  return (
    <div>
        <h2>Empresas</h2>
        <table border={1} cellPadding={5}>
            <thead>
                <tr>
                    {/* <th>ID</th> */}
                    <th>Nombre</th>
                    <th>Dirección</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {empresas.map(empresa => (
                <tr key={empresa.id_empresa || empresa.id}>
                    <td>{empresa.nombre_empresa}</td>
                    <td>{empresa.direccion}</td>
                    <td>{empresa.telefono}</td>
                    <td>{empresa.email}</td>
                    <td>
                    <a href={`/empresas/${empresa.id_empresa || empresa.id}/editar`}>Editar</a>
                    <button onClick={() => handleDelete(empresa.id_empresa || empresa.id)}>Eliminar</button>
                    </td>
                </tr>
                ))}
            </tbody>
        </table>
        <a href="/empresas/crear">Crear empresa</a>
    </div>
  );
}