// UploadComponent.tsx
import React from 'react';

interface UploadProps {
    label: string;
    multiple?: boolean;
}

const UploadComponent: React.FC<UploadProps> = ({ label, multiple }) => {
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        // Обработка загруженных файлов
    };

    return (
        <div>
            <label>{label}</label>
            <input type="file" onChange={handleFileUpload} multiple={multiple} />
        </div>
    );
};

export default UploadComponent;