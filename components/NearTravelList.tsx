// NearTravelList.tsx

import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Travel } from '@/src/types/types';
import { fetchTravelsNear } from '@/src/api/travels';
import TravelTmlRound from '@/components/TravelTmlRound';
import { Title } from 'react-native-paper';

type NearTravelListProps = {
  travel: Travel;
  onLayout?: (event: any) => void;
};

const NearTravelList: React.FC<NearTravelListProps> = memo(({ travel, onLayout }) => {
  const [travelsNear, setTravelsNear] = useState<Travel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;

  const numColumns = isMobile ? 1 : 3;

  const fetchNearbyTravels = useCallback(async () => {
    try {
      setIsLoading(true);
      const travelData = await fetchTravelsNear(Number(travel.id));
      setTravelsNear(travelData);
    } catch (error) {
      console.error('Failed to fetch travel data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [travel.id]);

  useEffect(() => {
    fetchNearbyTravels();
  }, [fetchNearbyTravels]);

  const renderItem = useCallback(
      ({ item }: { item: Travel }) => <TravelTmlRound travel={item} onPress={() => {}} />,
      []
  );

  const keyExtractor = useCallback((item: Travel) => item.id.toString(), []);

  if (isLoading) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B4F4F" />
          <Text style={styles.loadingText}>Загрузка маршрутов рядом...</Text>
        </View>
    );
  }

  return (
      <View style={styles.container} onLayout={onLayout}>
        <Title style={styles.title}>
          Рядом (~60км) можно еще посмотреть...
        </Title>
        <FlatList
            key={numColumns}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            data={travelsNear}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={numColumns}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
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

export default NearTravelList;
