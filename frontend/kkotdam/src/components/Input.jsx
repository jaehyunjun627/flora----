import React from 'react';
import './Input.css';

function Input({ label, type = 'text', value, onChange, placeholder, error }) {
  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input-field${error ? ' input-error' : ''}`}
      />
      {error && (
        <p className="input-error-msg">{error}</p>
      )}
    </div>
  );
}

export default Input;
