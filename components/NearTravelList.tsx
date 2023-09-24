import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native'
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
  const [travelsNear, setTravelsNear] = useState<Travel[]>([])
  const { width } = useWindowDimensions()
  const isMobile = width <= 768
  const numCol = isMobile ? 1 : 3
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchTravelsNear(Number(travel.id))
      .then((travelData) => {
        setTravelsNear(travelData)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch travel data:', error)
      })
  }, [travel])

  if (isLoading) {
    return <ActivityIndicator />
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Title style={styles.linkText}>
        Рядом (~60км) можно еще посмотреть...
      </Title>
      <FlatList
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        data={travelsNear}
        renderItem={({ item }) => <TravelTmlRound travel={item} />}
        keyExtractor={(item) => item.id.toString()}
        horizontal={false}
        numColumns={numCol}
        key={numCol}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    margin: 5,
    width: '100%',
  },
  linkText: {
    paddingTop: 50,
    paddingBottom: 50,
    color: '#935233', // Color for the link (iOS blue)
    borderBottomColor: 'black',
  },
})

export default NearTravelList
