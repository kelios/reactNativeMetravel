import React, { useEffect, useState } from 'react';
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

const NearTravelList = ({ travel, onLayout }: NearTravelListProps) => {
  const [travelsNear, setTravelsNear] = useState<Travel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;

  useEffect(() => {
    setIsLoading(true); // Start loading
    fetchTravelsNear(Number(travel.id))
        .then((travelData) => {
          setTravelsNear(travelData);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch travel data:', error);
          setIsLoading(false);
        });
  }, [travel]);

  if (isLoading) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#935233" />
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
            contentContainerStyle={styles.flatListContent}
            showsHorizontalScrollIndicator={false}
            data={travelsNear}
            renderItem={({ item }) => <TravelTmlRound travel={item} />}
            keyExtractor={(item) => item.id.toString()}
            numColumns={isMobile ? 1 : 3} // Прямо передаем количество колонок
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

export default NearTravelList;
