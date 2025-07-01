import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getRepuestos, deleteRepuesto } from '../services/repuestos';

export default function RepuestosList() {
    const [repuestos, setRepuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        getRepuestos()
        .then(res => {
            setRepuestos(res);
            setLoading(false);
        })
        .catch(() => setLoading(false));
    }, []);
    
    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar este repuesto?')) return;
        try {
        await deleteRepuesto(id);
        setRepuestos(repuestos.filter(r => r.id_repuesto !== id));
        } catch (err) {
        alert('Error al eliminar el repuesto');
        }
    };
    
    if (loading) return <div>Cargando...</div>;
    
    return (
        <div>
        <h2>Repuestos</h2>
        <table border={1} cellPadding={5}>
            <thead>
            <tr>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Costo</th>
                <th>Acciones</th>
            </tr>
            </thead>
            <tbody>
            {repuestos.map(repuesto => (
                <tr key={repuesto.id_repuesto}>
                <td>{repuesto.nombre_repuesto}</td>
                <td>{repuesto.cantidad_disponible}</td>
                <td>{repuesto.costo_unitario}</td>
                <td>
                    <a href={`/repuestos/${repuesto.id_repuesto}/editar`}>Editar</a> | 
                    <button onClick={() => handleDelete(repuesto.id_repuesto)}>Eliminar</button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        <a href="/repuestos/crear">Crear Repuesto</a>
        </div>
    );

}