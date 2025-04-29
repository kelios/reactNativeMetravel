import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import * as Location from 'expo-location';

import FiltersPanel from '@/components/MapPage/FiltersPanel';
import MapPanel from '@/components/MapPage/MapPanel';
import TravelListPanel from '@/components/MapPage/TravelListPanel';
import { fetchFiltersMap, fetchTravelsForMap, fetchTravelsNearRoute } from '@/src/api/travels';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export default function MapScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;
  const styles = getStyles(isMobile);

  const [mode, setMode] = useState<'radius' | 'route'>('radius');
  const [filters, setFilters] = useState({ categories: [], radius: [], address: '' });
  const [filterValue, setFilterValue] = useState({ categories: [], radius: '', address: '' });
  const [rawTravelsData, setRawTravelsData] = useState<any[]>([]);
  const [travelsData, setTravelsData] = useState<any[]>([]);
  const [placesAlongRoute, setPlacesAlongRoute] = useState<any[]>([]);
  const [fullRouteCoords, setFullRouteCoords] = useState<[number, number][]>([]);

  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [transportMode, setTransportMode] = useState<'car' | 'bike' | 'foot'>('car');

  const [filtersVisible, setFiltersVisible] = useState(!isMobile);
  const [infoVisible, setInfoVisible] = useState(isMobile);

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  const dataCache = useRef<Record<string, any[]>>({});

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          if (isMounted) setCoordinates({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        } else {
          console.log('Геолокация запрещена, fallback Минск');
          if (isMounted) setCoordinates({ latitude: 53.9006, longitude: 27.5590 });
        }
      } catch (error) {
        console.log('Ошибка геолокации:', error);
        if (isMounted) setCoordinates({ latitude: 53.9006, longitude: 27.5590 });
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const newData = await fetchFiltersMap();
        if (isMounted) {
          setFilters({ categories: newData?.categories || [], radius: newData?.radius || [], address: '' });
        }
      } catch (error) {
        console.log('Ошибка загрузки фильтров:', error);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (filters.radius.length && !filterValue.radius) {
      setFilterValue(prev => ({ ...prev, radius: filters.radius[0].id }));
    }
  }, [filters.radius]);

  const getCacheKey = () => {
    if (!coordinates) return '';
    if (mode === 'route') {
      return `route:${JSON.stringify(fullRouteCoords)}`;
    }
    return `radius:${filterValue.radius}:${coordinates.latitude}:${coordinates.longitude}`;
  };

  useEffect(() => {
    if (!filterValue.radius || !coordinates) return;
    let isMounted = true;
    const key = getCacheKey();

    (async () => {
      if (dataCache.current[key]) {
        console.log('📦 Из кеша:', key);
        if (isMounted) {
          if (mode === 'route') setPlacesAlongRoute(dataCache.current[key]);
          else setRawTravelsData(dataCache.current[key]);
        }
        return;
      }

      try {
        let data = [];
        if (mode === 'route' && fullRouteCoords.length >= 2) {
          data = await fetchTravelsNearRoute(fullRouteCoords, 20);
          if (isMounted) {
            setPlacesAlongRoute(data);
            dataCache.current[key] = data;
            setRawTravelsData([]);
          }
        } else {
          data = await fetchTravelsForMap(currentPage, itemsPerPage, {
            radius: filterValue.radius,
            lat: coordinates.latitude,
            lng: coordinates.longitude,
          });
          if (isMounted) {
            setRawTravelsData(data);
            dataCache.current[key] = data;
            setPlacesAlongRoute([]);
          }
        }
      } catch (error) {
        console.log('Ошибка загрузки travels:', error);
      }
    })();

    return () => { isMounted = false; };
  }, [filterValue.radius, currentPage, itemsPerPage, fullRouteCoords, coordinates, mode]);

  useEffect(() => {
    const normalize = (str: string) => str.trim().toLowerCase();
    const selectedCategories = filterValue.categories.map(normalize);
    const filtered = rawTravelsData.filter(travel => {
      const travelCategories = travel.categoryName?.split(',').map(normalize) || [];
      const categoryMatch = selectedCategories.length === 0 || travelCategories.some(cat => selectedCategories.includes(cat));
      const addressMatch = !filterValue.address || (travel.address && travel.address.toLowerCase().includes(filterValue.address.toLowerCase()));
      return categoryMatch && addressMatch;
    });
    setTravelsData(filtered);
  }, [filterValue.categories, filterValue.address, rawTravelsData]);

  const onFilterChange = (field: string, value: any) => setFilterValue(prev => ({ ...prev, [field]: value }));
  const onTextFilterChange = (value: string) => setFilterValue(prev => ({ ...prev, address: value }));

  const resetFilters = () => {
    dataCache.current = {}; // 💥 Очищаем кеш при сбросе
    setFilterValue({ radius: filters.radius[0]?.id || '', categories: [], address: '' });
    setStartAddress('');
    setEndAddress('');
    setRoutePoints([]);
    setPlacesAlongRoute([]);
    setRouteDistance(null);
    setFullRouteCoords([]);
    setTravelsData([]);
  };

  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await response.json();
      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };

  const handleMapClick = async (lng: number, lat: number) => {
    const addr = await getAddressFromCoords(lat, lng);
    if (routePoints.length >= 2) {
      setStartAddress(addr);
      setEndAddress('');
      setRoutePoints([[lng, lat]]);
    } else if (routePoints.length === 0) {
      setStartAddress(addr);
      setRoutePoints([[lng, lat]]);
    } else {
      setEndAddress(addr);
      setRoutePoints(prev => [...prev, [lng, lat]]);
    }
  };

  const buildRouteTo = async (dest: any) => {
    const [lat, lng] = dest.coord.split(',').map(Number);
    const destAddr = await getAddressFromCoords(lat, lng);
    (window as any).disableFitBounds = false;
    setRoutePoints([
      [coordinates!.longitude, coordinates!.latitude],
      [lng, lat],
    ]);
    setStartAddress('Моё местоположение');
    setEndAddress(destAddr);
    setMode('route');
  };

  const clearRoute = () => {
    setRoutePoints([]);
    setPlacesAlongRoute([]);
    setMode('radius');
    setStartAddress('');
    setEndAddress('');
    setRouteDistance(null);
    setFullRouteCoords([]);
  };

  if (!coordinates) {
    return (
        <SafeAreaView style={styles.safeContainer}>
          <ActivityIndicator size="large" style={{ marginTop: 50 }} />
          <Text style={{ textAlign: 'center', marginTop: 16 }}>Определяем ваше местоположение…</Text>
        </SafeAreaView>
    );
  }

  return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
          {filtersVisible ? (
              <FiltersPanel
                  filters={filters}
                  filterValue={filterValue}
                  onFilterChange={onFilterChange}
                  onTextFilterChange={onTextFilterChange}
                  resetFilters={resetFilters}
                  travelsData={rawTravelsData}
                  isMobile={isMobile}
                  closeMenu={() => setFiltersVisible(false)}
                  startAddress={startAddress}
                  endAddress={endAddress}
                  transportMode={transportMode}
                  setTransportMode={setTransportMode}
                  mode={mode}
                  setMode={setMode}
                  routeDistance={routeDistance}
              />
          ) : (
              <Button
                  title="Показать фильтры"
                  onPress={() => setFiltersVisible(true)}
                  buttonStyle={styles.toggleButton}
              />
          )}

          <View style={styles.mainContent}>
            <MapPanel
                travelsData={mode === 'route' ? placesAlongRoute : travelsData}
                coordinates={coordinates}
                routePoints={routePoints}
                placesAlongRoute={placesAlongRoute}
                mode={mode}
                setRoutePoints={setRoutePoints}
                onMapClick={handleMapClick}
                transportMode={transportMode}
                setRouteDistance={setRouteDistance}
                setFullRouteCoords={setFullRouteCoords}
            />

            {infoVisible && (
                <View style={isMobile ? styles.mobileInfoPanel : styles.desktopInfoPanel}>
                  <TravelListPanel
                      travelsData={mode === 'route' ? placesAlongRoute : travelsData}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      itemsPerPageOptions={[10, 20, 30, 50, 100]}
                      onPageChange={setCurrentPage}
                      onItemsPerPageChange={setItemsPerPage}
                      buildRouteTo={buildRouteTo}
                  />
                  {routePoints.length > 1 && (
                      <Button title="Очистить маршрут" onPress={clearRoute} buttonStyle={styles.toggleButton} />
                  )}
                </View>
            )}

            <View style={isMobile ? styles.mobileFloatingButton : styles.desktopFloatingButton}>
              <Button
                  title={infoVisible ? 'Скрыть объекты' : 'Показать объекты'}
                  onPress={() => setInfoVisible(prev => !prev)}
                  icon={<Icon name={infoVisible ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} color="#fff" />}
                  buttonStyle={styles.floatingShowButton}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
  );
}

const getStyles = (isMobile: boolean) => StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#f2f4f7' },
  container: { flex: 1, padding: isMobile ? 8 : 16 },
  mainContent: { flex: 1, flexDirection: isMobile ? 'column' : 'row', position: 'relative' },
  desktopInfoPanel: { width: 380, marginLeft: 12, backgroundColor: '#fff', borderRadius: 16, padding: 12, elevation: 3 },
  mobileInfoPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '60%', backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 12 },
  toggleButton: { backgroundColor: '#6AAAAA', borderRadius: 12, paddingVertical: 10, marginTop: 12 },
  desktopFloatingButton: { position: 'absolute', top: 20, right: 20, zIndex: 999 },
  mobileFloatingButton: { position: 'absolute', bottom: 20, right: 20, zIndex: 999 },
  floatingShowButton: { backgroundColor: '#6AAAAA', borderRadius: 50, paddingHorizontal: 20, paddingVertical: 10, elevation: 6 },
});
