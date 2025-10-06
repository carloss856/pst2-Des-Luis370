import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ModalConfirm from "../ModalConfirm";
import ModalAlert from "../ModalAlert";
import { getServicios } from "../../services/servicios";
import { getGarantias, deleteGarantia } from "../../services/garantias"; // ← asegúrate de tener este servicio

const GarantiasList = () => {
  const [servicios, setServicios] = useState([]);
  const [garantias, setGarantias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [garantiaAEliminar, setGarantiaAEliminar] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const userId = localStorage.getItem("id_usuario");
  const userRol = localStorage.getItem("rol_usuario");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviciosData, garantiasData] = await Promise.all([
          getServicios(),
          getGarantias(),
        ]);

        setServicios(serviciosData);
        setGarantias(garantiasData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleConfirmDelete = async () => {
    try {
      await deleteGarantia(garantiaAEliminar);
      setGarantias(garantias.filter((g) => g.id_garantia !== garantiaAEliminar));
      setAlert({ type: "success", message: "Garantía eliminada correctamente" });
    } catch (error) {
      console.error("Error eliminando garantía:", error);
      setAlert({ type: "danger", message: "Error al eliminar la garantía" });
    } finally {
      setConfirmOpen(false);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        Cargando...
      </div>
    );

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center h-100">
      <h2 className="mb-4 text-white">Garantías</h2>
      <ModalAlert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />
      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle small">
          <thead className="table-dark">
            <tr className="text-center">
              <th>Servicio</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Observaciones</th>
              <th>Validado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {garantias.map((garantia) => {
              const servicio = servicios.find(
                (s) => s.id_servicio === garantia.id_servicio
              );

              const puedeEditar =
                (userRol === "Administrador" ||
                  userRol === "Gerente" ||
                  String(garantia.id_usuario) === String(userId)) &&
                garantia.validado_por_gerente;

              const puedeEliminar =
                (userRol === "Administrador" || userRol === "Gerente") &&
                garantia.validado_por_gerente;

              return (
                <tr
                  className="text-center"
                  key={garantia.id_garantia || garantia.id_servicio}
                >
                  <td>
                    {servicio
                      ? `${servicio.codigo_rma} - ${servicio.problema_reportado}`
                      : "Sin servicio"}
                  </td>
                  <td>{garantia.fecha_inicio}</td>
                  <td>{garantia.fecha_fin}</td>
                  <td>{garantia.observaciones || ""}</td>
                  <td>{garantia.validado_por_gerente ? "Sí" : "No"}</td>
                  <td
                    className="bg-white text-center"
                    style={{ minWidth: "120px" }}
                  >
                    {(puedeEditar || puedeEliminar) ? (
                      <div className="d-flex flex-row justify-content-center align-items-center gap-2">
                        {puedeEditar && (
                          <a
                            href={`/garantias/${garantia.id_garantia}/editar`}
                            className="btn btn-primary btn-sm"
                          >
                            Editar
                          </a>
                        )}
                        {puedeEliminar && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              setGarantiaAEliminar(garantia.id_garantia);
                              setConfirmOpen(true);
                            }}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">Sin acciones</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ModalConfirm
        show={confirmOpen}
        title="Eliminar Garantía"
        onClose={() => setConfirmOpen(false)}
      >
        <p>¿Seguro que deseas eliminar esta garantía?</p>
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-secondary me-2"
            onClick={() => setConfirmOpen(false)}
          >
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={handleConfirmDelete}>
            Eliminar
          </button>
        </div>
      </ModalConfirm>
    </div>
  );
};

export default GarantiasList;
