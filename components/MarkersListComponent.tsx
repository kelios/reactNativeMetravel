import React from 'react';
import { MarkerData } from "@/src/types/types";
import ImageUploadComponent from '@/components/imageUpload/ImageUploadComponent';
import MultiSelectField from '@/components/MultiSelectField'; // Используем нормальный мультиселект

interface MarkersListComponentProps {
    markers: MarkerData[];
    categoryTravelAddress: { id: number; name: string }[];
    handleMarkerChange: (index: number, field: string, value: string | string[]) => void;
    handleImageUpload: (index: number, imageUrl: string) => void;
    handleMarkerRemove: (index: number) => void;
    editingIndex: number | null;
    setEditingIndex: (index: number | null) => void;
}

const MarkersListComponent: React.FC<MarkersListComponentProps> = ({
                                                                       markers,
                                                                       categoryTravelAddress,
                                                                       handleMarkerChange,
                                                                       handleImageUpload,
                                                                       handleMarkerRemove,
                                                                       editingIndex,
                                                                       setEditingIndex,
                                                                   }) => {
    return (
        <div style={styles.container}>
            <h3 style={styles.header}>Точки на карте</h3>
            {markers.length === 0 ? (
                <p style={styles.emptyText}>Нажмите на карту, чтобы добавить точку</p>
            ) : (
                <div style={styles.list}>
                    {markers.map((marker, index) => {
                        const isEditing = editingIndex === index;

                        return (
                            <div
                                key={index}
                                id={`marker-${index}`}
                                style={isEditing ? styles.editingItem : styles.markerItem}
                            >
                                {!isEditing ? (
                                    <div style={styles.preview}>
                                        {marker.image && (
                                            <img src={marker.image} alt="Фото" style={styles.previewImage} />
                                        )}
                                        <div style={styles.previewText}>
                                            <strong>{marker.address || 'Без адреса'}</strong>
                                            <p>{marker.categories.length ? `${marker.categories.length} категорий` : 'Категории не выбраны'}</p>
                                            <div style={styles.buttonRow}>
                                                <button onClick={() => setEditingIndex(index)} style={styles.editButton}>Редактировать</button>
                                                <button onClick={() => handleMarkerRemove(index)} style={styles.deleteButton}>Удалить</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={styles.editForm}>
                                        <div style={styles.field}>
                                            <label>Адрес:</label>
                                            <input
                                                type="text"
                                                value={marker.address || ''}
                                                onChange={(e) => handleMarkerChange(index, 'address', e.target.value)}
                                                style={styles.input}
                                            />
                                        </div>

                                        <div style={styles.field}>
                                            <label>Категории:</label>
                                            <MultiSelectField
                                                label=""
                                                items={categoryTravelAddress}
                                                value={marker.categories}
                                                onChange={(selected) => handleMarkerChange(index, 'categories', selected)}
                                                labelField="name"
                                                valueField="id"
                                            />
                                        </div>

                                        <div style={styles.field}>
                                            <label>Изображение:</label>
                                            <ImageUploadComponent
                                                collection="travelImageAddress"
                                                idTravel={marker.id}
                                                oldImage={marker.image}
                                                onUpload={(imageUrl) => handleImageUpload(index, imageUrl)}
                                            />
                                            {marker.image && (
                                                <img src={marker.image} alt="Превью" style={styles.imagePreview} />
                                            )}
                                        </div>

                                        <div style={styles.buttonRow}>
                                            <button onClick={() => setEditingIndex(null)} style={styles.closeButton}>Закрыть</button>
                                            <button onClick={() => handleMarkerRemove(index)} style={styles.deleteButton}>Удалить</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        maxHeight: '400px',
        overflowY: 'auto',
    },
    header: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '12px',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    markerItem: {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '12px',
        backgroundColor: '#f9f9f9',
    },
    editingItem: {
        border: '1px solid #4b7c6f',
        backgroundColor: '#e6f7ff',
        borderRadius: '8px',
        padding: '12px',
    },
    preview: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    previewImage: {
        width: '60px',
        height: '60px',
        objectFit: 'cover',
        borderRadius: '6px',
        backgroundColor: '#f0f0f0',
    },
    previewText: {
        flex: 1,
    },
    buttonRow: {
        display: 'flex',
        gap: '8px',
        marginTop: '8px',
    },
    editButton: {
        backgroundColor: '#4b7c6f',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    deleteButton: {
        backgroundColor: '#d9534f',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    closeButton: {
        backgroundColor: '#bbb',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    editForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    input: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '6px',
    },
    imagePreview: {
        width: '100px',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '6px',
        backgroundColor: '#f0f0f0',
        marginTop: '4px',
    },
};

export default MarkersListComponent;
