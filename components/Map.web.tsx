import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Linking, Platform } from 'react-native';
import LabelText from './LabelText';
import { MapPin, SendHorizonal } from 'lucide-react-native';

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
  const [isVisible, setIsVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsReady(true), 100); // ждем готовности DOM
    return () => clearTimeout(timeout);
  }, []);

  if (!isBrowser) {
    return <Text style={{ padding: 20 }}>Карта доступна только в браузере</Text>;
  }

  const leaflet = require('leaflet');
  const {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
  } = require('react-leaflet');

  require('leaflet/dist/leaflet.css');

  const travelData = travel.data || [];

  const initialCenter: [number, number] = [
    coordinates.latitude,
    coordinates.longitude,
  ];

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
        requestAnimationFrame(() => {
          map.fitBounds(bounds, { padding: [50, 50] });
        });
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
                        <View style={styles.popupCard}>
                          {point.travelImageThumbUrl ? (
                              <Image
                                  source={{ uri: point.travelImageThumbUrl }}
                                  style={styles.pointImage}
                                  resizeMode="contain"
                              />
                          ) : (
                              <Text style={styles.fallbackText}>Нет фото. Нажмите, чтобы открыть статью.</Text>
                          )}

                          <Pressable
                              onPress={() => {
                                const url = point.articleUrl || point.urlTravel;
                                if (url) Linking.openURL(url);
                              }}
                              style={styles.textContainer}
                          >
                            <Text style={styles.addressCompact}>{point.address}</Text>
                            <LabelText label="Координаты:" text={point.coord} />
                            {point.categoryName && <LabelText label="Категория:" text={point.categoryName} />}
                          </Pressable>

                          <View style={styles.iconRow}>
                            <Pressable
                                onPress={() => {
                                  const url = `https://www.google.com/maps/search/?api=1&query=${point.coord}`;
                                  Linking.openURL(url);
                                }}
                                style={styles.iconBtn}
                            >
                              <MapPin size={18} color="#FF8C49" />
                            </Pressable>

                            <Pressable
                                onPress={() => {
                                  const msg = encodeURIComponent(`Глянь, какая точка: ${point.coord}`);
                                  const url = `https://t.me/share/url?url=${msg}`;
                                  Linking.openURL(url);
                                }}
                                style={styles.iconBtn}
                            >
                              <SendHorizonal size={18} color="#FF8C49" />
                            </Pressable>
                          </View>
                        </View>
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
  popupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    width: 220,
    maxWidth: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  pointImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f2f2f2',
  },
  fallbackText: {
    marginBottom: 6,
    color: '#666',
    fontStyle: 'italic',
    fontSize: 13,
  },
  textContainer: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  addressCompact: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
    lineHeight: 16,
    fontWeight: '500',
  },
  iconRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f6f6f6',
  },
});