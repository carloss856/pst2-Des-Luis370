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

  // Función para obtener el nombre del repuesto por id
  const getNombreRepuesto = (id) => {
    const rep = repuestos.find(r => r.id_repuesto === id);
    return rep ? rep.nombre_repuesto : id;
  };

  return (
    <div>
      <h1>Inventario</h1>
      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>Repuesto</th>
            <th>Cantidad Disponible</th>
            <th>Nivel Crítico</th>
            <th>Última Actualización</th>
          </tr>
        </thead>
        <tbody>
          {inventario.map((item) => (
            <tr key={`${item.id_inventario}-${item.id_repuesto}`}>
              <td>{getNombreRepuesto(item.id_repuesto)}</td>
              <td>{item.cantidad_disponible}</td>
              <td>{item.nivel_critico}</td>
              <td>{item.ultima_actualizacion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventario;