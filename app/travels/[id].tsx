import { fetchTravel } from '@/src/api/travels'
import { Stack, useLocalSearchParams, useGlobalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  View,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
} from 'react-native'
import { Travel } from '@/src/types/types'
import RenderHtml from 'react-native-render-html'
import { Card, Title, Text } from 'react-native-paper'
import Slider from '@/components/Slider'
import { IS_LOCAL_API } from '@env'

const TravelDetails = () => {
  const { id } = useLocalSearchParams()
  const [travel, setTravel] = useState<Travel>()
  const { width } = useWindowDimensions()

  useEffect(() => {
    fetchTravel(Number(id)).then((travelData) => {
      setTravel(travelData)
    })
  }, [id])

  if (!travel) {
    return <ActivityIndicator />
  }

  const gallery =
    IS_LOCAL_API == 'true'
      ? travel.gallery
      : travel.gallery.map((item) => item.url)

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Stack.Screen options={{ headerTitle: travel.name }} />
      <View>
        <Slider images={gallery} />
      </View>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{travel.name}</Title>
          {travel?.description && (
            <RenderHtml source={{ html: travel.description }} />
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    //maxWidth: 800
    //justifyContent: 'center',
    //alignItems: 'center',
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    flex: 1,
    width: '100%',
    height: '100%',
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
