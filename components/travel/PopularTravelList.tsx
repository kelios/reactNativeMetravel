import React, {
    useEffect,
    useState,
    useCallback,
    memo,
    useMemo,
} from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    useWindowDimensions,
    Text,
} from 'react-native';
import { TravelsMap, Travel } from '@/src/types/types';
import { fetchTravelsPopular } from '@/src/api/travels';
import TravelTmlRound from '@/components/travel/TravelTmlRound';
import { Title } from 'react-native-paper';

type PopularTravelListProps = {
    onLayout?: (event: any) => void;
    scrollToAnchor?: () => void;
};

const PopularTravelList: React.FC<PopularTravelListProps> = memo(
    ({ onLayout, scrollToAnchor }) => {
        const [travelsPopular, setTravelsPopular] = useState<TravelsMap>({});
        const [isLoading, setIsLoading] = useState(true);
        const { width } = useWindowDimensions();
        const isMobile = width <= 768;
        const numColumns = isMobile ? 1 : 3;

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
            ({ item }: { item: Travel }) => <TravelTmlRound travel={item} />,
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
                <Title style={styles.title}>Популярные маршруты</Title>
                <FlatList
                    key={numColumns}
                    data={popularList}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    numColumns={numColumns}
                    contentContainerStyle={styles.flatListContent}
                    columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews
                    onContentSizeChange={handleContentChange}
                />
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
    columnWrapper: {
        justifyContent: 'space-between',
    },
});

export default PopularTravelList;
