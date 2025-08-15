import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import PopupContentComponent from "@/components/MapPage/PopupContentComponent";

export type Point = {
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

interface MapClientSideProps {
  travel?: TravelPropsType;
  coordinates?: Coordinates | null;
  showRoute?: boolean;
}

const getLatLng = (latlng: string): [number, number] | null => {
  if (!latlng) return null;
  const [lat, lng] = latlng.split(',').map(Number);
  return isNaN(lat) || isNaN(lng) ? null : [lat, lng];
};

const MapClientSideComponent: React.FC<MapClientSideProps> = ({
                                                                travel = { data: [] },
                                                                coordinates = { latitude: 53.8828449, longitude: 27.7273595 },
                                                              }) => {
  const isBrowser = typeof window !== 'undefined' && Platform.OS === 'web';
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  if (!isBrowser) {
    return <Text style={{ padding: 20 }}>Карта доступна только в браузере</Text>;
  }

  const leaflet = require('leaflet');
  const { MapContainer, TileLayer, Marker, Popup, useMap } = require('react-leaflet');
  require('leaflet/dist/leaflet.css');

  const travelData = travel.data || [];
  const initialCenter: [number, number] = [coordinates.latitude, coordinates.longitude];

  const meTravelIcon = useMemo(
      () =>
          new leaflet.Icon({
            iconUrl: require('@/assets/icons/marker.ico'),
            iconSize: [27, 30],
            iconAnchor: [13, 30],
            popupAnchor: [0, -30],
          }),
      []
  );

  const FitBoundsOnData: React.FC<{ data: Point[] }> = ({ data }) => {
    const map = useMap();
    useEffect(() => {
      const coords = data.map((p) => getLatLng(p.coord)).filter(Boolean) as [number, number][];
      if (!coords.length) return;
      const bounds = leaflet.latLngBounds(coords);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [map, data]);
    return null;
  };

  return (
      <View style={styles.mapContainer}>
        {isReady && (
            <MapContainer
                center={initialCenter}
                zoom={7}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <FitBoundsOnData data={travelData} />
              {travelData.map((point, index) => {
                const latLng = getLatLng(point.coord);
                if (!latLng) return null;
                return (
                    <Marker key={`${point.id}_${index}`} position={latLng} icon={meTravelIcon}>
                      <Popup>
                        <PopupContentComponent travel={point} />
                      </Popup>
                    </Marker>
                );
              })}
            </MapContainer>
        )}
      </View>
  );
};

export default MapClientSideComponent;

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
});
