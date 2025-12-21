import React from 'react';
import './Button.css';

const Button = ({ children, onClick, type = 'primary', disabled = false, fullWidth = false, size = 'medium' }) => {
  return (
    <button
      className={`btn btn-${type} btn-${size} ${fullWidth ? 'btn-full' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;










