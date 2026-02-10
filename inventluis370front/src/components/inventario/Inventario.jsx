import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRepuestos } from "../../services/repuestos";
import { getInventario } from "../../services/inventario";
import { canModule, getRbacCache } from "../../utils/rbac";
import LoadingView from "../LoadingView";

const Inventario = () => {
  const [repuestos, setRepuestos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);

  const rbac = getRbacCache();
  const canCreate = canModule(rbac, 'inventario', 'store');

  useEffect(() => {
    const fetchData = async () => {
      const [repuestosRes, inventarioRes] = await Promise.all([
        getRepuestos(),
        getInventario()
      ]);
      setRepuestos(repuestosRes);
      setInventario(inventarioRes);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getNombreRepuesto = (id) => {
    const rep = repuestos.find(r => r.id_repuesto === id);
    return rep ? rep.nombre_repuesto : id;
  };

  if (loading) return <LoadingView message="Cargando inventario…" />;

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center h-100">
      <h2 className="mb-4 text-white">Inventario</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr className="text-center">
              <th>Repuesto</th>
              <th>Cantidad Entrada</th>
              <th>Fecha Entrada</th>
              {/* <th>Acciones</th> */}
            </tr>
          </thead>
          <tbody>
            {inventario.map((item) => (
              <tr key={`${item.id_entrada}-${item.id_repuesto}`} className="text-center">
                <td>{getNombreRepuesto(item.id_repuesto)}</td>
                <td>{item.cantidad_entrada}</td>
                <td>{item.fecha_entrada}</td>
                {/* <td>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/inventario/${item.id_inventario}/editar`)}>Editar</button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canCreate && <Link className="btn btn-success mt-3" to="/inventario/crear">Agregar entrada</Link>}
    </div>
  );
};

export default Inventario;