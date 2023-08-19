import {
  View,
  Pressable,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,

} from 'react-native'
import React from 'react'
import { Travel } from '@/src/types/types'
import { Link } from 'expo-router'
import { Card, Title, Paragraph,Text } from 'react-native-paper'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

type TravelListItemProps = {
  travel: Travel
  onImagePress?: () => void
}

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

  return (
    <View style={styles.container}>
    <Link
    href={{
      pathname: '/travels/[slug]',
      params: { id: id, slug: slug },
    }}
  >
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
  </Link>
  </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  card: {
    borderRadius: 10,
    elevation: 4, // Shadow
    width:500,
  },
  imageWrapper: {
    aspectRatio: 1 / 1, // Set your desired aspect ratio here
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden', // To clip the image to the aspect ratio

  },
  image: {
    flex: 1,
  },
  paragraphLeft: {
    marginLeft: 10,
  },
})

export default TravelListItem