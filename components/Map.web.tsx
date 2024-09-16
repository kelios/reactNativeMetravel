import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Linking } from 'react-native';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet';
import L, { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LabelText from './LabelText';

type Point = {
  id: number;
  lat: string;
  coord: string;
  lng: string;
  address: string;
  travelImageThumbUrl: string;
  categoryName: string;
  articleUrl?: string;
  urlTravel?: string;
};

type PaginatedResponse = {
  current_page: number;
  data: Point[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
};

type TravelPropsType = {
  travelAddress?: PaginatedResponse;
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

type SetViewToBoundsProps = {
  travel: TravelPropsType;
};

const getLatLng = (latlng: string): [number, number] | null => {
  const [lat, lng] = latlng.split(',').map((coord) => parseFloat(coord.trim()));
  if (!isNaN(lat) && !isNaN(lng)) {
    return [lat, lng];
  }
  return null;
};

const Map: React.FC<TravelProps> = ({ travel, coordinates: propCoordinates }) => {
  const travelAddress = travel?.travelAddress?.data || travel?.data || travel?.travelAddress || [];
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
          center={
            localCoordinates
                ? [localCoordinates.latitude, localCoordinates.longitude]
                : [53.8828449, 27.7273595]
          }
          zoom={7}
          style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {travelAddress.length > 0 && travelAddress.map((point, index) => {
          const latLng = getLatLng(point.coord);
          if (latLng) {
            return (
                <Marker key={index} position={latLng} icon={meTravelIcon}>
                  <Popup>
                    <Pressable
                        onPress={() => handlePress(point)}
                        style={styles.popupContent}
                    >
                      {point.travelImageThumbUrl ? (
                          <Image
                              source={{ uri: point.travelImageThumbUrl }}
                              style={styles.pointImage}
                          />
                      ) : (
                          <Text style={styles.linkText}>Перейти к статье</Text>
                      )}
                      <View style={styles.textContainer}>
                        {point.address && <LabelText label="Адрес места:" text={point.address} />}
                        {point.coord && <LabelText label="Координаты:" text={point.coord} />}
                        {point.categoryName && <LabelText label="Категория объекта:" text={point.categoryName} />}
                      </View>
                    </Pressable>
                  </Popup>
                </Marker>
            );
          }
          return null;
        })}
        <SetViewToBounds travel={travel} />
      </MapContainer>
  );
};

const SetViewToBounds: React.FC<SetViewToBoundsProps> = ({ travel }) => {
  const travelAddress = travel?.travelAddress?.data || travel?.data || travel?.travelAddress || [];
  const map = useMapEvents({});

  useEffect(() => {
    if (travelAddress.length) {
      const validLatLngs = travelAddress
          .map((point) => getLatLng(point.coord))
          .filter((latLng) => latLng !== null) as [number, number][];
      if (validLatLngs.length > 0) {
        const bounds = L.latLngBounds(validLatLngs);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [travelAddress, map]);

  return null;
};

const styles = StyleSheet.create({
  pointImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  popupContent: {
    padding:5,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'flex-start', // Изменено с center
    maxWidth: 250, // Устанавливаем максимальную ширину
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
