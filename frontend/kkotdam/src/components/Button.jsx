import React from 'react';
import './Button.css';

function Button({ children, variant = 'primary', onClick, disabled, className }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}${className ? ' ' + className : ''}`}
    >
      {children}
    </button>
  );
}

export default Button;
