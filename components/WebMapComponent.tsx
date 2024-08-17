import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { uploadImage } from '@/src/api/travels'; // Функция загрузки изображений

// Иконка маркера
const markerIcon = new L.Icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const WebMapComponent = () => {
    const [markers, setMarkers] = useState([]);

    // Обработчик кликов по карте для добавления маркера
    const handleMapClick = (e) => {
        const newMarker = {
            position: e.latlng,
            image: '',
            category: '',
            address: '',
        };
        setMarkers([...markers, newMarker]);
    };

    // Обработчик изменения данных маркера (например, категории или изображения)
    const handleMarkerChange = async (index, field, value) => {
        const updatedMarkers = [...markers];
        updatedMarkers[index][field] = value || ''; // Заменяем null на пустую строку
        setMarkers(updatedMarkers);

        // Если загружается изображение
        if (field === 'image' && value instanceof File) {
            const formData = new FormData();
            formData.append('file', value);
            formData.append('collection', 'travelMainImage');

            const response = await uploadImage(formData);
            updatedMarkers[index].image = response; // Обновляем URL изображения после загрузки
            setMarkers(updatedMarkers);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ flex: 2 }}>
                <MapContainer
                    center={[51.505, -0.09]}
                    zoom={13}
                    style={{ height: '500px', width: '100%', border: '1px solid #ccc' }}
                    onClick={handleMapClick}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                    {markers.map((marker, idx) => (
                        <Marker key={idx} position={marker.position} icon={markerIcon}>
                            <Popup>
                                <div>
                                    <h4>Информация о точке</h4>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label>Категория:</label>
                                        <select
                                            value={marker.category || ''} // Обработка null
                                            onChange={(e) => handleMarkerChange(idx, 'category', e.target.value)}
                                            style={styles.select}
                                        >
                                            <option value="">Выберите категорию</option>
                                            <option value="nature">Природа</option>
                                            <option value="city">Город</option>
                                            <option value="other">Другое</option>
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '10px' }}>
                                        <label>Адрес:</label>
                                        <input
                                            type="text"
                                            value={marker.address || ''} // Обработка null
                                            onChange={(e) => handleMarkerChange(idx, 'address', e.target.value)}
                                            placeholder="Введите адрес"
                                            style={styles.input}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '10px' }}>
                                        <label>Изображение:</label>
                                        <input
                                            type="file"
                                            onChange={(e) => handleMarkerChange(idx, 'image', e.target.files[0])}
                                            style={styles.input}
                                        />
                                        {marker.image && (
                                            <img
                                                src={marker.image}
                                                alt="Превью"
                                                style={{ width: '100px', height: '100px', marginTop: '10px', border: '1px solid #ccc' }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            <div style={{ flex: 1, padding: '20px', borderLeft: '1px solid #ccc', maxHeight: '500px', overflowY: 'auto' }}>
                <h3>Точки на карте</h3>
                {markers.length === 0 ? (
                    <p>Нажмите на карту, чтобы добавить точку</p>
                ) : (
                    markers.map((marker, idx) => (
                        <div key={idx} style={styles.markerForm}>
                            <h4>Точка {idx + 1}</h4>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Категория:</label>
                                <select
                                    value={marker.category || ''} // Обработка null
                                    onChange={(e) => handleMarkerChange(idx, 'category', e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="">Выберите категорию</option>
                                    <option value="nature">Природа</option>
                                    <option value="city">Город</option>
                                    <option value="other">Другое</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <label>Адрес:</label>
                                <input
                                    type="text"
                                    value={marker.address || ''} // Обработка null
                                    onChange={(e) => handleMarkerChange(idx, 'address', e.target.value)}
                                    placeholder="Введите адрес"
                                    style={styles.input}
                                />
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <label>Изображение:</label>
                                <input
                                    type="file"
                                    onChange={(e) => handleMarkerChange(idx, 'image', e.target.files[0])}
                                    style={styles.input}
                                />
                                {marker.image && (
                                    <img
                                        src={marker.image}
                                        alt="Превью"
                                        style={{ width: '100px', height: '100px', marginTop: '10px', border: '1px solid #ccc' }}
                                    />
                                )}
                            </div>

                            <hr style={{ margin: '20px 0' }} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    markerForm: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9',
    },
    input: {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    select: {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
};

export default WebMapComponent;
