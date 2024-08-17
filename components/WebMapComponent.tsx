import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ImageUploadComponent from '@/components/ImageUploadComponent'; // Подключаем компонент загрузки изображений

// Иконка маркера
const markerIcon = new L.Icon({
    iconUrl: '/assets/icons/logo_yellow.ico',
    iconSize: [27, 30],
    iconAnchor: [13, 30],
    popupAnchor: [0, -30],
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

const WebMapComponent = ({
                             markers,
                             onMarkersChange,
                             onCountrySelect,
                             categoryTravelAddress,
                             countrylist
                         }) => {
    const addMarker = async (latlng) => {
        const geocodeData = await reverseGeocode(latlng);
        const address = geocodeData?.display_name || '';
        const country = geocodeData?.address?.country || '';

        const newMarker = {
            position: latlng,
            image: '',
            category: '',
            address,
            country_id: null,
        };

        if (country) {
            const foundCountry = countrylist.find(c => c.title_ru === country);
            if (foundCountry) {
                newMarker.country_id = foundCountry.country_id;
                onCountrySelect(foundCountry.country_id);
            }
        }

        onMarkersChange([...markers, newMarker]);
    };

    const handleMarkerChange = (index, field, value) => {
        const updatedMarkers = [...markers];
        updatedMarkers[index][field] = value || '';
        onMarkersChange(updatedMarkers);
    };

    const handleImageUpload = (index, imageUrl) => {
        const updatedMarkers = [...markers];
        updatedMarkers[index].image = imageUrl;
        onMarkersChange(updatedMarkers);
    };

    const handleMarkerRemove = (index) => {
        const updatedMarkers = markers.filter((_, idx) => idx !== index);
        onMarkersChange(updatedMarkers);
    };

    return (
        <div style={styles.container}>
            <div style={styles.mapSection}>
                <MapContainer
                    center={[51.505, -0.09]}
                    zoom={13}
                    style={styles.map}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                    <MapClickHandler addMarker={addMarker} />
                    {markers.map((marker, idx) => (
                        <Marker key={idx} position={marker.position} icon={markerIcon}>
                            <Popup>
                                <div style={styles.popupContent}>
                                    <h4>Информация о точке</h4>
                                    <div style={styles.popupRow}>
                                        <label>Категория:</label>
                                        <select
                                            value={marker.category || ''}
                                            onChange={(e) => handleMarkerChange(idx, 'category', e.target.value)}
                                            style={styles.input}
                                        >
                                            <option value="">Выберите категорию</option>
                                            {categoryTravelAddress.map((category) => (
                                                <option key={category.id} value={category.name}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={styles.popupRow}>
                                        <label>Адрес:</label>
                                        <input
                                            type="text"
                                            value={marker.address || ''}
                                            onChange={(e) => handleMarkerChange(idx, 'address', e.target.value)}
                                            placeholder="Введите адрес"
                                            style={styles.input}
                                        />
                                    </div>

                                    <div style={styles.popupRow}>
                                        <label>Изображение:</label>
                                        <ImageUploadComponent
                                            collection="travelImageAddress"
                                            onUpload={(imageUrl) => handleImageUpload(idx, imageUrl)}
                                        />
                                        {marker.image && (
                                            <img
                                                src={marker.image}
                                                alt="Превью"
                                                style={styles.imagePreview}
                                            />
                                        )}
                                    </div>

                                    <button onClick={() => handleMarkerRemove(idx)} style={styles.button}>
                                        Удалить точку
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            <div style={styles.markersList}>
                <h3>Точки на карте</h3>
                {markers.length === 0 ? (
                    <p>Нажмите на карту, чтобы добавить точку</p>
                ) : (
                    markers.map((marker, idx) => (
                        <div key={idx} style={styles.markerItem}>
                            <h4>Точка {idx + 1}</h4>
                            <p>Координаты: {marker.position.lat}, {marker.position.lng}</p>
                            <div style={styles.markerRow}>
                                <label>Категория:</label>
                                <select
                                    value={marker.category || ''}
                                    onChange={(e) => handleMarkerChange(idx, 'category', e.target.value)}
                                    style={styles.input}
                                >
                                    <option value="">Выберите категорию</option>
                                    {categoryTravelAddress.map((category) => (
                                        <option key={category.id} value={category.name}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
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

                            <div style={styles.markerRow}>
                                <label>Изображение:</label>
                                <ImageUploadComponent
                                    collection="travelImageAddress"
                                    onUpload={(imageUrl) => handleImageUpload(idx, imageUrl)}
                                />
                                {marker.image && (
                                    <img
                                        src={marker.image}
                                        alt="Превью"
                                        style={styles.imagePreview}
                                    />
                                )}
                            </div>

                            <button onClick={() => handleMarkerRemove(idx)} style={styles.button}>
                                Удалить точку
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        backgroundColor: '#f8f8f8',
    },
    mapSection: {
        marginBottom: '20px',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    },
    map: {
        height: '500px',
        width: '100%',
        borderRadius: '10px',
    },
    markersList: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        maxHeight: '400px',
        overflowY: 'auto',
    },
    markerItem: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginBottom: '15px',
        backgroundColor: '#fff',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    },
    popupContent: {
        fontFamily: 'Arial, sans-serif',
    },
    popupRow: {
        marginBottom: '10px',
    },
    input: {
        width: '100%',
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
    imagePreview: {
        width: '100px',
        height: '100px',
        marginTop: '10px',
        border: '1px solid #ccc',
        borderRadius: '6px',
    },
};

export default WebMapComponent;
