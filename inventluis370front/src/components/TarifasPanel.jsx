import { useEffect, useState } from 'react';
import { listTarifas, createTarifa, updateTarifa, deleteTarifa, getHistorialTarifa } from '../services/tarifas';
import { canModule, canRoute, getRbacCache } from '../utils/rbac';
import LoadingView from "./LoadingView";

export default function TarifasPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ tipo_tarea: 'software', nivel_tecnico: '', tarifa_hora: 25, moneda: 'USD', activo: true, vigente_desde: '' });
  const [hist, setHist] = useState({ id: null, data: null });
  const [saving, setSaving] = useState(false);
  const rol = localStorage.getItem('rol_usuario');
  const rbac = getRbacCache();
  const canCreate = canModule(rbac, 'tarifas-servicio', 'store');
  const canUpdate = canModule(rbac, 'tarifas-servicio', 'update');
  const canDelete = canModule(rbac, 'tarifas-servicio', 'destroy');
  const canHist = canRoute(rbac, 'tarifas-servicio.historial.index');
  const canManage = canCreate || canUpdate || canDelete;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listTarifas();
      setItems(data);
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || 'Error cargando tarifas';
      const detail = e?.response?.data?.detail ? ` | ${JSON.stringify(e.response.data.detail)}` : '';
      // eslint-disable-next-line no-console
      console.warn('[Tarifas] GET /tarifas-servicio error:', status, msg, detail);
      setError(`${msg}${detail}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (name === 'tarifa_hora' ? Number(value) : value) }));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createTarifa(form);
      setForm({ tipo_tarea: 'software', nivel_tecnico: '', tarifa_hora: 25, moneda: 'USD', activo: true, vigente_desde: '' });
      await load();
    } catch (e) {
      if (e?.response?.status === 403) {
        setError('No tienes permisos para crear tarifas.');
      } else {
        setError(e?.response?.data?.message || 'Error creando tarifa');
      }
    } finally {
      setSaving(false);
    }
  };

  const onUpdateRate = async (id, tarifa_hora) => {
    setSaving(true);
    setError('');
    try {
      await updateTarifa(id, { tarifa_hora });
      await load();
    } catch (e) {
      if (e?.response?.status === 403) {
        setError('No tienes permisos para editar tarifas.');
      } else {
        setError(e?.response?.data?.message || 'Error actualizando tarifa');
      }
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm('¿Eliminar tarifa?')) return;
    setSaving(true);
    setError('');
    try {
      await deleteTarifa(id);
      await load();
    } catch (e) {
      if (e?.response?.status === 403) {
        setError('No tienes permisos para eliminar tarifas.');
      } else {
        setError(e?.response?.data?.message || 'Error eliminando tarifa');
      }
    } finally {
      setSaving(false);
    }
  };

  const onHist = async (id) => {
    setError('');
    try {
      const data = await getHistorialTarifa(id);
      setHist({ id, data });
    } catch (e) {
      if (e?.response?.status === 403) {
        setError('No tienes permisos para ver el historial de tarifas.');
      } else {
        setError(e?.response?.data?.message || 'Error consultando historial');
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header"><strong>Tarifas de servicio</strong></div>
      <div className="card-body">
        <div className="mb-2 text-muted" style={{fontSize:'0.9em'}}>Rol: {rol || '—'} | Puede gestionar: {canManage ? 'Sí' : 'No'}</div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form className="row g-2" onSubmit={onCreate}>
          <div className="col-md-3">
            <label className="form-label">Tipo de tarea</label>
            <select className="form-select" name="tipo_tarea" value={form.tipo_tarea} onChange={onChange} disabled={!canCreate}>
              <option value="fisico">Físico</option>
              <option value="software">Software</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Nivel</label>
            <input className="form-control" name="nivel_tecnico" value={form.nivel_tecnico} onChange={onChange} placeholder="opcional" disabled={!canCreate} />
          </div>
          <div className="col-md-2">
            <label className="form-label">Tarifa/h</label>
            <input className="form-control" type="number" min={0} step="0.01" name="tarifa_hora" value={form.tarifa_hora} onChange={onChange} disabled={!canCreate} />
          </div>
          <div className="col-md-2">
            <label className="form-label">Moneda</label>
            <input className="form-control" name="moneda" value={form.moneda} onChange={onChange} disabled={!canCreate} />
          </div>
          <div className="col-md-3 d-flex align-items-end gap-2">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="activo" checked={form.activo} onChange={onChange} id="activoChk" disabled={!canCreate} />
              <label className="form-check-label" htmlFor="activoChk">Activo</label>
            </div>
            <button className="btn btn-primary ms-auto" disabled={saving || !canCreate} title={!canCreate ? 'No tienes permiso para crear tarifas' : ''}>Crear</button>
          </div>
        </form>
        <hr/>
        {loading ? <LoadingView inline message="Cargando…" /> : (
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Nivel</th>
                  <th>Tarifa/h</th>
                  <th>Moneda</th>
                  <th>Activo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(t => (
                  <tr key={t.id_tarifa || t._id}>
                    <td>{t.id_tarifa || t._id}</td>
                    <td>{t.tipo_tarea}</td>
                    <td>{t.nivel_tecnico || '-'}</td>
                    <td>
                      <div className="input-group input-group-sm">
                        <input type="number" step="0.01" defaultValue={t.tarifa_hora} className="form-control" id={`rate-${t.id_tarifa || t._id}`} disabled={!canUpdate} />
                        <button className="btn btn-outline-secondary" disabled={saving || !canUpdate} title={!canUpdate ? 'No tienes permiso para editar tarifas' : ''} onClick={() => onUpdateRate(t.id_tarifa || t._id, Number(document.getElementById(`rate-${t.id_tarifa || t._id}`).value))}>Guardar</button>
                      </div>
                    </td>
                    <td>{t.moneda || 'USD'}</td>
                    <td>{t.activo ? 'Sí' : 'No'}</td>
                    <td className="text-end">
                      {canHist && <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onHist(t.id_tarifa || t._id)}>Historial</button>}
                      <button className="btn btn-sm btn-outline-danger" disabled={saving || !canDelete} title={!canDelete ? 'No tienes permiso para eliminar tarifas' : ''} onClick={() => onDelete(t.id_tarifa || t._id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={7} className="text-center text-muted">Sin tarifas</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {hist.data && (
          <div className="mt-3">
            <h6>Historial (tarifa actual + anteriores)</h6>
            <pre className="bg-light p-2 border rounded" style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(hist.data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
