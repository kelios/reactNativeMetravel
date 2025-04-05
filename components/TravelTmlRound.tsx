import React, { useMemo } from 'react'
import {
  View,
  Pressable,
  Dimensions,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { Travel } from '@/src/types/types'
import * as Linking from 'expo-linking'
import { Card, Title, Paragraph, Text } from 'react-native-paper'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import {router} from "expo-router";

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

  const windowDimensions = useWindowDimensions()
  const isLargeScreen = useMemo(
    () => windowDimensions.width > 768,
    [windowDimensions],
  )

  const pointContentStyle = isLargeScreen
    ? styles.pointContentLarge
    : styles.pointContent

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.push(`/travels/${slug}`)}>
        <View style={pointContentStyle}>
          <View style={styles.imageWrapper}>
            <Card.Cover
              source={{ uri: travel_image_thumb_small_url }}
              style={styles.image}
            />
          </View>
          <Text style={styles.text}>{name}</Text>
          <Paragraph style={styles.paragraph}>{countryName}</Paragraph>
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // make sure the container takes the full width given by FlatList for each item
    padding: 5, // optional: some space around each card
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
    alignItems: 'center',
    maxWidth: 800,
    flexShrink: 1,
  },
  pointContentLarge: {
    alignItems: 'center',
    flexShrink: 1,
  },
  imageWrapper: {
    width: 200,
    height: 200,
    borderRadius: 200 / 2,
    overflow: 'hidden',
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
