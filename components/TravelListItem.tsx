import { View, Pressable, Dimensions, StyleSheet } from 'react-native'
import { Travel } from '@/src/types/types'
import * as Linking from 'expo-linking'
import { Card, Title, Paragraph, Text } from 'react-native-paper'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import {
  useFonts,
  PlayfairDisplay_400Regular,
} from '@expo-google-fonts/playfair-display'

type TravelListItemProps = {
  travel: Travel
  onImagePress?: () => void
}
const { width, height } = Dimensions.get('window')

const TravelListItem = ({ travel }: TravelListItemProps) => {
  const {
    name,
    url,
    slug,
    travel_image_thumb_url,
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
        <Card style={styles.card}>
          <View style={styles.imageWrapper}>
            <Card.Cover
              source={{ uri: travel_image_thumb_url }}
              style={styles.image}
            />
          </View>
          <Card.Content>
            <Title>{name}</Title>
            <Paragraph>{countryName}</Paragraph>
            <Paragraph>
              <Text>Автор - {userName}</Text>
              <Text style={styles.paragraphLeft}>({countUnicIpView} 👀)</Text>
            </Paragraph>
          </Card.Content>
        </Card>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 40,
  },
  card: {
    borderRadius: 10,
    elevation: 2,
    padding: wp(1.5),
    marginHorizontal: wp(1.5),
    maxWidth: 600,
  },
  imageWrapper: {
    flex: width < 600 ? 0 : 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
  },
  image: {
    aspectRatio: 1 / 1,
    width: '100%',
    height: width < 600 ? 340 : 600,
  },
  paragraphLeft: {
    marginLeft: wp(1.5),
  },
})

export default TravelListItem
