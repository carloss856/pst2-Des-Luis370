import React, { useState, useEffect } from "react";
import { getUsuarios } from "../services/usuarios";
import { getEquipos } from "../services/equipos";
import { getServicios } from "../services/servicios";
import { getRepuestos } from "../services/repuestos";
import { getInventario } from "../services/inventario";
import { getSolicitudes } from "../services/solicitudesRepuestos";
import { getNotificaciones } from "../services/notificaciones";
import { getEmpresas } from "../services/empresas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const entidades = [
  { key: "usuarios", label: "Usuarios", getData: getUsuarios, columns: ["ID_persona", "Nombre", "Email", "Telefono", "Tipo"], idField: "id_persona" },
  { key: "empresas", label: "Empresas", getData: getEmpresas, columns: ["ID_empresa", "Nombre_empresa", "Direccion", "Telefono", "Email"], idField: "id_empresa" },
  { key: "equipos", label: "Equipos", getData: getEquipos, columns: ["ID_equipo", "Tipo_equipo", "Marca", "Modelo", "Usuario"], idField: "id_equipo" },
  { key: "servicios", label: "Servicios", getData: getServicios, columns: ["ID_servicio", "Id_equipo", "codigo_rma", "fecha_ingreso", "problema_reportado", "estado", "costo_estimado", "costo_real"], idField: "id_servicio" },
  { key: "repuestos", label: "Repuestos", getData: getRepuestos, columns: ["ID_repuesto", "Nombre_repuesto", "Cantidad_disponible", "Costo_unitario"], idField: "id_repuesto" },
  { key: "inventario", label: "Inventario", getData: getInventario, columns: ["ID_repuestos", "cantidad_disponible", "nivel_critico", "ultima_actualizacion"], idField: "id_inventario" },
  { key: "solicitudes", label: "Solicitudes", getData: getSolicitudes, columns: ["ID Solicitud", "Repuesto", "Servicio", "Cantidad Solicitada", "Usuario", "Fecha Solicitud", "Estado Solicitud", "Comentarios"], idField: "id_solicitud" },
  { key: "notificaciones", label: "Notificaciones", getData: getNotificaciones, columns: ["ID_notificacion", "Email Destinatario", "Asunto", "Mensaje", "Fecha Envío"], idField: "id_notificacion" },
];

export default function Reportes() {
  const [seleccion, setSeleccion] = useState({});
  const [datos, setDatos] = useState({});
  const [loading, setLoading] = useState({});
  const [visibles, setVisibles] = useState({});
  const [repuestos, setRepuestos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    getRepuestos().then(setRepuestos);
    getUsuarios().then(setUsuarios);
  }, []);

  const getNombreRepuesto = (id) => {
    const rep = repuestos.find(r => r.id_repuesto === id);
    return rep ? rep.nombre_repuesto : id;
  };
  const getNombreUsuario = (id) => {
    const user = usuarios.find(u => u.id_persona === id);
    return user ? user.nombre : id;
  };

  const toggleVisible = (key) => {
    setVisibles((prev) => {
      const nuevo = { ...prev, [key]: !prev[key] };
      if (nuevo[key] && !datos[key]) cargarDatos(key);
      return nuevo;
    });
  };

  const cargarDatos = async (key) => {
    if (!datos[key]) {
      setLoading((prev) => ({ ...prev, [key]: true }));
      const entidad = entidades.find(e => e.key === key);
      const data = await entidad.getData();
      setDatos((prev) => ({ ...prev, [key]: data }));
      setSeleccion((prev) => ({ ...prev, [key]: [] }));
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const seleccionarTodos = (key) => {
    setSeleccion((prev) => ({
      ...prev,
      [key]: datos[key].map(item => item[entidades.find(e => e.key === key).idField])
    }));
  };

  const deseleccionarTodos = (key) => {
    setSeleccion((prev) => ({ ...prev, [key]: [] }));
  };

  const toggleSeleccion = (key, id) => {
    setSeleccion((prev) => {
      const actual = prev[key] || [];
      return {
        ...prev,
        [key]: actual.includes(id)
          ? actual.filter(i => i !== id)
          : [...actual, id]
      };
    });
  };

  // Devuelve true si hay al menos un seleccionado en cualquier entidad visible
  const haySeleccionados = entidades.some(
    entidad => visibles[entidad.key] && seleccion[entidad.key] && seleccion[entidad.key].length > 0
  );

  // Exportar a Excel (todas las entidades seleccionadas)
  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();
    entidades.forEach(entidad => {
      if (visibles[entidad.key] && seleccion[entidad.key]?.length > 0) {
        let seleccionados = datos[entidad.key]
          .filter(item => seleccion[entidad.key].includes(item[entidad.idField]));
        if (entidad.key === "solicitudes") {
          seleccionados = seleccionados.map(item => ({
            "ID Solicitud": item.id_solicitud,
            "Repuesto": getNombreRepuesto(item.id_repuesto),
            "Servicio": item.id_servicio,
            "Cantidad Solicitada": item.cantidad_solicitada,
            "Usuario": getNombreUsuario(item.id_usuario),
            "Fecha Solicitud": item.fecha_solicitud,
            "Estado Solicitud": item.estado_solicitud,
            "Comentarios": item.comentarios
          }));
        } else if (entidad.key === "equipos") {
          seleccionados = seleccionados.map(item => ({
            "ID_equipo": item.id_equipo,
            "Tipo_equipo": item.tipo_equipo,
            "Marca": item.marca,
            "Modelo": item.modelo,
            "Usuario": getNombreUsuario(item.usuario)
          }));
        } else {
          seleccionados = seleccionados.map(item => {
            const obj = {};
            entidad.columns.forEach(col => {
              obj[col] = item[col.toLowerCase().replace(/ /g, "_")];
            });
            return obj;
          });
        }
        const ws = XLSX.utils.json_to_sheet(seleccionados);
        XLSX.utils.book_append_sheet(wb, ws, entidad.label);
      }
    });
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `reporte.xlsx`);
  };

  // Exportar a PDF (todas las entidades seleccionadas)
  const exportarPDF = () => {
    const doc = new jsPDF();
    let y = 10;
    entidades.forEach(entidad => {
      if (visibles[entidad.key] && seleccion[entidad.key]?.length > 0) {
        doc.text(`Reporte de ${entidad.label}`, 14, y);
        let body = [];
        if (entidad.key === "solicitudes") {
          body = datos[entidad.key]
            .filter(item => seleccion[entidad.key].includes(item[entidad.idField]))
            .map(item => [
              item.id_solicitud,
              getNombreRepuesto(item.id_repuesto),
              item.id_servicio,
              item.cantidad_solicitada,
              getNombreUsuario(item.id_usuario),
              item.fecha_solicitud,
              item.estado_solicitud,
              item.comentarios
            ]);
        } if (entidad.key === "equipos") {
          body = datos[entidad.key]
            .filter(item => seleccion[entidad.key].includes(item[entidad.idField]))
            .map(item => [
              item.id_equipo,
              item.tipo_equipo,
              item.marca,
              item.modelo,
              getNombreUsuario(item.usuario)
            ]);
        } else {
          body = datos[entidad.key]
            .filter(item => seleccion[entidad.key].includes(item[entidad.idField]))
            .map(item => entidad.columns.map(col => item[col.toLowerCase().replace(/ /g, "_")] ?? ""));
        }
        autoTable(doc, {
          head: [entidad.columns],
          body,
          startY: y + 5
        });
        y = doc.lastAutoTable.finalY + 10;
      }
    });
    doc.save(`reporte.pdf`);
  };

  return (
    <div>
      <h2>Generar Reportes</h2>
      <div style={{ marginBottom: 20 }}>
        {entidades.map(entidad => (
          <label key={entidad.key} style={{ marginRight: 20, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={!!visibles[entidad.key]}
              onChange={() => toggleVisible(entidad.key)}
              style={{ marginRight: 5 }}
            />
            {entidad.label}
          </label>
        ))}
      </div>
      {entidades.map(entidad => (
        visibles[entidad.key] && (
          <div key={entidad.key} style={{ marginBottom: 40 }}>
            <h3>
              {entidad.label}{" "}
              <button onClick={() => cargarDatos(entidad.key)} disabled={loading[entidad.key]}>
                {datos[entidad.key] ? "Recargar" : "Cargar"}
              </button>
            </h3>
            {datos[entidad.key] && (
              <>
                <button onClick={() => seleccionarTodos(entidad.key)}>Seleccionar todos</button>
                <button onClick={() => deseleccionarTodos(entidad.key)} style={{ marginLeft: 8 }}>Deseleccionar todos</button>
                <table border={1} cellPadding={5} style={{ marginTop: 10 }}>
                  <thead>
                    <tr>
                      <th>Seleccionar</th>
                      {entidad.columns.map(col => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(datos[entidad.key]) ? datos[entidad.key] : []).map(item => (
                      <tr key={item[entidad.idField]}>
                        <td>
                          <input
                            type="checkbox"
                            checked={(seleccion[entidad.key] || []).includes(item[entidad.idField])}
                            onChange={() => toggleSeleccion(entidad.key, item[entidad.idField])}
                          />
                        </td>
                        {entidad.key === "equipos"
                          ? (
                            <>
                              <td key="id_equipo">{item.id_equipo}</td>
                              <td key="tipo_equipo">{item.tipo_equipo}</td>
                              <td key="marca">{item.marca}</td>
                              <td key="modelo">{item.modelo}</td>
                              <td key="usuario">{getNombreUsuario(item.id_persona)}</td>
                            </>
                          )
                          : entidad.key === "solicitudes"
                            ? (
                              <>
                                <td key="id_solicitud">{item.id_solicitud}</td>
                                <td key="repuesto">{getNombreRepuesto(item.id_repuesto)}</td>
                                <td key="servicio">{item.id_servicio}</td>
                                <td key="cantidad_solicitada">{item.cantidad_solicitada}</td>
                                <td key="usuario">{getNombreUsuario(item.id_usuario)}</td>
                                <td key="fecha_solicitud">{item.fecha_solicitud}</td>
                                <td key="estado_solicitud">{item.estado_solicitud}</td>
                                <td key="comentarios">{item.comentarios}</td>
                              </>
                            )
                            : entidad.columns.map((col, idx) => (
                              <td key={item[entidad.idField] + '-' + idx}>
                                {item[col.toLowerCase().replace(/ /g, "_")]}
                              </td>
                            ))
                        }
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 10 }}>
                  <strong>Seleccionados: {seleccion[entidad.key]?.length || 0}</strong>
                </div>
              </>
            )}
          </div>
        )
      ))}
      <div style={{ marginTop: 30 }}>
        <button
          onClick={exportarExcel}
          disabled={!haySeleccionados}
          style={{ marginRight: 16 }}
        >
          Exportar a Excel
        </button>
        <button
          onClick={exportarPDF}
          disabled={!haySeleccionados}
        >
          Exportar a PDF
        </button>
      </div>
    </div>
  );
}