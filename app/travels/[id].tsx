import { fetchTravel } from '@/src/api/travels'
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  View, ScrollView, Image,ActivityIndicator,useWindowDimensions,StyleSheet
} from 'react-native'
import { Travel } from '@/src/types/types'
import HTML from 'react-native-render-html'
import { Card,Title } from 'react-native-paper'
import Carousel from 'react-native-reanimated-carousel'
import { IS_LOCAL_API } from '@env'


const TravelDetails = () => {
  const { id } = useLocalSearchParams()
  const [travel, setTravel] = useState<Travel>()
  const { width } = useWindowDimensions();

  useEffect(() => {
    fetchTravel(Number(id)).then((travelData) => {
      setTravel(travelData)
    })
  }, [id])

  if (!travel) {
    return <ActivityIndicator />
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
       <View style={styles.carouselContainer}>
       <Carousel
          loop
          width={width}
          height={500}
        //  autoPlay={true}
          data={IS_LOCAL_API == 'true' ? travel.gallery : travel.gallery.map((item) => item.url)}
          scrollAnimationDuration={10000}
          pagingEnabled={true}
          onSnapToItem={index => console.log('current index:', index)}
          renderItem={({index, item}) => (
            <View
              key={index}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
               // paddingVertical: scaleHeight(0.1),
              }}>
              <Image
                style={{
                  width: 500,
                  height: 500,
               //   borderRadius: scaleHeight(1.5),
                }}
                source={{uri: item}}
              />
            </View>
          )}
        />
      </View>
      <Card style={styles.card}>
      <Card.Content>
          <Title>{travel.name}</Title>
          <HTML source={{ html: travel.description }} />
        </Card.Content>
      </Card>
      
    </ScrollView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselContainer: {
    marginVertical: 20,
  },
  card: {
    margin: 20,
    elevation: 5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  imageWrapper: {
    aspectRatio: 1 / 1, // Set your desired aspect ratio here
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden', // To clip the image to the aspect ratio

  },
  image: {
    flex: 1,
  },
  paragraphLeft: {
    marginLeft: 10,
  },
})
export default TravelDetails
