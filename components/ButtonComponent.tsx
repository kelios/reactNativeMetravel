import React from 'react';

interface ButtonProps {
    onClick: () => void;
    label: string;
}

const ButtonComponent: React.FC<ButtonProps> = ({ onClick, label }) => {
    return (
        <button onClick={onClick}>{label}</button>
    );
};

export default ButtonComponent;