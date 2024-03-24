import React, { useEffect, useState } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native'
import { TravelsMap } from '@/src/types/types'
import { fetchTravelsPopular } from '@/src/api/travels'
import TravelTmlRound from '@/components/TravelTmlRound'
import { Title } from 'react-native-paper'

type PopularTravelListProps = {
  onLayout?: (event: any) => void
}

const PopularTravelList = ({ onLayout }: PopularTravelListProps) => {
  const [travelsPopular, setTravelsPopular] = useState<TravelsMap>({})
  const [isLoading, setIsLoading] = useState(true)
  const { width } = useWindowDimensions()
  const isMobile = width <= 768

  useEffect(() => {
    fetchTravelsPopular()
        .then((travelData) => {
          setTravelsPopular(travelData)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Failed to fetch travel data:', error)
          setIsLoading(false)
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
            numColumns={isMobile ? 1 : 3}
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
    color: '#935233', // Color for the title
    borderBottomColor: 'black',
  },
})

export default PopularTravelList