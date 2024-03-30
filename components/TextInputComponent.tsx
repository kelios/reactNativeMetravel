// TextInputComponent.tsx
import React from 'react';

interface TextInputProps {
    label: string;
}

const TextInputComponent: React.FC<TextInputProps> = ({ label }) => {
    const [value, setValue] = React.useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    return (
        <div>
            <label>{label}</label>
            <input type="text" value={value} onChange={handleChange} />
        </div>
    );
};

export default TextInputComponent;