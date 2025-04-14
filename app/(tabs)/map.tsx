import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, useWindowDimensions, View,} from 'react-native';
import {Button, Icon} from 'react-native-elements';
import * as Location from 'expo-location';

import FiltersPanel from '@/components/MapPage/FiltersPanel';
import MapPanel from '@/components/MapPage/MapPanel';
import TravelListPanel from '@/components/MapPage/TravelListPanel';
import {fetchFiltersMap, fetchTravelsForMap} from '@/src/api/travels';

export default function MapScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;
  const styles = getStyles(isMobile);

  const [filters, setFilters] = useState({ categories: [], radius: [], address: '' });
  const [filterValue, setFilterValue] = useState({ categories: [], radius: '', address: '' });

  const [rawTravelsData, setRawTravelsData] = useState([]);
  const [travelsData, setTravelsData] = useState([]);

  const [coordinates, setCoordinates] = useState({ latitude: 53.8828449, longitude: 27.7273595 });

  const [infoVisible, setInfoVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(isMobile ? false : true);

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
      } catch (error) {
        console.log('Error getting location:', error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const newData = await fetchFiltersMap();
        setFilters({
          categories: newData?.categories || [],
          radius: newData?.radius || [],
          address: '',
        });
      } catch (error) {
        console.log('Ошибка при загрузке фильтров:', error);
      }
    })();
  }, []);

  useEffect(() => {
    if (filters.radius.length && !filterValue.radius) {
      setFilterValue(prev => ({ ...prev, radius: filters.radius[0].id }));
    }
  }, [filters.radius]);

  useEffect(() => {
    setCurrentPage(0);
  }, [filterValue, itemsPerPage]);

  useEffect(() => {
    if (!filterValue.radius) return;
    (async () => {
      try {
        const travelData = await fetchTravelsForMap(currentPage, itemsPerPage, {
          radius: filterValue.radius,
        });
        setRawTravelsData(travelData || []);
      } catch (error) {
        console.log('Failed to fetch travel data:', error);
      }
    })();
  }, [filterValue.radius, currentPage, itemsPerPage]);

  useEffect(() => {
    const normalize = str => str.trim().toLowerCase();
    const selectedCategories = filterValue.categories.map(normalize);

    const filtered = rawTravelsData.filter(travel => {
      const travelCategories = travel.categoryName?.split(',').map(normalize) || [];
      const categoryMatch =
          selectedCategories.length === 0 ||
          travelCategories.some(cat => selectedCategories.includes(cat));
      const addressMatch =
          !filterValue.address ||
          (travel.address &&
              travel.address.toLowerCase().includes(filterValue.address.toLowerCase()));
      return categoryMatch && addressMatch;
    });

    setTravelsData(filtered);
  }, [filterValue.categories, filterValue.address, rawTravelsData]);

  const onFilterChange = (field, value) =>
      setFilterValue(prev => ({ ...prev, [field]: value }));
  const onTextFilterChange = value =>
      setFilterValue(prev => ({ ...prev, address: value }));
  const resetFilters = () =>
      setFilterValue({
        radius: filters.radius[0]?.id || '',
        categories: [],
        address: '',
      });

  return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
          {filtersVisible ? (
              <View style={styles.filtersPanel}>
                <FiltersPanel
                    filters={filters}
                    filterValue={filterValue}
                    onFilterChange={onFilterChange}
                    onTextFilterChange={onTextFilterChange}
                    resetFilters={resetFilters}
                    travelsData={rawTravelsData}
                    isMobile={isMobile}
                    closeMenu={toggleFiltersPanel}
                />
              </View>
          ) : (
              <Button
                  title="Показать фильтры"
                  onPress={toggleFiltersPanel}
                  buttonStyle={styles.toggleButton}
              />
          )}

          <View style={styles.mainContent}>
            <MapPanel
                travelsData={travelsData}
                coordinates={coordinates}
                style={styles.map}
            />

            {!isMobile && infoVisible && (
                <View style={styles.desktopInfoPanel}>
                  <TravelListPanel
                      travelsData={travelsData}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      itemsPerPageOptions={itemsPerPageOptions}
                      onPageChange={setCurrentPage}
                      onItemsPerPageChange={setItemsPerPage}
                  />
                  <Button
                      title="Скрыть объекты"
                      onPress={toggleInfoPanel}
                      buttonStyle={styles.toggleButton}
                  />
                </View>
            )}

            {!isMobile && !infoVisible && (
                <View style={styles.desktopShowWrapper}>
                  <Button
                      title="Показать объекты"
                      onPress={toggleInfoPanel}
                      icon={<Icon name="keyboard-arrow-left" color="#fff" />}
                      buttonStyle={styles.toggleButton}
                  />
                </View>
            )}

            {isMobile && infoVisible && (
                <View style={styles.bottomSheetPanel}>
                  <TravelListPanel
                      travelsData={travelsData}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      itemsPerPageOptions={itemsPerPageOptions}
                      onPageChange={setCurrentPage}
                      onItemsPerPageChange={setItemsPerPage}
                  />
                  <Button
                      title="Скрыть объекты"
                      onPress={toggleInfoPanel}
                      buttonStyle={styles.toggleButton}
                  />
                </View>
            )}

            {isMobile && !infoVisible && (
                <View style={styles.floatingShowWrapper}>
                  <Button
                      title="Показать объекты"
                      onPress={toggleInfoPanel}
                      icon={<Icon name="keyboard-arrow-up" color="#fff" />}
                      buttonStyle={styles.floatingShowButton}
                  />
                </View>
            )}
          </View>
        </View>
      </SafeAreaView>
  );
}

const getStyles = isMobile =>
    StyleSheet.create({
      safeContainer: {
        flex: 1,
        backgroundColor: '#f2f4f7',
      },
      container: {
        flex: 1,
        padding: isMobile ? 8 : 16,
      },
      filtersPanel: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
      },
      mainContent: {
        flex: 1,
        flexDirection: isMobile ? 'column' : 'row',
        position: 'relative',
      },
      map: {
        flex: 1,
        minHeight: isMobile ? 300 : 'auto',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3,
      },
      desktopInfoPanel: {
        width: 380,
        marginLeft: 12,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        elevation: 3,
      },
      desktopShowWrapper: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
      },
      bottomSheetPanel: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        padding: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        zIndex: 999,
        elevation: 12,
      },
      toggleButton: {
        backgroundColor: '#6AAAAA',
        borderRadius: 12,
        paddingVertical: 10,
        marginTop: 12,
      },
      floatingShowWrapper: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 999,
      },
      floatingShowButton: {
        backgroundColor: '#6AAAAA',
        borderRadius: 50,
        elevation: 6,
      },
    });
