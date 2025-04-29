import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Platform } from 'react-native';
import * as Location from 'expo-location';
import RoutingMachine from '@/components/MapPage/RoutingMachine';

type Point = {
  id?: number; // Сделали id опциональным
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

type TransportMode = 'car' | 'bike' | 'foot';
type MapMode = 'radius' | 'route';

interface LeafletModules {
  L: typeof import('leaflet');
  MapContainer: React.ComponentType<any>;
  TileLayer: React.ComponentType<any>;
  Marker: React.ComponentType<any>;
  Popup: React.ComponentType<any>;
  useMap: () => any;
  useMapEvents: (events: any) => void;
}

interface Props {
  travel?: { data?: Point[] };
  coordinates: Coordinates;
  routePoints: [number, number][];
  setRoutePoints: (points: [number, number][]) => void;
  onMapClick: (lng: number, lat: number) => void;
  mode: MapMode;
  transportMode: TransportMode;
  setRouteDistance: (distance: number) => void;
  setFullRouteCoords: (coords: [number, number][]) => void;
}

const strToLatLng = (s: string): [number, number] | null => {
  const [lat, lng] = s.split(',').map(Number);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lng, lat] : null;
};

const generateUniqueKey = (point: Point, index: number, coords: [number, number] | null): string => {
  if (point.id) return `point-${point.id}`;
  if (coords) return `point-${index}-${coords.join('-')}`;
  return `point-${index}-${Date.now()}`;
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
                                                   setFullRouteCoords,
                                                 }) => {
  const [leafletModules, setLeafletModules] = useState<LeafletModules | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [errors, setErrors] = useState({
    location: false,
    loadingModules: false,
    routing: false,
  });
  const [loading, setLoading] = useState(true);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [disableFitBounds, setDisableFitBounds] = useState(false);

  const ORS_API_KEY = process.env.EXPO_PUBLIC_ROUTE_SERVICE;
  if (!ORS_API_KEY) console.warn('ORS API key is missing');

  const customIcons = useMemo(() => {
    if (!leafletModules?.L) return null;

    return {
      meTravel: new leafletModules.L.Icon({
        iconUrl: require('@/assets/icons/logo_yellow.ico'),
        iconSize: [27, 30],
        iconAnchor: [13, 30],
        popupAnchor: [0, -30],
      }),
      userLocation: new leafletModules.L.Icon({
        iconUrl: require('@/assets/icons/user_location.ico'),
        iconSize: [27, 30],
        iconAnchor: [13, 30],
        popupAnchor: [0, -30],
      }),
      start: new leafletModules.L.Icon({
        iconUrl: require('@/assets/icons/start.ico'),
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40],
      }),
      end: new leafletModules.L.Icon({
        iconUrl: require('@/assets/icons/end.ico'),
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40],
      }),
    };
  }, [leafletModules?.L]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      try {
        const L = await import('leaflet');
        (window as any).L = L;

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
          iconUrl: require('leaflet/dist/images/marker-icon.png'),
          shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        });

        if (Platform.OS === 'web') {
          await import('leaflet/dist/leaflet.css');
          await import('leaflet-routing-machine/dist/leaflet-routing-machine.css');
        }

        await import('leaflet-routing-machine');
        const RL = await import('react-leaflet');

        setLeafletModules({ L, ...RL });
      } catch (error) {
        console.error('Error loading Leaflet:', error);
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
        if (status !== 'granted') throw new Error('Permission denied');

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });

        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
      } catch (error) {
        console.error('Location error:', error);
        setErrors(prev => ({ ...prev, location: true }));
      }
    };

    requestLocation();
  }, []);

  const handleMapClick = useCallback((e: any) => {
    if (mode !== 'route' || routePoints.length >= 2) return;

    const newPoint: [number, number] = [e.latlng.lng, e.latlng.lat];
    setRoutePoints([...routePoints, newPoint]);
    setDisableFitBounds(true);
    onMapClick(e.latlng.lng, e.latlng.lat);
  }, [mode, routePoints, setRoutePoints, onMapClick]);

  if (loading || !leafletModules) {
    return <Loader message="Loading map..." />;
  }

  if (errors.loadingModules) {
    return <Error message="Map loading failed" />;
  }

  const {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    useMapEvents,
  } = leafletModules;

  const MapLogic = () => {
    const map = useMap();

    useMapEvents({
      click: handleMapClick,
    });

    useEffect(() => {
      if (disableFitBounds || !map || !leafletModules.L) return;

      const points: [number, number][] = mode === 'route' && routePoints.length
          ? routePoints
          : (travel.data || [])
              .map(p => strToLatLng(p.coord))
              .filter(Boolean) as [number, number][];

      if (points.length) {
        const bounds = leafletModules.L.latLngBounds(
            points.map(([lng, lat]) => leafletModules.L.latLng(lat, lng))
        );
        map.fitBounds(bounds.pad(0.2));
      }
    }, [disableFitBounds, mode, routePoints, travel.data, map, leafletModules.L]);

    return null;
  };

  return (
      <View style={styles.wrapper}>
        <MapContainer
            center={[coordinates.latitude, coordinates.longitude]}
            zoom={13}
            style={styles.map}
        >
          <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          <MapLogic />

          {routePoints.length >= 1 && customIcons && (
              <Marker
                  position={[routePoints[0][1], routePoints[0][0]]}
                  icon={customIcons.start}
              >
                <Popup>Start</Popup>
              </Marker>
          )}

          {routePoints.length === 2 && customIcons && (
              <Marker
                  position={[routePoints[1][1], routePoints[1][0]]}
                  icon={customIcons.end}
              >
                <Popup>End</Popup>
              </Marker>
          )}

          {mode === 'route' && routePoints.length >= 2 && ORS_API_KEY && (
              <RoutingMachine
                  routePoints={routePoints}
                  transportMode={transportMode}
                  setRoutingLoading={setRoutingLoading}
                  setErrors={setErrors}
                  setRouteDistance={setRouteDistance}
                  setFullRouteCoords={setFullRouteCoords}
                  ORS_API_KEY={ORS_API_KEY}
              />
          )}

          {userLocation && customIcons && (
              <Marker
                  position={[userLocation.latitude, userLocation.longitude]}
                  icon={customIcons.userLocation}
              >
                <Popup>Your location</Popup>
              </Marker>
          )}

          {customIcons && (travel.data || []).map((point, index) => {
            const coords = strToLatLng(point.coord);
            if (!coords) return null;

            return (
                <Marker
                    key={generateUniqueKey(point, index, coords)}
                    position={[coords[1], coords[0]]}
                    icon={customIcons.meTravel}
                >
                  <Popup>
                    <View style={styles.popup}>
                      {point.travelImageThumbUrl ? (
                          <Image
                              source={{ uri: point.travelImageThumbUrl }}
                              style={styles.img}
                          />
                      ) : (
                          <Text style={styles.noImg}>No image</Text>
                      )}
                      <Text style={styles.addr}>{point.address}</Text>
                      {(point.articleUrl || point.urlTravel) && (
                          <Text
                              style={styles.link}
                              onPress={() => window.open(point.articleUrl || point.urlTravel)}
                          >
                            Details
                          </Text>
                      )}
                    </View>
                  </Popup>
                </Marker>
            );
          })}

          {routingLoading && (
              <View style={styles.routingProgress}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.routingProgressText}>Building route...</Text>
              </View>
          )}

          {errors.routing && (
              <View style={styles.routingError}>
                <Text style={styles.routingErrorText}>Routing error</Text>
              </View>
          )}
        </MapContainer>
      </View>
  );
};

const Loader: React.FC<{ message: string }> = ({ message }) => (
    <View style={styles.loader}>
      <ActivityIndicator size="large" />
      <Text>{message}</Text>
    </View>
);

const Error: React.FC<{ message: string }> = ({ message }) => (
    <View style={styles.loader}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  map: {
    width: '100%',
    height: '100%',
    minHeight: 300,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  popup: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    maxWidth: 240,
  },
  img: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 6,
  },
  noImg: {
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 6,
  },
  addr: {
    fontWeight: '500',
    marginBottom: 4,
    fontSize: 14,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  routingProgress: {
    position: 'absolute',
    top: 60,
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(100,100,255,0.9)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routingProgressText: {
    color: '#fff',
    marginLeft: 8,
  },
  routingError: {
    position: 'absolute',
    top: 20,
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(255,80,80,0.9)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
    alignItems: 'center',
  },
  routingErrorText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default React.memo(MapClientSideComponent);