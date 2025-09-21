import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Platform, Text, ActivityIndicator } from 'react-native';

type LatLng = { latitude: number; longitude: number };

interface MapPanelProps {
    travelsData: any[];
    coordinates: LatLng;
    routePoints?: [number, number][];
    placesAlongRoute?: any[];
    mode?: 'radius' | 'route';
    setRoutePoints?: (points: [number, number][]) => void;
    onMapClick?: (lng: number, lat: number) => void;
    transportMode?: 'car' | 'bike' | 'foot';
    setRouteDistance: (distance: number) => void;
    setFullRouteCoords: (coords: [number, number][]) => void;
}

/** Плейсхолдер для нативных платформ или во время загрузки карты */
function Placeholder({ text = 'Карта доступна только в браузере' }: { text?: string }) {
    return (
        <View style={styles.placeholder}>
            <ActivityIndicator size="large" />
            <Text style={styles.placeholderText}>{text}</Text>
        </View>
    );
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
    const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

    // Динамически импортируем веб-карту, только в браузере
    const [WebMap, setWebMap] = useState<React.ComponentType<any> | null>(null);
    const [loading, setLoading] = useState(isWeb);

    useEffect(() => {
        let mounted = true;
        if (!isWeb) return;

        (async () => {
            try {
                const mod = await import('@/components/MapPage/Map');
                if (mounted) setWebMap(() => (mod.default ?? mod as any));
            } catch (e) {
                console.error('[MapPanel] Failed to load web map:', e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [isWeb]);

    const travelProp = useMemo(() => ({ data: travelsData }), [travelsData]);

    if (!isWeb) return <Placeholder />;

    if (loading || !WebMap) {
        return <Placeholder text="Инициализация карты…" />;
    }

    return (
        <View style={styles.mapContainer}>
            <WebMap
                travel={travelProp}
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

export default React.memo(MapPanel);

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
        gap: 12,
        padding: 24,
        borderRadius: 16,
        backgroundColor: '#fff',
    },
    placeholderText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});
