// CheckboxComponent.tsx
import React from 'react';

interface CheckboxProps {
    label: string;
}

const CheckboxComponent: React.FC<CheckboxProps> = ({ label }) => {
    const [checked, setChecked] = React.useState(false);

    const handleChange = () => {
        setChecked(!checked);
    };

    return (
        <div>
            <label>
                <input type="checkbox" checked={checked} onChange={handleChange} />
                {label}
            </label>
        </div>
    );
};

export default CheckboxComponent;