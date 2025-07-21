import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getRepuestos, deleteRepuesto } from '../../services/repuestos';

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
    
    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            Cargando...
        </div>
    );
    
    return (
        <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
            <h2 className="mb-4">Repuestos</h2>
            <div className="table-responsive w-100">
                <table className="table table-bordered table-striped align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th className="text-center">Nombre</th>
                            <th className="text-center">Cantidad</th>
                            <th className="text-center">Costo</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {repuestos.map(repuesto => (
                            <tr key={repuesto.id_repuesto}>
                                <td className="text-center">{repuesto.nombre_repuesto}</td>
                                <td className="text-center">{repuesto.cantidad_disponible}</td>
                                <td className="text-center">{repuesto.costo_unitario}</td>
                                <td className="text-center">
                                    <a className="btn btn-sm btn-primary me-2" href={`/repuestos/${repuesto.id_repuesto}/editar`}>Editar</a>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(repuesto.id_repuesto)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <a className="btn btn-success mt-3" href="/repuestos/crear">Crear Repuesto</a>
        </div>
    );
}