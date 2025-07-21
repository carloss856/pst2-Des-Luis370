import React, { useEffect, useState } from "react";
import { getNotificaciones } from '../services/notificaciones';

const NotificacionesList = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      const data = await getNotificaciones();
      setNotificaciones(data);
      setLoading(false);
    };
    fetchNotificaciones();
  }, []);

  const totalPages = Math.ceil(notificaciones.length / perPage);
  const paginated = notificaciones.slice((page - 1) * perPage, page * perPage);

  // Función para mostrar paginación reducida si hay más de 5 páginas
  const renderPagination = () => {
    if (totalPages <= 5) {
      return [...Array(totalPages)].map((_, i) => (
        <li key={i} className={`page-item${page === i + 1 ? " active" : ""}`}>
          <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
        </li>
      ));
    }
    const items = [];
    // Primera página
    items.push(
      <li key={1} className={`page-item${page === 1 ? " active" : ""}`}>
        <button className="page-link" onClick={() => setPage(1)}>1</button>
      </li>
    );
    // Puntos suspensivos si la página actual está lejos del principio
    if (page > 3) {
      items.push(
        <li key="start-ellipsis" className="page-item disabled">
          <span className="page-link">...</span>
        </li>
      );
    }
    // Página anterior, actual y siguiente
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      items.push(
        <li key={i} className={`page-item${page === i ? " active" : ""}`}>
          <button className="page-link" onClick={() => setPage(i)}>{i}</button>
        </li>
      );
    }
    // Puntos suspensivos si la página actual está lejos del final
    if (page < totalPages - 2) {
      items.push(
        <li key="end-ellipsis" className="page-item disabled">
          <span className="page-link">...</span>
        </li>
      );
    }
    // Última página
    items.push(
      <li key={totalPages} className={`page-item${page === totalPages ? " active" : ""}`}>
        <button className="page-link" onClick={() => setPage(totalPages)}>{totalPages}</button>
      </li>
    );
    return items;
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      Cargando notificaciones...
    </div>
  );

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center mt-5" style={{ minHeight: "90vh" }}>
      <h2 className="mb-4">Notificaciones</h2>
      {notificaciones.length === 0 ? (
        <div className="alert alert-info">No hay notificaciones.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-dark">
              <tr className="text-center text-nowrap">
                {/* <th>ID</th>
                <th>ID Servicio</th> */}
                <th>Email Destinatario</th>
                <th>Asunto</th>
                <th>Mensaje</th>
                <th>Fecha Envío</th>
                <th>Estado Envío</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((n) => (
                <tr key={n.id_notificacion} className="text-center text-nowrap">
                  {/* <td>{n.id_notificacion}</td>
                  <td>{n.id_servicio}</td> */}
                  <td>{n.email_destinatario}</td>
                  <td>{n.asunto}</td>
                  <td>{n.mensaje}</td>
                  <td>{n.fecha_envio}</td>
                  <td>{n.estado_envio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mb-2" style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div className="me-5">
          <label className="me-2">Mostrar:</label>
          <select className="form-select d-inline-block w-auto" value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item${page === 1 ? " disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(page - 1)}>&laquo;</button>
              </li>
              {renderPagination()}
              <li className={`page-item${page === totalPages ? " disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(page + 1)}>&raquo;</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default NotificacionesList;