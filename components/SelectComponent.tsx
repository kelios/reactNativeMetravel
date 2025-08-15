import React from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    label?: string;
    options?: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
}

const SelectComponent: React.FC<SelectProps> = ({
                                                    label,
                                                    options = [],
                                                    value = '',
                                                    onChange,
                                                    placeholder = 'Выберите...',
                                                }) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onChange?.(event.target.value);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {label && <label style={{ fontWeight: 500 }}>{label}</label>}
            <select value={value} onChange={handleChange} style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #ccc' }}>
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default React.memo(SelectComponent);
