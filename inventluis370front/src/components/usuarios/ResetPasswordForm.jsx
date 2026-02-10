import React, { useState } from 'react';
import { resetPassword, verificarToken } from '../../services/password';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ResetPasswordForm() {
  const [params] = useSearchParams();
  // El email llega oculto en el query (no se muestra ni se edita)
  const hiddenEmail = params.get('email') || '';
  const [token, setToken] = useState('');
  const [step, setStep] = useState('token'); // 'token' | 'password'
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    if (!token.trim()) return setErr('Ingrese el token.');
    setLoading(true);
    try {
      // Verifica contra backend (usa email oculto)
      await verificarToken(hiddenEmail, token);
      setMsg('Token válido. Ahora ingrese la nueva contraseña.');
      setStep('password');
    } catch (e) {
      setErr(e.response?.data?.error || 'Token inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    if (password.length < 6) return setErr('La contraseña debe tener mínimo 6 caracteres.');
    if (password !== password2) return setErr('Las contraseñas no coinciden.');
    setLoading(true);
    try {
      const res = await resetPassword(hiddenEmail, token, password);
      setMsg(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (e) {
      setErr(e.response?.data?.error || 'Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight:'80vh' }}>
      <form
        onSubmit={step === 'token' ? handleVerifyToken : handleResetPassword}
        className="card p-4"
        style={{ maxWidth:'80%', width:'100%' }}
      >
        <h4 className="mb-3 text-center">
          {step === 'token' ? 'Validar token de recuperación' : 'Establecer nueva contraseña'}
        </h4>

        {step === 'token' && (
          <>
            <div className="mb-3">
              <label className="form-label">Token recibido</label>
              <input
                className="form-control"
                value={token}
                onChange={e=>setToken(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button
              className="btn btn-primary w-100"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Validando...' : 'Validar Token'}
            </button>
          </>
        )}

        {step === 'password' && (
          <>
            <div className="mb-3">
              <label className="form-label">Nueva contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                required
                minLength={6}
                autoFocus
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirmar contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password2}
                onChange={e=>setPassword2(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button
              className="btn btn-success w-100"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </>
        )}

        {msg && <div className="alert alert-success mt-3 mb-0">{msg}</div>}
        {err && <div className="alert alert-danger mt-3 mb-0">{err}</div>}
      </form>
    </div>
  );
}