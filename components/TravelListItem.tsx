import { View, Text, Pressable, Image, StyleSheet } from 'react-native'
import React from 'react'
import { Travel } from '@/types'
import { Link } from 'expo-router'
import { StackActions } from '@react-navigation/native';

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
          <Text style={{ alignSelf: 'flex-end' }}> Автор - {userName} </Text>

          <Link
           href={`/travels/${id}`}
          >
            Читать далее {'>'} ({countUnicIpView})
          </Link>
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
