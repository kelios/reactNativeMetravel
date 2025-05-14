import React, {useEffect, useRef, useState} from 'react';
import {MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkersListComponent from '../MarkersListComponent';

// Иконка маркера
const markerIcon = new L.Icon({
    iconUrl: require('@/assets/icons/logo_yellow.ico'),
    iconSize: [27, 30],
    iconAnchor: [13, 30],
    popupAnchor: [0, -30],
});

const FitBounds = ({ markers }) => {
    const map = useMap();
    const hasFit = useRef(false);

    useEffect(() => {
        if (!hasFit.current && markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(marker => [marker.lat, marker.lng]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
            hasFit.current = true;
        }
    }, [markers, map]);

    return null;
};

// Обработчик кликов по карте
const MapClickHandler = ({ addMarker }) => {
    useMapEvents({
        click(e) {
            addMarker(e.latlng);
        }
    });
    return null;
};

// Обратное геокодирование
const reverseGeocode = async (latlng) => {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`
    );
    return await response.json();
};

const WebMapComponent = ({
                             markers,
                             onMarkersChange,
                             categoryTravelAddress,
                             countrylist,
                             onCountrySelect,
                             onCountryDeselect,
                         }) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const isValidCoordinates = ({ lat, lng }) =>
        lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    const addMarker = async (latlng) => {
        if (!isValidCoordinates(latlng)) {
            console.warn('Недопустимые координаты:', latlng);
            return;
        }

        const geocodeData = await reverseGeocode(latlng);
        const address = geocodeData?.display_name || '';
        const country = geocodeData?.address?.country || '';

        const newMarker = {
            id: null,
            lat: latlng.lat,
            lng: latlng.lng,
            address,
            categories: [],
            image: null,
            country: null,
        };

        if (country) {
            const foundCountry = countrylist.find(c => c.title_ru === country);
            if (foundCountry) {
                newMarker.country = foundCountry.country_id;
                onCountrySelect(foundCountry.country_id);
            }
        }

        onMarkersChange([...markers, newMarker]);
    };

    const handleEditMarker = (index: number) => {
        setEditingIndex(index);
        setIsExpanded(true);
        setTimeout(() => {
            const element = document.getElementById(`marker-${index}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    const handleMarkerChange = (index: number, field: string, value: string | string[]) => {
        const updatedMarkers = [...markers];
        updatedMarkers[index] = { ...updatedMarkers[index], [field]: value };
        onMarkersChange(updatedMarkers);
    };

    const handleImageUpload = (index: number, imageUrl: string) => {
        const updatedMarkers = [...markers];
        updatedMarkers[index].image = imageUrl;
        onMarkersChange(updatedMarkers);
    };

    const handleMarkerRemove = (index: number) => {
        const removedMarker = markers[index];
        const updatedMarkers = markers.filter((_, idx) => idx !== index);
        onMarkersChange(updatedMarkers);

        if (removedMarker.country) {
            const hasMoreWithSameCountry = updatedMarkers.some(marker => marker.country === removedMarker.country);
            if (!hasMoreWithSameCountry) {
                onCountryDeselect(removedMarker.country);
            }
        }

        if (editingIndex === index) {
            setEditingIndex(null);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: 500 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickHandler addMarker={addMarker} />
                <FitBounds markers={markers} />
                {markers.map((marker, idx) => (
                    <Marker key={idx} position={[marker.lat, marker.lng]} icon={markerIcon}>
                        <Popup>
                            <div style={styles.popupContent}>
                                {marker.image && (
                                    <img src={marker.image} alt="Фото" style={styles.popupImage} />
                                )}
                                <p><strong>Адрес:</strong> {marker.address || 'Не указан'}</p>
                                <p><strong>Категории:</strong>
                                    {marker.categories.length > 0
                                        ? marker.categories
                                            .map(catId => {
                                                const found = categoryTravelAddress.find(c => c.id === catId);
                                                return found ? found.name : `ID: ${catId}`;
                                            })
                                            .join(', ')
                                        : 'Не выбрано'}
                                </p>
                                <div style={styles.popupButtons}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditMarker(idx);
                                        }}
                                        style={styles.editButton}
                                    >
                                        Редактировать
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMarkerRemove(idx);
                                        }}
                                        style={styles.deleteButton}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Кнопка показать/скрыть со счётчиком */}
            <div style={{ marginTop: 16 }}>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={styles.toggleButton}
                >
                    {isExpanded ? `Скрыть точки (${markers.length})` : `Показать точки (${markers.length})`}
                </button>

                {/* Анимированный блок со списком */}
                <div style={{
                    maxHeight: isExpanded ? '500px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                }}>
                    {isExpanded && (
                        <MarkersListComponent
                            markers={markers}
                            categoryTravelAddress={categoryTravelAddress}
                            handleMarkerChange={handleMarkerChange}
                            handleImageUpload={handleImageUpload}
                            handleMarkerRemove={handleMarkerRemove}
                            editingIndex={editingIndex}
                            setEditingIndex={setEditingIndex}
                            isExpanded={isExpanded}
                            setIsExpanded={setIsExpanded}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    popupContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '240px',
    },
    popupImage: {
        width: '100%',
        height: '120px',
        objectFit: 'cover',
        borderRadius: '6px',
        backgroundColor: '#f0f0f0',
    },
    popupButtons: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '8px',
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
    toggleButton: {
        padding: '8px 16px',
        backgroundColor: '#4b7c6f',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginBottom: '8px',
        fontWeight: 'bold',
        fontSize: '14px',
    },
};

export default WebMapComponent;
