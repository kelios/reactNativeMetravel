import TravelsListItem from '@/components/TravelListItem';
import { fetchTravel } from '@/src/api/travels';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { Travel } from '@/types';

const TravelDetails = () => {
  const { id } = useLocalSearchParams(); // prev: useSearchParams()

  const [travel, setTravel] = useState<Travel>();

  useEffect(() => {
    fetchTravel(id).then(setTravel);
  }, [id]);

  if (!travel) {
    return <ActivityIndicator />;
  }

  return (
    <ScrollView>
      <TravelsListItem travel={travel} />
      <Text
        style={{
          padding: 15,
          backgroundColor: 'white',
          lineHeight: 22,
          fontSize: 16,
          maxWidth: 500,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        {travel.description}
      </Text>
    </ScrollView>
  );
};

export default TravelDetails;
