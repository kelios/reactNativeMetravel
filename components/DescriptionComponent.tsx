// DescriptionComponent.tsx
import React from 'react';

interface DescriptionProps {
    label: string;
}

const DescriptionComponent: React.FC<DescriptionProps> = ({ label }) => {
    const [description, setDescription] = React.useState('');

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value);
    };

    return (
        <div>
            <label>{label}</label>
            <textarea value={description} onChange={handleChange} />
        </div>
    );
};

export default DescriptionComponent;