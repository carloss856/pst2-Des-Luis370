import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingView from "../LoadingView";

const TIPOS = [
  { value: "servicios", label: "Servicios" },
  { value: "repuestos", label: "Repuestos" },
  { value: "solicitudes_repuesto", label: "Solicitudes de repuesto" },
  { value: "equipos", label: "Equipos" },
  { value: "empresa", label: "Empresas" },
  { value: "inventario", label: "Inventario" },
  { value: "garantias", label: "Garantías" },
  { value: "reportes", label: "Reportes" },
  { value: "usuarios", label: "Usuarios" },
  { value: "notificaciones", label: "Notificaciones generales" },
];

export default function NotificacionesConfigForm() {
  const id_usuario = localStorage.getItem("id_usuario");
  const [recibir, setRecibir] = useState(true);
  const [tipos, setTipos] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/usuarios/${id_usuario}/notificaciones`)
      .then(res => {
        setRecibir(res.data.recibir_notificaciones);
        setTipos(res.data.tipos_notificacion || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id_usuario]);

  const handleTipoChange = (tipo) => {
    setTipos(tipos.includes(tipo)
      ? tipos.filter(t => t !== tipo)
      : [...tipos, tipo]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg(""); setErr("");
    try {
      await api.post(`/usuarios/${id_usuario}/notificaciones`, {
        recibir_notificaciones: recibir,
        tipos_notificacion: tipos,
      });
      setMsg("Configuración guardada correctamente.");
    } catch {
      setErr("Error al guardar configuración.");
    }
  };

  if (loading) return <LoadingView message="Cargando configuración…" />;

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <form onSubmit={handleSubmit} className="card p-4" style={{ maxWidth: "80%", width: "100%" }}>
        <h4 className="mb-3 text-center">Configuración de notificaciones</h4>
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="recibir"
            checked={recibir}
            onChange={e => setRecibir(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="recibir">
            Recibir notificaciones por correo
          </label>
        </div>
        {recibir && (
          <div className="mb-3">
            <label className="form-label">¿Qué notificaciones deseas recibir?</label>
            {TIPOS.map(t => (
              <div className="form-check" key={t.value}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={t.value}
                  checked={tipos.includes(t.value)}
                  onChange={() => handleTipoChange(t.value)}
                />
                <label className="form-check-label" htmlFor={t.value}>{t.label}</label>
              </div>
            ))}
          </div>
        )}
        <button className="btn btn-success w-100">Guardar</button>
        {msg && <div className="alert alert-success mt-3">{msg}</div>}
        {err && <div className="alert alert-danger mt-3">{err}</div>}
      </form>
    </div>
  );
}