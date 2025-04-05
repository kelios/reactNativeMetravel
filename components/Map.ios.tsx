import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

type Point = {
  id: number;
  lat: string;
  lng: string;
  coord: string;
  address: string;
  travelImageThumbUrl: string;
  categoryName: string;
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
  travelAddress: PaginatedResponse;
};

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface TravelProps {
  travel: TravelPropsType;
  coordinates: Coordinates | null;
}

const getLatLng = (coord: string) => {
  const [latitude, longitude] = coord.split(',').map(Number);
  return { latitude, longitude };
};

const Map: React.FC<TravelProps> = ({ travel, coordinates: propCoordinates }) => {
  const travelAddress = travel?.travelAddress?.data || [];

  const [localCoordinates, setLocalCoordinates] = useState<Coordinates | null>(propCoordinates);

  useEffect(() => {
    if (!localCoordinates) {
      setLocalCoordinates({ latitude: 53.8828449, longitude: 27.7273595 });
    }
  }, [localCoordinates]);

  const region = {
    latitude: localCoordinates?.latitude ?? 53.8828449,
    longitude: localCoordinates?.longitude ?? 27.7273595,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (mapRef.current && travelAddress.length) {
      const coordinates = travelAddress.map((point) => getLatLng(point?.coord));
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 10, right: 10, bottom: 10, left: 10 },
        animated: true,
      });
    }
  }, [travelAddress]);

  return (
      <MapView style={styles.map} ref={mapRef} initialRegion={region}>
        {travelAddress.map((point, index) => (
            <Marker key={index} coordinate={getLatLng(point?.coord)} title={String(point?.address)}>
              <Callout>
                <View>
                  {point?.travelImageThumbUrl ? (
                      <Image source={{ uri: point?.travelImageThumbUrl }} style={styles.pointImage} />
                  ) : null}
                  <Text style={styles.label}>Адрес места:</Text>
                  <Text>{String(point.address)}</Text>
                  <Text style={styles.label}>Координаты:</Text>
                  <Text>{String(point.coord)}</Text>
                  <Text style={styles.label}>Категория объекта:</Text>
                  <Text>{String(point.categoryName)}</Text>
                </View>
              </Callout>
            </Marker>
        ))}
      </MapView>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 10,
  },
});

export default Map;
