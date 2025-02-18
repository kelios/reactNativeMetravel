import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button, Image } from 'react-native';
import MapView, { Marker, Callout } from '@teovilla/react-native-web-maps';
import MultiSelect from 'react-native-multiple-select';
import MarkersListComponent from './MarkersListComponent'; // Импорт компонента списка маркеров
import ImageUploadComponent from '@/components/ImageUploadComponent';

const WebMapComponent = ({
                             markers,
                             onMarkersChange,
                             onCountrySelect,
                             onCountryDeselect,
                             categoryTravelAddress,
                             countrylist
                         }) => {
    const [showMarkersList, setShowMarkersList] = useState(true); // Состояние для управления списком маркеров
    const reverseGeocode = async (coordinate) => {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinate.latitude}&lon=${coordinate.longitude}&addressdetails=1`
        );
        const data = await response.json();
        return data;
    };
    const addMarker = async (coordinate) => {
        const geocodeData = await reverseGeocode(coordinate);
        const address = geocodeData?.display_name || '';
        const country = geocodeData?.address?.country || '';

        const newMarker = {
            id: null,
            lat: coordinate.latitude,
            lng: coordinate.longitude,
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
        <View style={styles.container}>
            <View style={styles.mapSection}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: 51.505,
                        longitude: -0.09,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    onPress={(e) => addMarker(e.nativeEvent.coordinate)} // Добавление маркера при нажатии на карту
                >
                    {markers.map((marker, idx) => (
                        <Marker
                            key={idx}
                            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
                            onPress={toggleMarkersList} // Переключаем список маркеров при нажатии на маркер
                        >
                            <Callout>
                                <View style={styles.popupContent}>
                                    <Text style={styles.popupTitle}>Информация о точке</Text>
                                    <View style={styles.popupRow}>
                                        <Text>Категории:</Text>
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
                                    <View style={styles.popupRow}>
                                        <Text>Адрес:</Text>
                                        <TextInput
                                            value={marker.address || ''}
                                            onChangeText={(text) => handleMarkerChange(idx, 'address', text)}
                                            placeholder="Введите адрес"
                                            style={styles.input}
                                        />
                                    </View>
                                    {marker.id !== null && (
                                        <View style={styles.popupRow}>
                                            <Text>Изображение:</Text>
                                            <ImageUploadComponent
                                                collection="travelImageAddress"
                                                idTravel={marker.id}
                                                onUpload={(imageUrl) => handleImageUpload(idx, imageUrl)}
                                                oldImage={marker.image}
                                            />
                                            {marker.image && (
                                                <Image source={{ uri: marker.image }} style={styles.imagePreview} />
                                            )}
                                        </View>
                                    )}
                                    <Button
                                        title="Удалить точку"
                                        onPress={() => handleMarkerRemove(idx)}
                                        color="#ff4444"
                                    />
                                </View>
                            </Callout>
                        </Marker>
                    ))}
                </MapView>
            </View>

            {/* Кнопка для переключения отображения списка маркеров */}
            <Button
                title={showMarkersList ? 'Скрыть точки' : 'Показать точки'}
                onPress={toggleMarkersList}
                color="#4b7c6f"
            />

            {showMarkersList && (
                <MarkersListComponent
                    markers={markers}
                    categoryTravelAddress={categoryTravelAddress}
                    handleMarkerChange={handleMarkerChange}
                    handleImageUpload={handleImageUpload}
                    handleMarkerRemove={handleMarkerRemove}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    mapSection: {
        marginBottom: 20,
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    map: {
        height: 500,
        width: '100%',
        borderRadius: 10,
    },
    popupContent: {
        width: 250,
        padding: 10,
    },
    popupTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    popupRow: {
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 5,
    },
    imagePreview: {
        width: 100,
        height: 100,
        marginTop: 10,
    },
});

export default WebMapComponent;