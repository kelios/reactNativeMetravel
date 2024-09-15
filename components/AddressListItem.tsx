import React from 'react';
import { View, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import * as Linking from 'expo-linking';
import { Card, Text } from 'react-native-paper';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { TravelCoords } from '@/src/types/types';

type AddressListItemProps = {
  travel: TravelCoords;
  onImagePress?: () => void;
};

const AddressListItem: React.FC<AddressListItemProps> = ({ travel }) => {
  const {
    address,
    categoryName,
    coord,
    travelImageThumbUrl,
    urlTravel,
  } = travel;
  const { width } = useWindowDimensions();

  return (
      <Card style={styles.container}>
        <Pressable onPress={() => Linking.openURL(urlTravel)}>
          {travelImageThumbUrl && (
              <View style={styles.imageWrapper}>
                <Card.Cover
                    source={{ uri: travelImageThumbUrl }}
                    style={styles.image}
                />
              </View>
          )}
          <Card.Content style={styles.cardContent}>
            <Text style={styles.label}>Координаты места:</Text>
            <Text style={styles.text}>{coord}</Text>
            <Text style={styles.label}>Адрес места:</Text>
            <Text style={styles.text}>{address}</Text>
            <Text style={styles.label}>Категория объекта:</Text>
            <Text style={styles.text}>{categoryName}</Text>
          </Card.Content>
        </Pressable>
      </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 10,
    elevation: 2,
    padding: wp(3),
    margin: wp(2),
    backgroundColor: '#fff',
  },
  cardContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  text: {
    color: '#4b7c6f',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 2,
  },
  imageWrapper: {
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ff9f5a',
    borderRadius: 4,
  },
});

export default AddressListItem;
