// MultiSelectComponent.tsx
import React from 'react';

interface Option {
    value: string;
    label: string;
}

interface MultiSelectProps {
    label: string;
    options: Option[];
}

const MultiSelectComponent: React.FC<MultiSelectProps> = ({ label, options }) => {
    const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = Array.from(event.target.selectedOptions, (option) => option.value);
        setSelectedOptions(selected);
    };

    return (
        <div>
            <label>{label}</label>
            <select multiple value={selectedOptions} onChange={handleChange}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
};

export default MultiSelectComponent;