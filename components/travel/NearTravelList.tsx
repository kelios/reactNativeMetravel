import React, { useEffect, useState, useCallback, memo, useMemo } from 'react';
import {
    View,
    StyleSheet,
    useWindowDimensions,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    ScrollView,
    Pressable,
} from 'react-native';
import { Title } from 'react-native-paper';
import { Travel } from '@/src/types/types';
import { fetchTravelsNear } from '@/src/api/travels';
import TravelTmlRound from '@/components/travel/TravelTmlRound';
import MapClientSideComponent from '@/components/Map';
import MasonryList from '@react-native-seoul/masonry-list';

const brandOrange = '#ff8c49';
const lightOrange = '#ffede2';

const SegmentSwitch = ({
                           value,
                           onChange,
                       }: {
    value: 'list' | 'map';
    onChange: (val: 'list' | 'map') => void;
}) => {
    return (
        <View style={segmentStyles.container}>
            <Pressable
                onPress={() => onChange('list')}
                style={[
                    segmentStyles.button,
                    value === 'list' && segmentStyles.activeButton,
                ]}
            >
                <Text style={[segmentStyles.text, value === 'list' && segmentStyles.activeText]}>
                    Список
                </Text>
            </Pressable>

            <Pressable
                onPress={() => onChange('map')}
                style={[
                    segmentStyles.button,
                    value === 'map' && segmentStyles.activeButton,
                ]}
            >
                <Text style={[segmentStyles.text, value === 'map' && segmentStyles.activeText]}>
                    Карта
                </Text>
            </Pressable>
        </View>
    );
};

const NearTravelList = memo(({ travel, onLayout, onTravelsLoaded }) => {
    const [travelsNear, setTravelsNear] = useState<Travel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [visibleCount, setVisibleCount] = useState(6);

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

    useEffect(() => {
        // автоматом увеличивать на scroll или сразу
        if (!isMobile) {
            setVisibleCount(12); // на desktop чуть больше
        }
    }, [isMobile]);

    const mapPoints = useMemo(() => {
        return travelsNear.flatMap((item) => {
            if (!Array.isArray(item.points)) return [];

            return item.points
                .map((point, index) => {
                    const [lat, lng] = point.coord?.split(',')?.map(Number) || [];
                    if (isNaN(lat) || isNaN(lng)) return null;

                    return {
                        id: `${item.id}-${index}`,
                        coord: point.coord,
                        address: point.address || '',
                        travelImageThumbUrl: point.travelImageThumbUrl || item.travel_image_thumb_url || '',
                        categoryName: point.categoryName || item.countryName || '',
                        articleUrl: point.urlTravel, // абсолютный путь
                    };
                })
                .filter(Boolean);
        });
    }, [travelsNear]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={brandOrange} />
                <Text style={styles.loadingText}>Загрузка маршрутов рядом...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={fetchNearbyTravels}>
                    <Text style={[styles.retryButton, { color: brandOrange }]}>Повторить</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const canRenderMap = typeof window !== 'undefined' && mapPoints.length > 0;

    return (
        <View style={styles.section} onLayout={onLayout}>
            <Title style={styles.title}>Рядом (~60км) можно еще посмотреть...</Title>

            {isMobile && (
                <SegmentSwitch value={viewMode} onChange={setViewMode} />
            )}

            {!isMobile && (
                <View style={styles.gridDesktop}>
                    <View style={styles.listColumn}>
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            <MasonryList
                                data={travelsNear.slice(0, visibleCount)}
                                keyExtractor={(item) => item.id.toString()}
                                numColumns={isMobile ? 1 : 2}
                                renderItem={({ item }) => <TravelTmlRound travel={item} />}
                                contentContainerStyle={styles.scrollContent}
                            />
                        </ScrollView>
                    </View>

                    <View style={styles.mapColumn}>
                        {canRenderMap ? (
                            <MapClientSideComponent showRoute travel={{ data: mapPoints }} />
                        ) : (
                            <Text>Нет точек для отображения карты или вы не в браузере</Text>
                        )}
                    </View>
                </View>
            )}

            {isMobile && viewMode === 'list' && (
                <MasonryList
                    data={travelsNear.slice(0, visibleCount)}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={isMobile ? 1 : 2}
                    renderItem={({ item }) => <TravelTmlRound travel={item} />}
                    contentContainerStyle={styles.scrollContent}
                />
            )}

            {isMobile && viewMode === 'map' && (
                <View style={styles.mobileMapWrapper}>
                    {canRenderMap ? (
                        <MapClientSideComponent showRoute travel={{ data: mapPoints }} />
                    ) : (
                        <Text>Нет точек для отображения карты или вы не в браузере</Text>
                    )}
                </View>
            )}
        </View>
    );
});

export default NearTravelList;

const styles = StyleSheet.create({
    section: {
        marginTop: 24,
        marginBottom: 40,
        paddingHorizontal: 16,
        paddingVertical: 28,
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#3B2C24',
        marginBottom: 24,
        textAlign: 'center',
        fontFamily: 'Georgia',
    },
    gridDesktop: {
        flexDirection: 'row',
        gap: 24,
    },
    listColumn: {
        flex: 1.4,
        height: 500,
     //   overflow: 'scroll',
        paddingRight: 12,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    mapColumn: {
        flex: 1,
        height: 500,
        minWidth: 360,
    },
    mobileMapWrapper: {
        height: 400,
        marginTop: 16,
        borderRadius: 16,
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
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

const segmentStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 24,
        overflow: 'hidden',
        alignSelf: 'center',
        marginBottom: 16,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 24,
        backgroundColor: '#fff',
    },
    activeButton: {
        backgroundColor: lightOrange,
    },
    text: {
        color: '#3B2C24',
        fontSize: 16,
        fontWeight: '600',
    },
    activeText: {
        color: brandOrange,
    },
});
