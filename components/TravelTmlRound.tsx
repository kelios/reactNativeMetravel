import { View, Pressable, Dimensions, StyleSheet } from 'react-native'
import { Travel } from '@/src/types/types'
import * as Linking from 'expo-linking'
import { Card, Title, Paragraph, Text } from 'react-native-paper'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import {
  useFonts,
  PlayfairDisplay_400Regular,
} from '@expo-google-fonts/playfair-display'

type TravelTmlRoundProps = {
  travel: Travel
}
const { width, height } = Dimensions.get('window')

const TravelTmlRound = ({ travel }: TravelTmlRoundProps) => {
  const {
    name,
    url,
    slug,
    travel_image_thumb_url,
    travel_image_thumb_small_url,
    id,
    cityName,
    countryName,
    userName,
    countUnicIpView,
  } = travel

  const Urltravel = Linking.createURL(`travels/${slug}`, {
    queryParams: { id: id },
  })

  return (
    <View style={styles.container}>
      <Pressable onPress={() => Linking.openURL(Urltravel)}>
        <View style={styles.imageWrapper}>
          <Card.Cover
            source={{ uri: travel_image_thumb_small_url }}
            style={styles.image}
          />
        </View>
        <Text style={styles.text}>{name}</Text>
        <Paragraph style={styles.paragraph}>{countryName}</Paragraph>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // make sure the container takes the full width given by FlatList for each item
    padding: 5, // optional: some space around each card
  },
  text:{
    color: '#4b7c6f',
    fontSize: 14
  },
  paragraph:{
    fontSize: 12
  },
  card: {
    width: '100%', // fill the available width, given the container padding
    borderRadius: 10,
    elevation: 2,
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center', // to ensure the image stays centered
    width: 150, // e.g., 100
    height: 150, // e.g., 100
    borderRadius: 150 / 2, // this makes it circular
    overflow: 'hidden', // this makes sure the image doesn't go outside the circle
  },
  image: {
    width: '100%',
    height: '100%',
  },
  paragraphLeft: {
    marginLeft: wp(1.5),
  },
})

export default TravelTmlRound
