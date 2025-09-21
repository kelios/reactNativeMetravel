import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    ActivityIndicator,
    LayoutChangeEvent,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
    Platform,
} from 'react-native';
import { Title } from 'react-native-paper';
import MasonryList from '@react-native-seoul/masonry-list';

import { Travel } from '@/src/types/types';
import { fetchTravelsNear } from '@/src/api/travels';
import TravelTmlRound from '@/components/travel/TravelTmlRound';
import MapClientSideComponent from '@/components/Map';

const brandOrange = '#ff8c49';
const lightOrange = '#ffede2';

type Segment = 'list' | 'map';

type NearTravelListProps = {
    travel: Pick<Travel, 'id'>;
    onLayout?: (e: LayoutChangeEvent) => void;
    onTravelsLoaded?: (travels: Travel[]) => void;
};

const SegmentSwitch = ({
                           value,
                           onChange,
                       }: {
    value: Segment;
    onChange: (val: Segment) => void;
}) => (
    <View style={segmentStyles.container}>
        <Pressable
            onPress={() => onChange('list')}
            style={[segmentStyles.button, value === 'list' && segmentStyles.activeButton]}
            accessibilityRole="button"
            accessibilityLabel="Показать списком"
        >
            <Text style={[segmentStyles.text, value === 'list' && segmentStyles.activeText]}>
                Список
            </Text>
        </Pressable>
        <Pressable
            onPress={() => onChange('map')}
            style={[segmentStyles.button, value === 'map' && segmentStyles.activeButton]}
            accessibilityRole="button"
            accessibilityLabel="Показать на карте"
        >
            <Text style={[segmentStyles.text, value === 'map' && segmentStyles.activeText]}>
                Карта
            </Text>
        </Pressable>
    </View>
);

const NearTravelList: React.FC<NearTravelListProps> = memo(
    ({ travel, onLayout, onTravelsLoaded }) => {
        const [travelsNear, setTravelsNear] = useState<Travel[]>([]);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const [viewMode, setViewMode] = useState<Segment>('list');
        const { width } = useWindowDimensions();

        const isMobile = width < 768;
        const [visibleCount, setVisibleCount] = useState(isMobile ? 6 : 12);

        // подстраиваем предел при смене брейкпоинта
        useEffect(() => {
            setVisibleCount(isMobile ? 6 : 12);
        }, [isMobile]);

        const fetchNearbyTravels = useCallback(async () => {
            let cancelled = false;
            try {
                setIsLoading(true);
                setError(null);
                const travelId = Number(travel.id);
                if (!Number.isFinite(travelId)) {
                    throw new Error('Некорректный идентификатор путешествия');
                }
                const data = await fetchTravelsNear(travelId);
                if (!cancelled) {
                    setTravelsNear(Array.isArray(data) ? data : []);
                    onTravelsLoaded?.(Array.isArray(data) ? data : []);
                }
            } catch (e) {
                if (!cancelled) setError('Не удалось загрузить маршруты. Попробуйте позже.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
            return () => {
                cancelled = true;
            };
        }, [travel.id, onTravelsLoaded]);

        useEffect(() => {
            fetchNearbyTravels();
        }, [fetchNearbyTravels]);

        const mapPoints = useMemo(() => {
            // Преобразуем все точки «рядом» в формат, ожидаемый картой
            return travelsNear.flatMap((item) =>
                Array.isArray(item.points)
                    ? item.points
                        .map((point, index) => {
                            const [lat, lng] = String(point.coord ?? '')
                                .split(',')
                                .map((n) => Number(n.trim()));
                            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
                            return {
                                id: `${item.id}-${index}`,
                                coord: `${lat},${lng}`,
                                address: point.address || '',
                                travelImageThumbUrl:
                                    point.travelImageThumbUrl || item.travel_image_thumb_url || '',
                                categoryName: point.categoryName || item.countryName || '',
                                articleUrl: point.urlTravel,
                            };
                        })
                        .filter(Boolean)
                    : []
            );
        }, [travelsNear]);

        const canRenderMap = useMemo(
            () => typeof window !== 'undefined' && mapPoints.length > 0,
            [mapPoints.length]
        );

        if (isLoading) {
            return (
                <View style={styles.loadingContainer} onLayout={onLayout}>
                    <ActivityIndicator size="large" color={brandOrange} />
                    <Text style={styles.loadingText}>Загрузка маршрутов рядом...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.loadingContainer} onLayout={onLayout}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchNearbyTravels} accessibilityRole="button">
                        <Text style={[styles.retryButton, { color: brandOrange }]}>Повторить</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.section} onLayout={onLayout}>
                <Title style={styles.title}>Рядом (~60км) можно еще посмотреть...</Title>

                {/* Десктоп: 2 колонки (лист + карта) */}
                {!isMobile ? (
                    <View style={styles.gridDesktop}>
                        <View style={styles.listColumn}>
                            <MasonryList
                                data={travelsNear.slice(0, visibleCount)}
                                keyExtractor={(item) => String(item.id)}
                                numColumns={2}
                                renderItem={({ item }) => <TravelTmlRound travel={item} />}
                                contentContainerStyle={styles.scrollContent}
                                onEndReachedThreshold={0.3}
                                onEndReached={() =>
                                    setVisibleCount((c) => Math.min(c + 6, travelsNear.length))
                                }
                            />
                        </View>

                        <View style={styles.mapColumn}>
                            {canRenderMap ? (
                                <MapClientSideComponent showRoute travel={{ data: mapPoints }} />
                            ) : (
                                <Text>Нет точек для отображения карты или вы не в браузере</Text>
                            )}
                        </View>
                    </View>
                ) : (
                    <>
                        {/* Мобильный: переключатель */}
                        <SegmentSwitch value={viewMode} onChange={setViewMode} />

                        {viewMode === 'list' ? (
                            <MasonryList
                                data={travelsNear.slice(0, visibleCount)}
                                keyExtractor={(item) => String(item.id)}
                                numColumns={1}
                                renderItem={({ item }) => <TravelTmlRound travel={item} />}
                                contentContainerStyle={styles.scrollContent}
                                onEndReachedThreshold={0.25}
                                onEndReached={() =>
                                    setVisibleCount((c) => Math.min(c + 6, travelsNear.length))
                                }
                            />
                        ) : (
                            <View style={styles.mobileMapWrapper}>
                                {canRenderMap ? (
                                    <MapClientSideComponent showRoute travel={{ data: mapPoints }} />
                                ) : (
                                    <Text>Нет точек для отображения карты или вы не в браузере</Text>
                                )}
                            </View>
                        )}
                    </>
                )}
            </View>
        );
    }
);

export default NearTravelList;

/* ========================= Styles ========================= */

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
    gridDesktop: { flexDirection: 'row', gap: 24 },
    listColumn: { flex: 1.4, height: 500, paddingRight: 12 },
    mapColumn: { flex: 1, height: 500, minWidth: 360, overflow: 'hidden' },
    mobileMapWrapper: {
        height: 400,
        marginTop: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    scrollContent: { paddingBottom: 20 },

    loadingContainer: { justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 10, fontSize: 16, color: '#333' },
    errorText: { marginTop: 10, fontSize: 16, color: 'red', textAlign: 'center' },
    retryButton: { marginTop: 10, fontSize: 16, fontWeight: 'bold' },
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
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    activeButton: { backgroundColor: lightOrange },
    text: { color: '#3B2C24', fontSize: 16, fontWeight: '600' },
    activeText: { color: brandOrange },
});
