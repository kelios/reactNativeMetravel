import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Linking, Platform } from 'react-native';

// Проверяем, есть ли `window`, чтобы избежать ошибки
const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

let MapContainer, TileLayer, Marker, Popup, useMapEvents, L, Icon;
if (isWeb) {
  MapContainer = require('react-leaflet').MapContainer;
  TileLayer = require('react-leaflet').TileLayer;
  Marker = require('react-leaflet').Marker;
  Popup = require('react-leaflet').Popup;
  useMapEvents = require('react-leaflet').useMapEvents;
  L = require('leaflet');
  Icon = require('leaflet').Icon;
  require('leaflet/dist/leaflet.css');
}

import LabelText from './LabelText';

type Point = {
  id: number;
  coord: string;
  address: string;
  travelImageThumbUrl: string;
  categoryName: string;
  articleUrl?: string;
  urlTravel?: string;
};

type TravelPropsType = {
  data?: Point[];
};

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface TravelProps {
  travel: TravelPropsType;
  coordinates: Coordinates | null;
}

const getLatLng = (latlng: string): [number, number] | null => {
  const [lat, lng] = latlng.split(',').map((coord) => parseFloat(coord.trim()));
  if (!isNaN(lat) && !isNaN(lng)) {
    return [lat, lng];
  }
  return null;
};

const Map: React.FC<TravelProps> = ({ travel, coordinates: propCoordinates }) => {
  if (!isWeb) {
    return <Text>Карта доступна только в веб-версии</Text>;
  }

  const travelAddress = travel?.data || [];
  const [localCoordinates, setLocalCoordinates] = useState<Coordinates | null>(propCoordinates);

  useEffect(() => {
    if (!localCoordinates) {
      setLocalCoordinates({ latitude: 53.8828449, longitude: 27.7273595 });
    }
  }, [localCoordinates]);

  const meTravelIcon = useMemo(
      () =>
          new Icon({
            iconUrl: '/assets/icons/logo_yellow.ico',
            iconSize: [27, 30],
            iconAnchor: [13, 30],
            popupAnchor: [0, -30],
          }),
      []
  );

  const handlePress = (point: Point) => {
    const url = point.articleUrl || point.urlTravel;
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
      <MapContainer
          center={localCoordinates ? [localCoordinates.latitude, localCoordinates.longitude] : [53.8828449, 27.7273595]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {travelAddress.map((point, index) => {
          const latLng = getLatLng(point.coord);
          if (latLng) {
            return (
                <Marker key={index} position={latLng} icon={meTravelIcon}>
                  <Popup>
                    <Pressable onPress={() => handlePress(point)} style={styles.popupContent}>
                      {point.travelImageThumbUrl ? (
                          <Image source={{ uri: point.travelImageThumbUrl }} style={styles.pointImage} />
                      ) : (
                          <Text style={styles.linkText}>Перейти к статье</Text>
                      )}
                      <View style={styles.textContainer}>
                        {point.address && <LabelText label="Адрес:" text={point.address} />}
                        {point.coord && <LabelText label="Координаты:" text={point.coord} />}
                        {point.categoryName && <LabelText label="Категория:" text={point.categoryName} />}
                      </View>
                    </Pressable>
                  </Popup>
                </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
  );
};

const styles = StyleSheet.create({
  pointImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  popupContent: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'flex-start',
    maxWidth: 250,
  },
  textContainer: {
    paddingHorizontal: 10,
  },
  linkText: {
    color: '#007bff',
    textDecorationLine: 'underline',
    marginBottom: 8,
  },
});

export default Map;
