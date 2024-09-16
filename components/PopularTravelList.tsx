import React, { useEffect, useState } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    useWindowDimensions,
    Text,
} from 'react-native';
import { TravelsMap } from '@/src/types/types';
import { fetchTravelsPopular } from '@/src/api/travels';
import TravelTmlRound from '@/components/TravelTmlRound';
import { Title } from 'react-native-paper';

type PopularTravelListProps = {
    onLayout?: (event: any) => void;
};

const PopularTravelList = ({ onLayout }: PopularTravelListProps) => {
    const [travelsPopular, setTravelsPopular] = useState<TravelsMap>({});
    const [isLoading, setIsLoading] = useState(true);
    const { width } = useWindowDimensions();
    const isMobile = width <= 768;

    useEffect(() => {
        fetchTravelsPopular()
            .then((travelData) => {
                setTravelsPopular(travelData);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Failed to fetch travel data:', error);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#935233" />
                <Text style={styles.loadingText}>Загрузка популярных маршрутов...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container} onLayout={onLayout}>
            <Title style={styles.title}>Популярные маршруты</Title>
            <FlatList
                contentContainerStyle={styles.flatListContent}
                showsHorizontalScrollIndicator={false}
                data={Object.values(travelsPopular)}
                renderItem={({ item }) => <TravelTmlRound travel={item} />}
                keyExtractor={(item) => item.id.toString()}
                numColumns={isMobile ? 1 : 3}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        marginBottom: 20,
        paddingHorizontal: 20,
        width: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#935233',
        marginBottom: 20,
        textAlign: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#935233',
        paddingBottom: 10,
    },
    flatListContent: {
        justifyContent: 'space-between',
    },
});

export default PopularTravelList;
