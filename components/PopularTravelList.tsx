import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native'
import { TravelInfo, TravelsMap } from '@/src/types/types'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import {
  useFonts,
  PlayfairDisplay_400Regular,
} from '@expo-google-fonts/playfair-display'
import { fetchTravelsPopular } from '@/src/api/travels'
import TravelTmlRound from '@/components/TravelTmlRound'
import { Title } from 'react-native-paper'

type PopularTravelListProps = {
  onLayout?: (event: any) => void
}
const { width, height } = Dimensions.get('window')

const PopularTravelList = ({ onLayout }: PopularTravelListProps) => {
  const [travelsPopular, setTravelsPopular] = useState<TravelsMap>({})
  const { width }  = useWindowDimensions();
  const isMobile = width <= 768;
  const numCol = isMobile ? 1 : 3;
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchTravelsPopular()
      .then((travelData) => {
        setTravelsPopular(travelData)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch travel data:', error)
      })
  }, [])

  if (isLoading) {
    return <ActivityIndicator />
  }
  return (
    <View style={styles.container} onLayout={onLayout}>
      <Title style={styles.linkText}>Популярные маршруты</Title>
      <FlatList
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        data={Object.values(travelsPopular)}
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

export default PopularTravelList
