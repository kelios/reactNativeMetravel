import React, { useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';

let MapPageComponent: React.FC<any> | null = null;
if (Platform.OS === 'web' && typeof window !== 'undefined') {
    MapPageComponent = require('@/components/MapPage/Map').default;
}

interface MapPanelProps {
    travelsData: any[];
    coordinates: { latitude: number; longitude: number };
    routePoints?: [number, number][];
    placesAlongRoute?: any[];
    mode?: 'radius' | 'route';
    setRoutePoints?: (points: [number, number][]) => void;
    onMapClick?: (lng: number, lat: number) => void;
    transportMode?: 'car' | 'bike' | 'foot';
    setRouteDistance: (distance: number) => void;
    setFullRouteCoords: (coords: [number, number][]) => void;
}

const MapPanel: React.FC<MapPanelProps> = ({
                                               travelsData,
                                               coordinates,
                                               routePoints = [],
                                               placesAlongRoute = [],
                                               mode = 'radius',
                                               setRoutePoints = () => {},
                                               onMapClick = () => {},
                                               transportMode = 'car',
                                               setRouteDistance,
                                               setFullRouteCoords,
                                           }) => {
    const [isBrowser] = useState(Platform.OS === 'web');

    if (!isBrowser || !MapPageComponent) {
        return (
            <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>
                    Карта доступна только в браузере
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.mapContainer}>
            <MapPageComponent
                travel={{ data: travelsData }}
                coordinates={coordinates}
                routePoints={routePoints}
                placesAlongRoute={placesAlongRoute}
                mode={mode}
                setRoutePoints={setRoutePoints}
                onMapClick={onMapClick}
                transportMode={transportMode}
                setRouteDistance={setRouteDistance}
                setFullRouteCoords={setFullRouteCoords}
            />
        </View>
    );
};

export default MapPanel;

const styles = StyleSheet.create({
    mapContainer: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    placeholderText: {
        fontSize: 16,
        color: '#666',
    },
});
