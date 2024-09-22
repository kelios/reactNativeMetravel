import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MarkerData } from "@/src/types/types";
import { View } from "react-native";
import MultiSelect from "react-native-multiple-select";
import MarkersListComponent from './MarkersListComponent'; // Импорт компонента списка маркеров
import ImageUploadComponent from '@/components/ImageUploadComponent';

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
            addMarker(e.latlng); // Добавление маркера при клике на карту
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
                             onCountryDeselect,
                             categoryTravelAddress,
                             countrylist
                         }) => {
    const [showMarkersList, setShowMarkersList] = useState(true); // Состояние для управления списком маркеров

    const addMarker = async (latlng) => {
        const geocodeData = await reverseGeocode(latlng);
        const address = geocodeData?.display_name || '';
        const country = geocodeData?.address?.country || '';

        const newMarker = {
            id: null,
            lat: latlng.lat,
            lng: latlng.lng,
            country: null,
            city: null,
            address: address,
            categories: [],
            image: null,
        };

        // Определяем страну маркера
        if (country) {
            const foundCountry = countrylist.find(c => c.title_ru === country);
            if (foundCountry) {
                newMarker.country = foundCountry.country_id;
                onCountrySelect(foundCountry.country_id); // Добавляем страну в фильтры
            }
        }

        onMarkersChange([...markers, newMarker]);
    };

    const toggleMarkersList = () => {
        setShowMarkersList(!showMarkersList); // Переключение видимости списка маркеров
    };

    const handleMarkerChange = (index, field, value) => {
        const updatedMarkers = [...markers];
        updatedMarkers[index] = {
            ...updatedMarkers[index],
            [field]: value || '',
        };
        onMarkersChange(updatedMarkers);
    };

    const handleImageUpload = (index, imageUrl) => {
        const updatedMarkers = [...markers];
        updatedMarkers[index].image = imageUrl;
        onMarkersChange(updatedMarkers);
    };

    const handleMarkerRemove = (index) => {
        const removedMarker = markers[index];
        const updatedMarkers = markers.filter((_, idx) => idx !== index);
        onMarkersChange(updatedMarkers);

        if (removedMarker.country) {
            const hasOtherMarkersWithSameCountry = updatedMarkers.some(marker => marker.country === removedMarker.country);
            if (!hasOtherMarkersWithSameCountry) {
                onCountryDeselect(removedMarker.country); // Удаляем страну из фильтров, если маркеров с этой страной больше нет
            }
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.mapSection}>
                <MapContainer center={[51.505, -0.09]} zoom={13} style={styles.map}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                    <MapClickHandler addMarker={addMarker} />
                    {markers.map((marker, idx) => (
                        <Marker
                            key={idx}
                            position={[marker.lat, marker.lng]}
                            icon={markerIcon}
                            eventHandlers={{
                                click: () => toggleMarkersList(), // Переключаем список маркеров при клике на маркер
                            }}
                        >
                            <Popup>
                                <div style={styles.popupContent}>
                                    <h4>Информация о точке</h4>
                                    <div style={styles.popupRow}>
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
                                    {marker.id !== null && (
                                        <div style={styles.popupRow}>
                                            <label>Изображение:</label>
                                            <ImageUploadComponent
                                                collection="travelImageAddress"
                                                idTravel={marker.id}
                                                onUpload={(imageUrl) => handleImageUpload(idx, imageUrl)}
                                                oldImage={marker.image}
                                            />
                                            {marker.image && (
                                                <img src={marker.image} alt="Превью" style={styles.imagePreview} />
                                            )}
                                        </div>
                                    )}
                                    <button onClick={() => handleMarkerRemove(idx)} style={styles.button}>
                                        Удалить точку
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Кнопка для переключения отображения списка маркеров */}
            <button onClick={toggleMarkersList} style={styles.toggleButton}>
                {showMarkersList ? 'Скрыть точки' : 'Показать точки'}
            </button>

            {showMarkersList && (
                <MarkersListComponent
                    markers={markers}
                    categoryTravelAddress={categoryTravelAddress}
                    handleMarkerChange={handleMarkerChange}
                    handleImageUpload={handleImageUpload}
                    handleMarkerRemove={handleMarkerRemove}
                />
            )}
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
    toggleButton: {
        backgroundColor: '#4b7c6f',
        color: 'white',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '8px',
        cursor: 'pointer',
        marginBottom: '20px',
        alignSelf: 'center',
        fontSize: '16px',
    },
};

export default WebMapComponent;
