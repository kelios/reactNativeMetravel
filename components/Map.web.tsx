import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Linking,
  Platform,
} from 'react-native';

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

// Импорты Leaflet и react-leaflet только в веб-среде
let MapContainer: any, TileLayer: any, Marker: any, Popup: any, useMap: any, L: any, Icon: any, MapRoute: any;

if (isWeb) {
  const leaflet = require('leaflet');
  const reactLeaflet = require('react-leaflet');

  MapContainer = reactLeaflet.MapContainer;
  TileLayer = reactLeaflet.TileLayer;
  Marker = reactLeaflet.Marker;
  Popup = reactLeaflet.Popup;
  useMap = reactLeaflet.useMap;
  L = leaflet;
  Icon = leaflet.Icon;

  require('leaflet/dist/leaflet.css');
  MapRoute = require('./Map/MapRoute').default;
}

import LabelText from './LabelText';

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
  travel: TravelPropsType;
  coordinates?: Coordinates | null;
  showRoute?: boolean;
}

// ✅ Безопасная функция парсинга координат
const getLatLng = (latlng: string): [number, number] | null => {
  if (!latlng) return null;
  const [lat, lng] = latlng.split(',').map(Number);
  return isNaN(lat) || isNaN(lng) ? null : [lat, lng];
};

// ✅ Исправленный `FitBoundsOnData`
const FitBoundsOnData: React.FC<{ data: Point[] }> = ({ data }) => {
  if (!isWeb) return null;
  const map = useMap();

  useEffect(() => {
    if (!map || !map._loaded || !data?.length) return;

    const coords = data.map((p) => getLatLng(p.coord)).filter(Boolean);
    if (!coords.length) return;

    const bounds = L.latLngBounds(coords);
    if (bounds.isValid()) {
      setTimeout(() => {
        if (map) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }, 100);
    }
  }, [map, data]);

  return null;
};

const MapClientSideComponent: React.FC<MapClientSideProps> = ({
                                                                travel,
                                                                coordinates,
                                                                showRoute,
                                                              }) => {
  if (!isWeb) return <Text>Карта доступна только в веб-версии</Text>;

  const travelData = travel?.data || [];
  const initialCenter: [number, number] = coordinates
      ? [coordinates.latitude, coordinates.longitude]
      : [53.8828449, 27.7273595];

  const meTravelIcon = useMemo(
      () =>
          new Icon({
            iconUrl: require('@/assets/icons/logo_yellow.ico'),
            iconSize: [27, 30],
            iconAnchor: [13, 30],
            popupAnchor: [0, -30],
          }),
      []
  );

  return (
      <MapContainer
          center={initialCenter}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBoundsOnData data={travelData} />
        {showRoute && MapRoute && <MapRoute data={travelData} profile="driving" />}
        {travelData.map((point, index) => {
          const latLng = getLatLng(point.coord);
          if (!latLng) return null;
          return (
              <Marker key={`${point.id}_${index}`} position={latLng} icon={meTravelIcon}>
                <Popup>
                  <View style={styles.popupCard}>
                    {point.travelImageThumbUrl ? (
                        <Image source={{ uri: point.travelImageThumbUrl }} style={styles.pointImage} />
                    ) : (
                        <Text style={styles.fallbackText}>Нет фото. Нажмите, чтобы открыть статью.</Text>
                    )}
                    <Pressable
                        onPress={() => {
                          const url = point.articleUrl || point.urlTravel;
                          if (url) Linking.openURL(url);
                        }}
                        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }, styles.textContainer]}
                    >
                      {point.address && <LabelText label="Адрес:" text={point.address} />}
                      {point.coord && <LabelText label="Координаты:" text={point.coord} />}
                      {point.categoryName && <LabelText label="Категория:" text={point.categoryName} />}
                    </Pressable>
                  </View>
                </Popup>
              </Marker>
          );
        })}
      </MapContainer>
  );
};

export default MapClientSideComponent;

const styles = StyleSheet.create({
  popupCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    width: 220,
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  pointImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  fallbackText: {
    marginBottom: 8,
    color: '#555',
    fontStyle: 'italic',
  },
  textContainer: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});
