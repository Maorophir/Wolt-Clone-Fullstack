import React from 'react';

const WoltInput = React.forwardRef(({ label, type, name, value, onChange, placeholder, disabled, error }, ref) => {
    return (
        <div className="wolt-input-group">
            <label className="wolt-label">{label}</label>
            <input
                type={type}
                name={name}
                ref={ref}
                value={value}
                onChange={onChange}
                className="wolt-input"
                placeholder={placeholder}
                disabled={disabled}
            />
            {error && <span style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
        </div>
    );
});

export default WoltInput;