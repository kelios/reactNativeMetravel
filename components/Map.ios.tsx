import React, { useState, useEffect } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import MapView, { Marker, Callout } from 'react-native-maps'

type Point = {
  id: number
  coord: string
  address: string
  travelImageThumbUrl: string
  categoryName?: string
}

interface Coordinates {
  latitude: number
  longitude: number
}

interface TravelProps {
  travel: TravelPropsType
  coordinates: Coordinates | null
}

type TravelPropsType = {
  travelAddress: Point[]
}

const getLatLng = (coord: string) => {
  const [latitude, longitude] = coord.split(',').map(Number)
  return { latitude, longitude }
}

const Map: React.FC<TravelProps> = ({
  travel,
  coordinates: propCoordinates,
}) => {
  const travelAddress = travel?.travelAddress || travel || []

  const [localCoordinates, setLocalCoordinates] = useState<{
    latitude: number
    longitude: number
  } | null>(propCoordinates)

  useEffect(() => {
    if (!localCoordinates) {
      setLocalCoordinates({ latitude: 53.8828449, longitude: 27.7273595 })
    }
  }, [localCoordinates])

  const region = {
    latitude: localCoordinates ? localCoordinates.latitude : '53.8828449',
    longitude: localCoordinates ? localCoordinates.longitude : '53.8828449',
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }
  const mapRef = React.useRef<MapView | null>(null)
  React.useEffect(() => {
    if (mapRef.current && travelAddress.length) {
      const coordinates = travelAddress.map((point) => getLatLng(point?.coord))
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 10, right: 10, bottom: 10, left: 10 },
        animated: true,
      })
    }
  }, [travel])

  return (
    <MapView style={styles.map} ref={mapRef} initialRegion={region}>
      {travelAddress.map((point, index) => (
        <Marker
          key={index}
          coordinate={getLatLng(point?.coord)}
          title={point?.address}
        >
          <Callout>
            <View>
              {point?.travelImageThumbUrl && (
                <Image
                  source={{ uri: point?.travelImageThumbUrl }}
                  style={styles.pointImage}
                />
              )}
              <Text>{point?.coord}</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: 300,
  },
  label: {
    fontWeight: 'bold',
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ff9f5a',
    borderRadius: 4,
  },
  pointImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
})

export default Map
