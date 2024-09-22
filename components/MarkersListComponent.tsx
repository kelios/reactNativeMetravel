import React from 'react';
import { View } from "react-native";
import MultiSelect from "react-native-multiple-select";
import ImageUploadComponent from '@/components/ImageUploadComponent';
import { MarkerData } from "@/src/types/types";

interface MarkersListComponentProps {
    markers: MarkerData[];
    categoryTravelAddress: { id: number; name: string }[];
    handleMarkerChange: (index: number, field: string, value: string | string[]) => void;
    handleImageUpload: (index: number, imageUrl: string) => void;
    handleMarkerRemove: (index: number) => void;
}

const MarkersListComponent: React.FC<MarkersListComponentProps> = ({
                                                                       markers,
                                                                       categoryTravelAddress,
                                                                       handleMarkerChange,
                                                                       handleImageUpload,
                                                                       handleMarkerRemove
                                                                   }) => {
    return (
        <div style={styles.markersListContainer}>
            <h3>Точки на карте</h3>
            {markers.length === 0 ? (
                <p>Нажмите на карту, чтобы добавить точку</p>
            ) : (
                <div style={styles.markersList}>
                    {markers.map((marker, idx) => (
                        <div key={idx} style={styles.markerItem}>
                            <h4>Точка {idx + 1}</h4>
                            <p>Координаты: {marker.lat}, {marker.lng}</p>
                            <div style={styles.markerRow}>
                                <label>Категории:</label>
                                <View style={styles.multiselector}>
                                    <MultiSelect
                                        hideTags
                                        items={categoryTravelAddress}
                                        uniqueKey="id"
                                        onSelectedItemsChange={(selectedItems) => handleMarkerChange(idx, 'categories', selectedItems)}
                                        selectedItems={marker.categories}
                                        selectText="Выберите категории"
                                        searchInputPlaceholderText="Выберите категории"
                                        style={styles.input}
                                    />
                                </View>
                            </div>
                            <div style={styles.markerRow}>
                                <label>Адрес:</label>
                                <input
                                    type="text"
                                    value={marker.address || ''}
                                    onChange={(e) => handleMarkerChange(idx, 'address', e.target.value)}
                                    placeholder="Введите адрес"
                                    style={styles.input}
                                />
                            </div>

                            {marker.id !== null && (
                                <div style={styles.markerRow}>
                                    <label>Изображение:</label>
                                    <ImageUploadComponent
                                        collection="travelImageAddress"
                                        idTravel={marker.id}
                                        oldImage={marker.image}
                                        onUpload={(imageUrl) => handleImageUpload(idx, imageUrl)}
                                    />
                                </div>
                            )}
                            <button onClick={() => handleMarkerRemove(idx)} style={styles.button}>
                                Удалить точку
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    markersListContainer: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    },
    markersList: {
        display: 'flex',
        flexDirection: 'column', // Вертикальный список
        gap: '10px', // Промежуток между маркерами
    },
    markerItem: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    },
    markerRow: {
        marginBottom: '10px',
    },
    input: {
        width: '98%',
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        fontSize: '14px',
    },
    button: {
        backgroundColor: '#ff6347',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    multiselector: {
        marginTop: 10,
    }
};

export default MarkersListComponent;
