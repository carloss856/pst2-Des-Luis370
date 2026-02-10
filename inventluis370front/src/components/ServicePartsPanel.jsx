import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPartesServicio, addParteServicio, updateParteServicio, deleteParteServicio } from '../services/servicios';
import { canRoute, getRbacCache } from '../utils/rbac';
import LoadingView from "./LoadingView";

export default function ServicePartsPanel({ servicioId: propServicioId }) {
  const { id: routeId } = useParams();
  const servicioId = propServicioId || routeId;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState({ partes_trabajo: [], costo_mano_obra: 0, tiempo_total_minutos: 0 });
  const [form, setForm] = useState({ tipo_tarea: 'software', minutos: 60, notas: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!servicioId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getPartesServicio(servicioId);
      setData(res);
    } catch (e) {
      setError(e?.response?.data?.message || 'Error cargando partes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [servicioId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'minutos' ? Number(value) : value }));
  };

  const onAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await addParteServicio(servicioId, form);
      setForm({ tipo_tarea: 'software', minutos: 60, notas: '' });
      await load();
    } catch (e) {
      if (e?.response?.status === 403) {
        setError('No tienes permisos para agregar partes en este servicio.');
      } else {
        setError(e?.response?.data?.message || 'Error agregando parte');
      }
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (idParte) => {
    if (!confirm('¿Eliminar parte?')) return;
    setSaving(true);
    setError('');
    try {
      await deleteParteServicio(servicioId, idParte);
      await load();
    } catch (e) {
      if (e?.response?.status === 403) {
        setError('No tienes permisos para eliminar esta parte.');
      } else {
        setError(e?.response?.data?.message || 'Error eliminando parte');
      }
    } finally {
      setSaving(false);
    }
  };

  const rol = localStorage.getItem('rol_usuario');
  const myId = localStorage.getItem('id_usuario');
  const rbac = getRbacCache();
  const canCreate = canRoute(rbac, 'servicios.partes.store');
  const canDeleteByRbac = canRoute(rbac, 'servicios.partes.destroy');

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <strong>Partes de trabajo</strong>
        <small className="text-muted">Tiempo total: {data.tiempo_total_minutos} min · Mano de obra: {data.costo_mano_obra?.toFixed?.(2)} {data.moneda || 'USD'}</small>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {loading ? <LoadingView inline message="Cargando…" /> : (
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Técnico</th>
                  <th>Tipo</th>
                  <th>Minutos</th>
                  <th>Tarifa/h</th>
                  <th>Costo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(data.partes_trabajo || []).map(p => {
                  const canDeleteByBusiness = (rol === 'Administrador' || rol === 'Gerente') || (rol === 'Técnico' && p.id_tecnico && p.id_tecnico === myId);
                  const canDelete = canDeleteByRbac && canDeleteByBusiness;
                  return (
                  <tr key={p.id_parte}>
                    <td>{p.fecha ? new Date(p.fecha).toLocaleString() : '-'}</td>
                    <td>{p.id_tecnico || '-'}</td>
                    <td>{p.tipo_tarea}</td>
                    <td>{p.minutos}</td>
                    <td>{(p.tarifa_hora ?? 0).toFixed(2)} {p.moneda || 'USD'}</td>
                    <td>{(p.costo_linea ?? 0).toFixed(2)} {p.moneda || 'USD'}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-danger" disabled={saving || !canDelete} title={!canDelete ? 'No puedes eliminar esta parte' : ''} onClick={() => onDelete(p.id_parte)}>Eliminar</button>
                    </td>
                  </tr>
                );})}
                {(!data.partes_trabajo || data.partes_trabajo.length === 0) && (
                  <tr><td colSpan={7} className="text-center text-muted">Sin partes registradas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <hr/>
        <form className="row g-2" onSubmit={onAdd}>
          <div className="col-md-3">
            <label className="form-label">Tipo de tarea</label>
            <select className="form-select" name="tipo_tarea" value={form.tipo_tarea} onChange={onChange} disabled={!canCreate}>
              <option value="fisico">Físico</option>
              <option value="software">Software</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Minutos</label>
            <input className="form-control" type="number" min={1} name="minutos" value={form.minutos} onChange={onChange} disabled={!canCreate} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Notas</label>
            <input className="form-control" name="notas" value={form.notas} onChange={onChange} disabled={!canCreate} />
          </div>
          <div className="col-12 text-end">
            <button className="btn btn-primary" disabled={saving || !canCreate} title={!canCreate ? 'No puedes agregar partes' : ''}>Agregar Parte</button>
          </div>
        </form>
      </div>
    </div>
  );
}
