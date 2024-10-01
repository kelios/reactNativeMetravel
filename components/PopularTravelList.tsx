// PopularTravelList.tsx

import React, { useEffect, useState, useCallback, memo } from 'react';
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
import TravelTmlRound from '@/components/TravelTmlRound';
import { Title } from 'react-native-paper';

type PopularTravelListProps = {
    onLayout?: (event: any) => void;
    scrollToAnchor?: () => void;
};

const PopularTravelList: React.FC<PopularTravelListProps> = memo(({ onLayout, scrollToAnchor }) => {
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
            console.error('Failed to fetch travel data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPopularTravels();
    }, [fetchPopularTravels]);

    const renderItem = useCallback(
        ({ item }: { item: Travel }) => <TravelTmlRound travel={item} onPress={() => {}} />,
        []
    );

    const keyExtractor = useCallback((item: Travel) => item.id.toString(), []);

    const handleContentChange = useCallback(() => {
        if (scrollToAnchor) {
            scrollToAnchor();
        }
    }, [scrollToAnchor]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6B4F4F" />
                <Text style={styles.loadingText}>Загрузка популярных маршрутов...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container} onLayout={onLayout}>
            <Title style={styles.title}>Популярные маршруты</Title>
            <FlatList
                key={numColumns}
                contentContainerStyle={styles.flatListContent}
                showsVerticalScrollIndicator={false}
                data={Object.values(travelsPopular)}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                numColumns={numColumns}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                onContentSizeChange={handleContentChange}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        marginBottom: '20%',
        paddingHorizontal: 20,
        width: '100%',
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
    },
});

export default PopularTravelList;
