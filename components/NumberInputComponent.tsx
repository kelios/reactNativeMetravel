// NumberInputComponent.tsx
import React from 'react';

interface NumberInputProps {
    label: string;
}

const NumberInputComponent: React.FC<NumberInputProps> = ({ label }) => {
    const [value, setValue] = React.useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value.replace(/\D/g, ''); // Оставляем только цифры
        setValue(newValue);
    };

    return (
        <div>
            <label>{label}</label>
            <input type="text" value={value} onChange={handleChange} />
        </div>
    );
};

export default NumberInputComponent;