import { View, Text, Pressable, Image, StyleSheet } from 'react-native'
import React from 'react'
import { Travel } from '@/src/types/types'
import { Link } from 'expo-router'

type TravelListItemProps = {
  travel: Travel
  onImagePress?: () => void
}

const TravelListItem = ({
  travel,
  onImagePress = () => {},
}: TravelListItemProps) => {
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
    <View style={styles.item}>
      <Pressable onPress={onImagePress}>
        <Image source={{ uri: travel_image_thumb_url }} style={styles.image} />
      </Pressable>
      <Text style={styles.date}>{name}</Text>

      <Link href={`/travels/${id}`} asChild>
        <Pressable style={styles.content}>
          <Text style={styles.title}>{name}</Text>
          <Text>
            {countryName}
            {cityName && -{ cityName }}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 12, lineHeight: 30, color: '#9394B3' }}>
              Автор - {userName}
            </Text>
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                lineHeight: 30,
                color: '#1D2359',
                textAlign: 'right',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                }}
              >
                {countUnicIpView}{' '}
              </Text>
              👀
            </Text>
          </View>
        </Pressable>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    elevation: 4,
    marginBottom: 16,
    overflow: 'hidden',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  date: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: 'black',
    padding: 3,
    borderRadius: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  link: {
    cursor: 'pointer',
    color: '#4b7c6f',
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  copyright: {
    color: 'gray',
  },
})

export default TravelListItem
