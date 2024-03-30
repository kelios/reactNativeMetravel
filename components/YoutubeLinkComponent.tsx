// YoutubeLinkComponent.tsx
import React from 'react';

interface YoutubeLinkProps {
    label: string;
}

const YoutubeLinkComponent: React.FC<YoutubeLinkProps> = ({ label }) => {
    const [link, setLink] = React.useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLink(event.target.value);
    };

    return (
        <div>
            <label>{label}</label>
            <input type="text" value={link} onChange={handleChange} />
        </div>
    );
};

export default YoutubeLinkComponent;