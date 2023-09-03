import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
  Platform,
} from 'react-native'
import { Stack, useLocalSearchParams, useGlobalSearchParams } from 'expo-router'
import { Travel } from '@/src/types/types'
import RenderHtml from 'react-native-render-html'
import { Card, Title } from 'react-native-paper'
import Slider from '@/components/Slider'
import Map from '@/components/Map'
import PointList from '@/components/PointList'
import { IS_LOCAL_API } from '@env'
import { fetchTravel } from '@/src/api/travels'

interface TravelDetailsProps {
  id: number
}

const TravelDetails: React.FC<TravelDetailsProps> = () => {
  const { id } = useLocalSearchParams()
  const [travel, setTravel] = useState<Travel | null>(null)
  const { width } = useWindowDimensions()
  const isWeb = Platform.OS === 'web'

  useEffect(() => {
    fetchTravel(Number(id)).then((travelData) => {
      setTravel(travelData)
    })
  }, [id])

  if (!travel) {
    return <ActivityIndicator />
  }

 /* const renderMap = () => {
    const RenderedMap = isWeb ? WebMap : NativeMap
    return <RenderedMap travel={travel} />
  }*/

  const gallery =
    IS_LOCAL_API === 'true'
      ? travel.gallery
      : travel.gallery.map((item) => item?.url)
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Stack.Screen options={{ headerTitle: travel.name }} />
      <View style={styles.centeredContainer}>
        <Slider images={gallery} />
        <Card style={styles.card}>
          <Card.Content>
            <Title>{travel.name}</Title>
            {travel?.description && (
              <RenderHtml
                source={{ html: travel.description }}
                contentWidth={width - 50}
              />
            )}
          </Card.Content>
        </Card>
        <Map travel={travel} />
        <PointList points={travel?.travelAddress} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 800,
    marginHorizontal: 'auto', // Horizontally center the content
  },
  card: {
    margin: 20,
    elevation: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    maxWidth: 800,
  },
})

export default TravelDetails
