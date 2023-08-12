import { Text, View } from '@/components/Themed';

import { StyleSheet, FlatList, ActivityIndicator } from 'react-native';
//import apodsJson from '../data/apods.json';
import TravelListItem from '@/components/TravelListItem';
import { useEffect, useState } from 'react';
//import FullScreenImage from '../components/FullScreenImage';
import { Travel } from '@/types';
import { fetchTravelsby } from '@/src/api/travels';


export default function TravelsBycreen() {

  const [travels, setTravels] = useState<Travel[]>([]);
  //const [activePicture, setActivePicture] = useState<string>(null);

  useEffect(() => {
    fetchTravelsby().then(
      setTravels
      );
  }, []);

  if (!travels) {
    return <ActivityIndicator />;
  }


  return (
    <View style={styles.container}>
      <FlatList
        data={travels}
        renderItem={({ item }) => (
          <TravelListItem
            travel={item}
           // onImagePress={() => setActivePicture(item.travel_image_thumb_url)}
          />
        )}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
