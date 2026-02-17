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
}) {
  return (
    <div className={`form-floating mb-3 ${className}`}>
      <input
        type={type}
        id={id}
        className="form-control bg-white color-dark"
        placeholder={label}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
