import React, { useState, useRef, useEffect } from 'react';
import './Select.css';

const Select = ({ value, onChange, options, placeholder = '请选择', disabled = false, label, searchable = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 打开时聚焦搜索框
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredOptions = searchable && searchTerm
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

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
            {searchable && (
              <div
                className="select-search-container"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  className="select-search-input"
                  placeholder="搜索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
            {!value && !searchTerm && (
              <div
                className="select-option placeholder-option"
                onClick={() => handleSelect('')}
              >
                {placeholder}
              </div>
            )}
            {filteredOptions.length === 0 ? (
              <div className="select-option placeholder-option" style={{ cursor: 'default' }}>
                {searchable ? '无匹配项' : '暂无选项'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`select-option ${value === option.value ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Select;
