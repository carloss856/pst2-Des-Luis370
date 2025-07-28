import React, { useEffect, useState } from "react";
import { getRepuestos } from "../services/repuestos";
import { getInventario } from "../services/inventario";

const Inventario = () => {
  const [repuestos, setRepuestos] = useState([]);
  const [inventario, setInventario] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [repuestosRes, inventarioRes] = await Promise.all([
        getRepuestos(),
        getInventario()
      ]);
      setRepuestos(repuestosRes);
      setInventario(inventarioRes);
    };
    fetchData();
  }, []);

  const getNombreRepuesto = (id) => {
    const rep = repuestos.find(r => r.id_repuesto === id);
    return rep ? rep.nombre_repuesto : id;
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
      <h2 className="mb-4 text-white">Inventario</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr className="text-center">
              <th>Repuesto</th>
              <th>Cantidad Disponible</th>
              <th>Nivel Crítico</th>
              <th>Última Actualización</th>
            </tr>
          </thead>
          <tbody>
            {inventario.map((item) => (
              <tr key={`${item.id_inventario}-${item.id_repuesto}`} className="text-center">
                <td>{getNombreRepuesto(item.id_repuesto)}</td>
                <td>{item.cantidad_disponible}</td>
                <td>{item.nivel_critico}</td>
                <td>{item.ultima_actualizacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventario;