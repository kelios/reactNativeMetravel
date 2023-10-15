import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Popup,
  useMapEvents,
} from 'react-leaflet'
import L, { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

type Point = {
  id: number
  coord: string
  address: string
  travelImageThumbUrl: string
  categoryName: string
}

type TravelPropsType = {
  travelAddress: Point[]
}

interface TravelProps {
  travel: TravelPropsType
}

type SetViewToBoundsProps = {
  travel: TravelPropsType
}

const getLatLng = (latlng: string): [number, number] => {
  const [lat, lng] = latlng.split(',').map((coord) => parseFloat(coord))
  return [lat, lng]
}

const Map: React.FC<TravelProps> = ({ travel }) => {
  const travelAddress = travel?.travelAddress || travel || []
  const meTravelIcon = new Icon({
    iconUrl: '/assets/icons/logo_yellow.ico',
    iconSize: [27, 30],
    iconAnchor: [27, 15],
    popupAnchor: [0, -15],
  })

  return (
    <MapContainer
      center={[53.8828449, 27.7273595]}
      zoom={7}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {travelAddress.map((point, index) => (
        <Marker
          key={index}
          position={getLatLng(point.coord)}
          icon={meTravelIcon}
        >
          <Popup>
            <View key={point.id}>
              <Image
                source={{ uri: point.travelImageThumbUrl }}
                style={styles.pointImage}
              />
              <Text style={styles.label}>Адрес места :</Text>
              <Text>{point.address}</Text>
              <Text style={styles.label}>Координаты :</Text>
              <Text>{point.coord}</Text>
              <Text style={styles.label}>Категория обьекта :</Text>
              <Text>{point.categoryName}</Text>
            </View>
          </Popup>
        </Marker>
      ))}
      <SetViewToBounds travel={travel} />
    </MapContainer>
  )
}

const SetViewToBounds: React.FC<SetViewToBoundsProps> = ({ travel }) => {
  const travelAddress = travel?.travelAddress || travel || []
  const map = useMapEvents({})
  useEffect(() => {
    if (travelAddress.length) {
      const bounds = L.latLngBounds(
        travelAddress.map((point) => getLatLng(point.coord)),
      )
      map.fitBounds(bounds)
    }
  }, [travel, map])
  return null
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    /// backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 1000,
  },
  webMap: {
    height: '100%',
    width: '100%',
    border: '1px solid #ccc',
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  label: {
    fontWeight: 'bold',
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ff9f5a',
    borderRadius: 4,
  },
  pointImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
})

export default Map
