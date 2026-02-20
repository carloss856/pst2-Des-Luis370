import React from 'react';

export default function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = true,
  autoComplete,
  className = '',
  actionButton = null,
}) {
  return (
    <div className={`form-floating mb-3 position-relative ${className}`}>
      <input
        type={type}
        id={id}
        className={`form-control ${actionButton ? 'pe-5' : ''}`}
        placeholder={label}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
      />
      <label htmlFor={id}>{label}</label>
      {actionButton && (
        <button
          type="button"
          className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 login-input-action"
          onClick={actionButton.onClick}
          aria-label={actionButton.ariaLabel}
          title={actionButton.title}
        >
          {actionButton.text}
        </button>
      )}
    </div>
  );
}
