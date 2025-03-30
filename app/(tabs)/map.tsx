import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, useWindowDimensions, View } from 'react-native';
import { Button } from 'react-native-elements';
import * as Location from 'expo-location';
import FiltersPanel from '@/components/MapPage/FiltersPanel';
import MapPanel from '@/components/MapPage/MapPanel';
import TravelListPanel from '@/components/MapPage/TravelListPanel';
import { fetchTravelsForMap, fetchFiltersMap } from '@/src/api/travels';
import { Provider as PaperProvider } from 'react-native-paper';

export default function MapScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;
  const styles = getStyles(isMobile);

  const [filters, setFilters] = useState({ categories: [], radius: [], address: '' });
  const [filterValue, setFilterValue] = useState({ categories: [], radius: '', address: '' });

  const [rawTravelsData, setRawTravelsData] = useState([]);
  const [travelsData, setTravelsData] = useState([]);

  const [coordinates, setCoordinates] = useState({ latitude: 53.8828449, longitude: 27.7273595 });

  const [infoVisible, setInfoVisible] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(true);

  const toggleInfoPanel = () => setInfoVisible(prev => !prev);
  const toggleFiltersPanel = () => setFiltersVisible(prev => !prev);

  const initialPage = 0;
  const itemsPerPageOptions = [10, 20, 30, 50, 100];
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[2]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          if (location?.coords) setCoordinates(location.coords);
        }
      } catch (error) { console.log('Error getting location:', error); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const newData = await fetchFiltersMap();
        setFilters({ categories: newData?.categories || [], radius: newData?.radius || [], address: '' });
      } catch (error) { console.log('Ошибка при загрузке фильтров:', error); }
    })();
  }, []);

  useEffect(() => { if (filters.radius.length && !filterValue.radius) setFilterValue(prev => ({ ...prev, radius: filters.radius[0].id })); }, [filters.radius]);

  useEffect(() => { setCurrentPage(0); }, [filterValue, itemsPerPage]);

  useEffect(() => {
    if (!filterValue.radius) return;
    (async () => {
      try {
        const travelData = await fetchTravelsForMap(currentPage, itemsPerPage, { radius: filterValue.radius });
        //setRawTravelsData(travelData?.data || []);
        setRawTravelsData(travelData || []);
      } catch (error) { console.log('Failed to fetch travel data:', error); }
    })();
  }, [filterValue.radius, currentPage, itemsPerPage]);

  useEffect(() => {
    const normalize = (str) => str.trim().toLowerCase();
    const selectedCategories = filterValue.categories.map(normalize);

    const filtered = rawTravelsData.filter(travel => {
      const travelCategories = travel.categoryName
          ?.split(',')
          .map(normalize) || [];

      const categoryMatch =
          selectedCategories.length === 0 ||
          travelCategories.some(cat => selectedCategories.includes(cat));

      const addressMatch =
          !filterValue.address ||
          (travel.address && travel.address.toLowerCase().includes(filterValue.address.toLowerCase()));

      return categoryMatch && addressMatch;
    });

    setTravelsData(filtered);
  }, [filterValue.categories, filterValue.address, rawTravelsData]);


  const onFilterChange = (field, value) => setFilterValue(prev => ({ ...prev, [field]: value }));
  const onTextFilterChange = (value) => setFilterValue(prev => ({ ...prev, address: value }));
  const resetFilters = () => setFilterValue({ radius: filters.radius[0]?.id || '', categories: [], address: '' });

  return (
      <PaperProvider>
        <SafeAreaView style={styles.safeContainer}>
          <View style={styles.container}>
            {filtersVisible ? (
                <View style={styles.topFilters}>
                  <FiltersPanel {...{ filters, filterValue, onFilterChange, onTextFilterChange, resetFilters, travelsData: rawTravelsData, isMobile, closeMenu: toggleFiltersPanel }} />
                </View>
            ) : (
                <Button title="Показать фильтры" onPress={toggleFiltersPanel} buttonStyle={styles.infoButton} />
            )}

            <View style={{ flex: 1, flexDirection: isMobile ? 'column' : 'row' }}>
              <MapPanel travelsData={travelsData} coordinates={coordinates} style={styles.map} />

              {infoVisible ? (
                  <View style={isMobile ? styles.infoPanel : styles.desktopInfoWrapper}>
                    <TravelListPanel {...{ travelsData, currentPage, itemsPerPage, itemsPerPageOptions, onPageChange: setCurrentPage, onItemsPerPageChange: setItemsPerPage }} />
                    <Button title="Скрыть объекты" onPress={toggleInfoPanel} buttonStyle={styles.infoButton} />
                  </View>
              ) : (
                  <Button title="Показать объекты" onPress={toggleInfoPanel} buttonStyle={styles.infoButton} containerStyle={styles.topFilters} />
              )}
            </View>
          </View>
        </SafeAreaView>
      </PaperProvider>
  );
}

const getStyles = (isMobile) => StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  topFilters: { padding: 10, backgroundColor: '#f5f5f5' },
  map: { flex: 1, margin: 10, borderRadius: 10 },
  infoPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '50%', backgroundColor: 'white', borderRadius: 10, padding: 10 },
  desktopInfoWrapper: { flex: 1, maxWidth: 360, margin: 10, backgroundColor: 'white', borderRadius: 10, padding: 10 },
  infoButton: { backgroundColor: '#6aaaaa', borderRadius: 5, marginVertical: 10 },
});