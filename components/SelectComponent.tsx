import React from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    label: string;
    options?: SelectOption[];
}

const SelectComponent: React.FC<SelectProps> = ({ label, options = [] }) => {
    const [selectedValue, setSelectedValue] = React.useState('');

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(event.target.value);
    };

    return (
        <div>
            <label>{label}</label>
            <select value={selectedValue} onChange={handleChange}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
};

export default SelectComponent;