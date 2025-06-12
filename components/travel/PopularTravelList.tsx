import React, {
    useEffect,
    useState,
    useCallback,
    memo,
    useMemo,
    useRef,
} from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    useWindowDimensions,
    Text,
    Animated,
    Platform,
} from 'react-native';
import { TravelsMap, Travel } from '@/src/types/types';
import { fetchTravelsPopular } from '@/src/api/travels';
import TravelTmlRound from '@/components/travel/TravelTmlRound';
import { Title } from 'react-native-paper';

type PopularTravelListProps = {
    onLayout?: (event: any) => void;
    scrollToAnchor?: () => void;
    title?: string | null;
    maxColumns?: number;
};

// Оптимизированный memo-рендер TravelTmlRound
const MemoTravelTmlRound = memo(TravelTmlRound);

const ITEM_HEIGHT = 250; // пример — подставь свою высоту TravelTmlRound
const SEPARATOR_HEIGHT = 20;

const PopularTravelList: React.FC<PopularTravelListProps> = memo(
    ({ onLayout, scrollToAnchor, title = 'Популярные маршруты', maxColumns = 3 }) => {
        const [travelsPopular, setTravelsPopular] = useState<TravelsMap>({});
        const [isLoading, setIsLoading] = useState(true);
        const { width } = useWindowDimensions();
        const fadeAnim = useRef(new Animated.Value(0)).current;

        const numColumns = useMemo(() => {
            if (width <= 600) return 1;
            if (width <= 1024) return Math.min(maxColumns, 2);
            return Math.min(maxColumns, 3);
        }, [width, maxColumns]);

        const fetchPopularTravels = useCallback(async () => {
            try {
                const travelData = await fetchTravelsPopular();
                setTravelsPopular(travelData);
            } catch (error) {
                console.error('Failed to fetch popular travel data:', error);
            } finally {
                setIsLoading(false);
            }
        }, []);

        useEffect(() => {
            fetchPopularTravels();
        }, [fetchPopularTravels]);

        const popularList = useMemo(
            () => Object.values(travelsPopular),
            [travelsPopular]
        );

        const renderItem = useCallback(
            ({ item }: { item: Travel }) => <MemoTravelTmlRound travel={item} />,
            []
        );

        const keyExtractor = useCallback(
            (item: Travel) => item.id.toString(),
            []
        );

        const handleContentChange = useCallback(() => {
            if (scrollToAnchor) {
                scrollToAnchor();
            }
        }, [scrollToAnchor]);

        // Анимация появления
        useEffect(() => {
            if (!isLoading && popularList.length > 0) {
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }).start();
            }
        }, [isLoading, popularList.length, fadeAnim]);

        const getItemLayout = useCallback((_: any, index: number) => ({
            length: ITEM_HEIGHT + SEPARATOR_HEIGHT,
            offset: (ITEM_HEIGHT + SEPARATOR_HEIGHT) * index,
            index,
        }), []);

        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6B4F4F" />
                    <Text style={styles.loadingText}>
                        Загрузка популярных маршрутов...
                    </Text>
                </View>
            );
        }

        if (popularList.length === 0) {
            return (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Нет популярных маршрутов 😔</Text>
                </View>
            );
        }

        return (
            <View style={styles.section} onLayout={onLayout}>
                {title !== null && (
                    <Title style={styles.title}>{title}</Title>
                )}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <FlatList
                        key={numColumns} // force re-layout при изменении numColumns
                        data={popularList}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        numColumns={numColumns}
                        contentContainerStyle={styles.flatListContent}
                        columnWrapperStyle={
                            numColumns > 1
                                ? {
                                    justifyContent:
                                        popularList.length % numColumns === 1
                                            ? 'center'
                                            : 'space-between',
                                }
                                : undefined
                        }
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={6}
                        maxToRenderPerBatch={6}
                        windowSize={5}
                        removeClippedSubviews={Platform.OS !== 'web'}
                        getItemLayout={getItemLayout}
                        onContentSizeChange={handleContentChange}
                    />
                </Animated.View>
            </View>
        );
    }
);

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
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#3B2C24',
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'Georgia',
    },
    flatListContent: {
        paddingBottom: 20,
    },
    separator: {
        height: 20,
    },
});

export default PopularTravelList;
