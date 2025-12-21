import React, { useState, useRef, useEffect } from 'react';
import './Select.css';

const Select = ({ value, onChange, options, placeholder = '请选择', disabled = false, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="select-wrapper" ref={selectRef}>
      {label && <label className="select-label">{label}</label>}
      <div 
        className={`custom-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="select-display">
          <span className={value ? 'select-text' : 'select-placeholder'}>
            {displayText}
          </span>
          <span className="select-arrow">▾</span>
        </div>
        
        {isOpen && !disabled && (
          <div className="select-dropdown">
            {!value && (
              <div 
                className="select-option placeholder-option"
                onClick={() => handleSelect('')}
              >
                {placeholder}
              </div>
            )}
            {options.map((option) => (
              <div
                key={option.value}
                className={`select-option ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Select;






