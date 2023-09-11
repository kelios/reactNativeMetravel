import React, { useEffect, useState, useRef } from 'react'
import { View, FlatList, Dimensions, StyleSheet, Text } from 'react-native'
import { Travels, Travel } from '@/src/types/types'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import {
  useFonts,
  PlayfairDisplay_400Regular,
} from '@expo-google-fonts/playfair-display'
import { fetchTravelsNear } from '@/src/api/travels'
import TravelTmlRound from '@/components/TravelTmlRound'
import { Title } from 'react-native-paper'

type NearTravelListProps = {
  travel: Travel
  onLayout?: (event: any) => void
}
const { width, height } = Dimensions.get('window')

const NearTravelList = ({ travel, onLayout }: NearTravelListProps) => {
  const [travelsNear, setTravelsNear] = useState<Travels[]>([])

  useEffect(() => {
    fetchTravelsNear(Number(travel.id))
      .then((travelData) => {
        setTravelsNear(travelData)
      })
      .catch((error) => {
        console.error('Failed to fetch travel data:', error)
      })
  }, [travel])

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Title style={styles.linkText}>Рядом (~60км) можно еще посмотреть...</Title>
      <FlatList
        data={travelsNear}
        renderItem={({ item }) => <TravelTmlRound travel={item} />}
        keyExtractor={(item) => item.id.toString()}
        horizontal={false}
        numColumns={3}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    margin: 5,
  },
  linkText: {
    paddingTop:50,
    paddingBottom:50,
    color: '#935233', // Color for the link (iOS blue)
    borderBottomColor:'black'
  },
})

export default NearTravelList
