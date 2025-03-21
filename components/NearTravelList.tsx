import React, { useEffect, useState, useCallback, memo, useMemo } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    useWindowDimensions,
    ActivityIndicator,
    Text,
    Platform,
} from 'react-native';
import { Title } from 'react-native-paper';
import { Travel } from '@/src/types/types';
import { fetchTravelsNear } from '@/src/api/travels';
import TravelTmlRound from '@/components/TravelTmlRound';
import MapClientSideComponent from '@/components/Map';

const CARD_WIDTH = 220;
const MAX_COLUMNS = 3;

const NearTravelList = memo(({ travel, onLayout, onTravelsLoaded }) => {
    const [travelsNear, setTravelsNear] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { width, height } = useWindowDimensions();

    const numColumns = Math.min(Math.max(Math.floor(width / CARD_WIDTH), 1), MAX_COLUMNS);
    const isMobile = width < 600;

    const fetchNearbyTravels = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const travelData = await fetchTravelsNear(Number(travel.id));
            setTravelsNear(travelData);
            onTravelsLoaded?.(travelData);
        } catch (err) {
            console.error('Failed to fetch travel data:', err);
            setError('Не удалось загрузить маршруты. Попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    }, [travel.id, onTravelsLoaded]);

    useEffect(() => {
        fetchNearbyTravels();
    }, [fetchNearbyTravels]);

    const renderItem = useCallback(({ item }) => (
        <TravelTmlRound travel={item} onPress={() => {}} />
    ), []);

    const mapPoints = useMemo(() =>
            travelsNear.flatMap(item => {
                if (!item.coordsMeTravelArr?.length) return [];
                return item.coordsMeTravelArr.map(coordStr => {
                    const [lat, lng] = coordStr.split(',').map(n => parseFloat(n.trim()));
                    if (isNaN(lat) || isNaN(lng)) return null;
                    return {
                        id: item.id,
                        coord: coordStr.trim(),
                        address: item.travelAddressAdress?.[0] || '',
                        travelImageThumbUrl: item.travel_image_thumb_url || '',
                        categoryName: item.countryName || '',
                        articleUrl: item.url,
                    };
                }).filter(Boolean);
            })
        , [travelsNear]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6B4F4F" />
                <Text style={styles.loadingText}>Загрузка маршрутов рядом...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { height }]}
              onLayout={onLayout}>
            <Title style={styles.title}>Рядом (~60км) можно еще посмотреть...</Title>
            <FlatList
                data={travelsNear}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                key={numColumns}
                numColumns={numColumns}
                contentContainerStyle={styles.flatListContent}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
            />
            <View style={styles.mapBlock}>
                {Platform.OS === 'web' && mapPoints.length > 0 ? (
                    <MapClientSideComponent showRoute travel={{ data: mapPoints }} />
                ) : (
                    <Text>Карта только в веб-версии</Text>
                )}
            </View>
        </View>
    );
});

export default NearTravelList;

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        paddingHorizontal: 20,
        width: '100%',
        maxHeight: '100vh',
    },
    mapBlock: {
        width: '100%',
        height: 500,
        marginBottom: 20,
        borderRadius: 10,
        overflow: 'hidden',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333333',
    },
    errorText: {
        marginTop: 10,
        fontSize: 16,
        color: 'red',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6B4F4F',
        marginBottom: 20,
        textAlign: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#6B4F4F',
        paddingBottom: 10,
        fontFamily: 'Georgia',
    },
    flatListContent: {
        paddingBottom: 20,
        alignItems: 'center',
    },
});
