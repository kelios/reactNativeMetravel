import React from 'react'
import {
  View,
  Pressable,
  Dimensions,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { TravelCoords } from '@/src/types/types'
import * as Linking from 'expo-linking'
import { Card, Title, Paragraph, Text } from 'react-native-paper'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import {
  useFonts,
  PlayfairDisplay_400Regular,
} from '@expo-google-fonts/playfair-display'

type AddressListItemProps = {
  travel: TravelCoords
  onImagePress?: () => void
}
const { width, height } = Dimensions.get('window')

const AddressListItem = ({ travel }: AddressListItemProps) => {
  const {
    address,
    categoryName,
    coord,
    lat,
    lng,
    travelImageThumbUrl,
    urlTravel,
  } = travel

  return (
    <Card style={styles.container}>
      <Pressable onPress={() => Linking.openURL(urlTravel)}>
        <View style={styles.imageWrapper}>
          {travelImageThumbUrl && (
            <Card.Cover
              source={{ uri: travelImageThumbUrl }}
              style={styles.image}
            />
          )}
        </View>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.label}>Координаты места :</Text>
          <Text>{coord}</Text>
          <Text style={styles.label}>Адрес места :</Text>
          <Text>{address}</Text>
          <Text style={styles.label}>Категория объекта :</Text>
          <Text>{categoryName}</Text>
        </Card.Content>
      </Pressable>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    borderRadius: 10,
    elevation: 2,
    padding: wp(1.5), // Используем wp для ширины и высоты в процентах от ширины экрана
    margin: wp(1.5),
    marginHorizontal: wp(1.5),
    alignItems: 'center', // Выравнивание по центру
    alignContent: 'center',
  },
  cardContent: {
    alignItems: 'center',
    alignContent: 'center',
  },
  text: {
    paddingTop: 10,
    color: '#4b7c6f',
    fontSize: 16,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 14,
  },
  pointContent: {
    flexShrink: 1,
  },
  pointContentLarge: {
    flexShrink: 1,
  },
  imageWrapper: {
    height: 250,
   // maxWidth: 280,
  //  overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
   // resizeMode: 'contain', // Изменено на 'contain'
  },
  paragraphLeft: {
    marginLeft: wp(1.5),
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ff9f5a',
    borderRadius: 4,
  },
})

export default AddressListItem
