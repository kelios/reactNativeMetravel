// FormComponent.tsx
import React from 'react';
import TextInputComponent from './TextInputComponent';
import SelectComponent from './SelectComponent';
import MapComponent from './MapComponent';
import DescriptionComponent from './DescriptionComponent';
import CheckboxComponent from './CheckboxComponent';
import UploadComponent from './UploadComponent';

const FormComponent: React.FC = () => {
    return (
        <div>
            <TextInputComponent label="Название" />
        <SelectComponent label="Страны" />
        <SelectComponent label="Города" />
        <MapComponent />
        <DescriptionComponent label="Описание" />
        <TextInputComponent label="Плюсы" />
        <TextInputComponent label="Минусы" />
        <TextInputComponent label="Рекомендации" />
        <TextInputComponent label="Ссылка на YouTube" />
        <SelectComponent label="Категории путешествия" />
        <SelectComponent label="Транспорт" />
            {/* Другие компоненты */}
            <CheckboxComponent label="Нужна виза" />
    <UploadComponent label="Загрузить главное фото путешествия" />
    <UploadComponent label="Загрузить фото для галереи" multiple />
    <button type="submit">Сохранить</button>
        </div>
);
};

export default FormComponent;