import React from 'react';

export default function LoadingView({ message = 'Cargando…', inline = false }) {
  const style = inline
    ? { minHeight: 'auto', padding: '0.75rem 0' }
    : { minHeight: '60vh' };

  return (
    <div className="d-flex justify-content-center align-items-center" style={style}>
      <div className="text-center text-white">
        <div className="spinner-border text-light" role="status" aria-label="cargando" />
        <div className="mt-2">{message}</div>
      </div>
    </div>
  );
}
