import React, { useEffect, useState } from "react";
import { getNotificaciones } from '../services/notificaciones';


const NotificacionesList = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      const data = await getNotificaciones();
      setNotificaciones(data);
      setLoading(false);
    };

    fetchNotificaciones();
  }, []);

  if (loading) return <div>Cargando notificaciones...</div>;

  return (
    <div>
      <h2>Notificaciones</h2>
      {notificaciones.length === 0 ? (
        <p>No hay notificaciones.</p>
      ) : (
        <table border={1} cellPadding={5}>
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Servicio</th>
              <th>Email Destinatario</th>
              <th>Asunto</th>
              <th>Mensaje</th>
              <th>Fecha Envío</th>
              <th>Estado Envío</th>
            </tr>
          </thead>
          <tbody>
            {notificaciones.map((n) => (
              <tr key={n.id_notificacion}>
                <td>{n.id_notificacion}</td>
                <td>{n.id_servicio}</td>
                <td>{n.email_destinatario}</td>
                <td>{n.asunto}</td>
                <td>{n.mensaje}</td>
                <td>{n.fecha_envio}</td>
                <td>{n.estado_envio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default NotificacionesList;