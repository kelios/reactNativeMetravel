import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { uploadImage } from '@/src/api/travels'; // Функция загрузки изображений

// Иконка маркера
const markerIcon = new L.Icon({
    iconUrl: '/assets/icons/logo_yellow.ico',
    iconSize: [27, 30],
    iconAnchor: [27, 15],
    popupAnchor: [0, -15],
});

// Компонент для обработки кликов на карте
const MapClickHandler = ({ addMarker }) => {
    useMapEvents({
        click(e) {
            addMarker(e.latlng);
        }
    });
    return null;
};

// Функция для обратного геокодирования (определение адреса по координатам)
const reverseGeocode = async (latlng) => {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`
    );
    const data = await response.json();
    return data;
};

const WebMapComponent = ({ markers, onMarkerAdd, onMarkerRemove, onCountrySelect, onCountryRemove, categoryTravelAddress }) => {
    const addMarker = async (latlng) => {
        // Выполняем обратное геокодирование
        const geocodeData = await reverseGeocode(latlng);
        const address = geocodeData.display_name || '';
        const country = geocodeData.address.country || '';

        // Создаем новый маркер с адресом
        const newMarker = {
            position: latlng,
            image: '',
            category: '',
            address,
        };

        onMarkerAdd(newMarker);

        // Находим страну по названию и передаем её в родительский компонент
        if (country) {
            const foundCountry = categoryTravelAddress.find(c => c.title_ru === country);
            if (foundCountry) {
                onCountrySelect(foundCountry.country_id);
            }
        }
    };

    const handleMarkerChange = async (index, field, value) => {
        const updatedMarkers = [...markers];
        updatedMarkers[index][field] = value || '';
        onMarkerAdd(updatedMarkers);

        if (field === 'image' && value instanceof File) {
            const formData = new FormData();
            formData.append('file', value);
            formData.append('collection', 'travelMainImage');

            const response = await uploadImage(formData);
            updatedMarkers[index].image = response;
            onMarkerAdd(updatedMarkers);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 2, marginBottom: '20px' }}>
                <MapContainer
                    center={[51.505, -0.09]}
                    zoom={13}
                    style={{ height: '500px', width: '100%', border: '1px solid #ccc' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                    <MapClickHandler addMarker={addMarker} />
                    {markers.map((marker, idx) => (
                        <Marker key={idx} position={marker.position} icon={markerIcon}>
                            <Popup>
                                <div>
                                    <h4>Информация о точке</h4>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label>Категория:</label>
                                        <select
                                            value={marker.category || ''}
                                            onChange={(e) => handleMarkerChange(idx, 'category', e.target.value)}
                                            style={styles.select}
                                        >
                                            <option value="">Выберите категорию</option>
                                            {categoryTravelAddress.map((category) => (
                                                <option key={category.id} value={category.name}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '10px' }}>
                                        <label>Адрес:</label>
                                        <input
                                            type="text"
                                            value={marker.address || ''}
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

            <div style={{ flex: 1, padding: '20px', borderTop: '1px solid #ccc', maxHeight: '300px', overflowY: 'auto' }}>
                <h3>Точки на карте</h3>
                {markers.length === 0 ? (
                    <p>Нажмите на карту, чтобы добавить точку</p>
                ) : (
                    markers.map((marker, idx) => (
                        <div key={idx} style={styles.markerForm}>
                            <h4>Точка {idx + 1}</h4>
                            <p>Координаты: {marker.position.lat}, {marker.position.lng}</p>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Категория:</label>
                                <select
                                    value={marker.category || ''}
                                    onChange={(e) => handleMarkerChange(idx, 'category', e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="">Выберите категорию</option>
                                    {categoryTravelAddress.map((category) => (
                                        <option key={category.id} value={category.name}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <label>Адрес:</label>
                                <input
                                    type="text"
                                    value={marker.address || ''}
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
