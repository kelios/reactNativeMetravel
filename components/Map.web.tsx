import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import RoutingMachine from '@/components/MapPage/RoutingMachine';

export type Point = {
  id: number;
  coord: string;
  address: string;
  travelImageThumbUrl: string;
  categoryName: string;
  articleUrl?: string;
  urlTravel?: string;
};

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Props {
  travel?: { data?: Point[] };
  coordinates: Coordinates;
  routePoints: [number, number][];
  setRoutePoints: (points: [number, number][]) => void;
  onMapClick: (lng: number, lat: number) => void;
  mode: 'radius' | 'route';
  transportMode: 'car' | 'bike' | 'foot';
  setRouteDistance: (distance: number) => void;
}

const DEFAULT_CENTER: [number, number] = [53.8828449, 27.7273595];

const strToLatLng = (s: string): [number, number] | null => {
  const [lat, lng] = s.split(',').map(Number);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
};

const MapClientSideComponent: React.FC<Props> = ({
                                                   travel = { data: [] },
                                                   coordinates,
                                                   routePoints,
                                                   setRoutePoints,
                                                   onMapClick,
                                                   mode,
                                                   transportMode,
                                                   setRouteDistance,
                                                 }) => {
  const [leafletModules, setLeafletModules] = useState<null | any>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [errors, setErrors] = useState<{ location?: boolean; loadingModules?: boolean; routing?: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [disableFitBounds, setDisableFitBounds] = useState(false);

  const ORS_API_KEY = process.env.EXPO_PUBLIC_ROUTE_SERVICE!;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      try {
        const L = await import('leaflet');
        (window as any).L = L;
        await import('leaflet/dist/leaflet.css');
        await import('leaflet-routing-machine');
        await import('leaflet-routing-machine/dist/leaflet-routing-machine.css');
        const RL = await import('react-leaflet');
        setLeafletModules({ L, ...RL });
      } catch (e) {
        console.error('Ошибка загрузки Leaflet:', e);
        setErrors(prev => ({ ...prev, loadingModules: true }));
      } finally {
        setLoading(false);
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    const requestLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('Разрешение на геолокацию не получено');
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch (e) {
        console.error('Ошибка получения локации:', e);
        setErrors(prev => ({ ...prev, location: true }));
      }
    };

    requestLocation();
  }, []);

  const { L, MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } = leafletModules || {};

  const meTravelIcon = useMemo(() => {
    if (!L) return null;
    return new L.Icon({
      iconUrl: require('@/assets/icons/logo_yellow.ico'),
      iconSize: [27, 30],
      iconAnchor: [13, 30],
      popupAnchor: [0, -30],
    });
  }, [L]);

  const userLocationIcon = useMemo(() => {
    if (!L) return null;
    return new L.Icon({
      iconUrl: require('@/assets/icons/user_location.ico'),
      iconSize: [27, 30],
      iconAnchor: [13, 30],
      popupAnchor: [0, -30],
    });
  }, [L]);

  const handleMapClick = useCallback((e: any) => {
    if (mode !== 'route' || routePoints.length >= 2) return;
    setRoutePoints([...routePoints, [e.latlng.lng, e.latlng.lat]]);
    setDisableFitBounds(true);
    onMapClick(e.latlng.lng, e.latlng.lat);
  }, [mode, routePoints, setRoutePoints, onMapClick]);

  const allPoints = useMemo(() => {
    const points: [number, number][] = [];
    if (userLocation) points.push([userLocation.latitude, userLocation.longitude]);
    travel.data.forEach(p => {
      const coords = strToLatLng(p.coord);
      if (coords) points.push(coords);
    });
    return points;
  }, [travel.data, userLocation]);

  const FitBounds: React.FC = () => {
    const map = useMap();

    const pointsToFit = useMemo(() => {
      if (mode === 'route' && routePoints.length) {
        return routePoints.map(p => L.latLng(p[1], p[0]));
      }
      if (travel.data.length) {
        return travel.data
            .map(p => strToLatLng(p.coord))
            .filter(Boolean)
            .map(([lat, lng]) => L.latLng(lat, lng));
      }
      return [];
    }, [mode, routePoints, travel.data]);

    useEffect(() => {
      if (!pointsToFit.length) return;
      const bounds = L.latLngBounds(pointsToFit);
      map.fitBounds(bounds.pad(0.2));
    }, [pointsToFit, map]);

    return null;
  };

  const ClickHandler: React.FC = () => {
    useMapEvents({ click: handleMapClick });
    return null;
  };

  if (loading || !leafletModules) {
    return <Loader message="Загрузка карты..." />;
  }

  if (errors.loadingModules) {
    return <Error message="Не удалось загрузить карту." />;
  }

  return (
      <View style={styles.wrapper}>
        <MapContainer center={[coordinates.latitude, coordinates.longitude]} zoom={13} style={styles.map}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          <FitBounds />
          <ClickHandler />

          {mode === 'route' && (
              <RoutingMachine
                  key={JSON.stringify(routePoints)} // ✅ Пересоздание маршрута!
                  routePoints={routePoints}
                  transportMode={transportMode}
                  setRoutingLoading={setRoutingLoading}
                  setErrors={setErrors}
                  setRouteDistance={setRouteDistance}
                  ORS_API_KEY={ORS_API_KEY}
              />
          )}

          {userLocation && (
              <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userLocationIcon || undefined}>
                <Popup>Ваше местоположение</Popup>
              </Marker>
          )}

          {travel.data.map((p, i) => {
            const ll = strToLatLng(p.coord);
            return ll ? (
                <Marker key={p.id ?? i} position={ll} icon={meTravelIcon || undefined}>
                  <Popup>
                    <View style={styles.popup}>
                      {p.travelImageThumbUrl ? (
                          <Image source={{ uri: p.travelImageThumbUrl }} style={styles.img} />
                      ) : (
                          <Text style={styles.noImg}>Нет фото</Text>
                      )}
                      <Text style={styles.addr}>{p.address}</Text>
                      {(p.articleUrl || p.urlTravel) && (
                          <Text
                              style={styles.link}
                              onPress={() => typeof window !== 'undefined' && window.open(p.articleUrl || p.urlTravel)}
                          >
                            Подробнее
                          </Text>
                      )}
                    </View>
                  </Popup>
                </Marker>
            ) : null;
          })}

          {routingLoading && (
              <View style={styles.routingProgress}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.routingProgressText}>Строим маршрут…</Text>
              </View>
          )}

          {errors.routing && (
              <View style={styles.routingError}>
                <Text style={styles.routingErrorText}>Ошибка маршрута</Text>
              </View>
          )}
        </MapContainer>
      </View>
  );
};

const Loader = ({ message }: { message: string }) => (
    <View style={styles.loader}>
      <ActivityIndicator size="large" />
      <Text>{message}</Text>
    </View>
);

const Error = ({ message }: { message: string }) => (
    <View style={styles.loader}>
      <Text>{message}</Text>
    </View>
);

const styles = StyleSheet.create({
  wrapper: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  map: { width: '100%', height: '100%' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  popup: { padding: 8, backgroundColor: '#fff', borderRadius: 4, maxWidth: 240 },
  img: { width: '100%', height: 100, borderRadius: 8, marginBottom: 6 },
  noImg: { fontStyle: 'italic', color: '#888', marginBottom: 6 },
  addr: { fontWeight: '500', marginBottom: 4, fontSize: 14 },
  link: { color: '#007AFF', textDecorationLine: 'underline', marginTop: 4 },
  routingProgress: {
    position: 'absolute', top: 60, left: '10%', right: '10%',
    backgroundColor: 'rgba(100,100,255,0.9)', padding: 10,
    borderRadius: 8, zIndex: 1000, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  routingProgressText: { color: '#fff', marginLeft: 8 },
  routingError: {
    position: 'absolute', top: 20, left: '10%', right: '10%',
    backgroundColor: 'rgba(255,80,80,0.9)', padding: 10,
    borderRadius: 8, zIndex: 1000, alignItems: 'center',
  },
  routingErrorText: { color: '#fff', fontWeight: '600' },
});

export default MapClientSideComponent;
