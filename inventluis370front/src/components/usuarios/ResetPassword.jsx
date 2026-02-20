import React, { useState } from 'react';
import { solicitarToken } from '../../services/password';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    setErr('');
    setLoading(true);
    try {
      const res = await solicitarToken(email);
      setMsg(res.data.message || 'Correo enviado (si existe). Revisa tu bandeja.');
    } catch (e) {
      setErr(e.response?.data?.error || 'Error al enviar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight:'80vh' }}>
      <form onSubmit={handleSubmit} className="card p-4 auth-form" style={{ maxWidth: 420, width: '100%' }}>
        <h4 className="mb-3 text-center">Recuperar contraseña</h4>
        <div className="mb-3">
          <label className="form-label">Correo</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" className="btn btn-success w-100 mb-2" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
        <button
          type="button"
          className="btn btn-secondary w-100"
          onClick={() => navigate('/login')}
          disabled={loading}
        >
          Volver
        </button>
        {msg && <div className="alert alert-success mt-3">{msg}</div>}
        {err && <div className="alert alert-danger mt-3">{err}</div>}
      </form>
    </div>
  );
}
