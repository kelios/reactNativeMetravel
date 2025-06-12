import React, { useMemo } from 'react'
import {
  View,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Image, Platform,
} from 'react-native'
import { Card, Paragraph, Text } from 'react-native-paper'
import { Travel } from '@/src/types/types'
import { router } from 'expo-router'

type TravelTmlRoundProps = {
  travel: Travel
}

const TravelTmlRound = ({ travel }: TravelTmlRoundProps) => {
  const {
    name,
    slug,
    travel_image_thumb_small_url,
    countryName,
  } = travel

  const windowDimensions = useWindowDimensions()
  const isLargeScreen = useMemo(() => windowDimensions.width > 768, [windowDimensions])

  const imageSize = isLargeScreen ? 200 : 140

  return (
      <View style={styles.container}>
        <Pressable
            onPress={() => slug && router.push(`/travels/${slug}`)}
            android_ripple={{ color: '#ccc', borderless: false }}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
        >
          <View style={[styles.shadow, { alignItems: 'center', padding: 10 }]}>
            <View style={[styles.imageWrapper, {
              width: imageSize,
              height: imageSize,
              borderRadius: imageSize / 2,
            }]}>
              <Image
                  source={
                    travel_image_thumb_small_url
                        ? { uri: travel_image_thumb_small_url }
                        : require('@/assets/placeholder.png')
                  }
                  style={[styles.image, { width: imageSize, height: imageSize }]}
                  resizeMode="cover"
                  {...(Platform.OS === 'web' ? { loading: 'lazy' } : {})}
              />
            </View>
            <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.text}
            >
              {name || 'Без названия'}
            </Text>
            <Paragraph
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.paragraph}
            >
              {countryName || 'Страна не указана'}
            </Paragraph>
          </View>
        </Pressable>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  text: {
    paddingTop: 10,
    color: '#4b7c6f',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 200,
  },
  paragraph: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    maxWidth: 200,
  },
  imageWrapper: {
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  shadow: {
    padding: 10,
  }
})

export default TravelTmlRound
