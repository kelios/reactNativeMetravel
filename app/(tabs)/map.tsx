import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
  Pressable,
  View,
} from 'react-native';
import { Button } from 'react-native-elements';
import * as Location from 'expo-location';
import FiltersPanel from '@/components/MapPage/FiltersPanel';
import MapPanel from '@/components/MapPage/MapPanel';
import TravelListPanel from '@/components/MapPage/TravelListPanel';
import { fetchTravelsForMap, fetchFiltersMap } from '@/src/api/travels';

export default function MapScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;
  const styles = getStyles(isMobile);

  // Состояния
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [filters, setFilters] = useState({ categories: [], radius: [], address: '' });
  const [filterValue, setFilterValue] = useState({ categories: [], radius: [], address: '' });
  const [travelsData, setTravelsData] = useState(null);
  const [coordinates, setCoordinates] = useState({
    latitude: 53.8828449,
    longitude: 27.7273595,
  });
  const [menuVisible, setMenuVisible] = useState(!isMobile);
  const initialPage = 0;
  const itemsPerPageOptions = [10, 20, 30, 50, 100];
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[2]); // 30

  // Запрос геолокации
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;
          setCoordinates({ latitude, longitude });
        }
      } catch (error) {
        console.log('Error getting location:', error);
      }
    })();
  }, []);

  // Загрузка фильтров (один раз)
  useEffect(() => {
    const loadFilters = async () => {
      try {
        setIsLoadingFilters(true);
        const newData = await fetchFiltersMap();
        setFilters({
          categories: newData?.categories || [],
          radius: newData?.radius || [],
          address: '',
        });
      } catch (error) {
        console.log('Ошибка при загрузке фильтров:', error);
      } finally {
        setIsLoadingFilters(false);
      }
    };
    loadFilters();
  }, []);

  // Если фильтр радиуса ещё не выбран, задаём первое значение по умолчанию
  useEffect(() => {
    if (filters.radius.length && filterValue.radius.length === 0) {
      setFilterValue(prev => ({ ...prev, radius: [filters.radius[0].id] }));
    }
  }, [filters.radius]);

  // Сброс страницы при изменении фильтров или числа элементов на странице
  useEffect(() => {
    setCurrentPage(0);
  }, [filterValue, itemsPerPage]);

  // Загрузка данных путешествий
  useEffect(() => {
    const fetchData = async () => {
      try {
        const travelData = await fetchTravelsForMap(currentPage, itemsPerPage, filterValue);
        setTravelsData(travelData);
      } catch (error) {
        console.log('Failed to fetch travel data:', error);
      }
    };
    fetchData();
  }, [filterValue, currentPage, itemsPerPage]);

  // Обработчики фильтров
  const onFilterChange = (field, value) => {
    setFilterValue(prev => ({ ...prev, [field]: value }));
  };

  const onTextFilterChange = (value) => {
    setFilterValue(prev => ({ ...prev, address: value }));
  };

  const resetFilters = () => {
    setFilterValue({
      radius: filters.radius.length ? [filters.radius[0].id] : [],
      categories: [],
      address: '',
    });
  };

  // Логика показа/скрытия меню на мобильных устройствах
  const toggleMenu = () => setMenuVisible(prev => !prev);
  const closeMenu = () => setMenuVisible(false);

  return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={[styles.container, { flexDirection: isMobile ? 'column' : 'row' }]}>
          {isMobile && menuVisible && (
              <Pressable onPress={closeMenu} style={styles.overlay} />
          )}

          {isMobile ? (
              <View style={[styles.sideMenu, styles.mobileSideMenu, menuVisible && styles.visibleMobileSideMenu]}>
                <FiltersPanel
                    filters={filters}
                    filterValue={filterValue}
                    onFilterChange={onFilterChange}
                    onTextFilterChange={onTextFilterChange}
                    resetFilters={resetFilters}
                    travelsData={travelsData}
                    isMobile={isMobile}
                    closeMenu={closeMenu}
                />
              </View>
          ) : (
              <View style={styles.sideMenu}>
                <FiltersPanel
                    filters={filters}
                    filterValue={filterValue}
                    onFilterChange={onFilterChange}
                    onTextFilterChange={onTextFilterChange}
                    resetFilters={resetFilters}
                    travelsData={travelsData}
                    isMobile={isMobile}
                    closeMenu={closeMenu}
                />
              </View>
          )}

          {isMobile && !menuVisible && (
              <Button
                  title="Фильтры"
                  onPress={toggleMenu}
                  containerStyle={styles.menuButtonContainer}
                  buttonStyle={styles.menuButton}
                  titleStyle={styles.menuButtonText}
              />
          )}

          <MapPanel travelsData={travelsData} coordinates={coordinates} style={styles.map} />

          <TravelListPanel
              travelsData={travelsData}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              itemsPerPageOptions={itemsPerPageOptions}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
          />
        </View>
      </SafeAreaView>
  );
}

const getStyles = (isMobile) => {
  return StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    container: {
      flex: 1,
      width: '100%',
      backgroundColor: '#f5f5f5',
    },
    sideMenu: {
      width: isMobile ? '100%' : '20%',
      padding: 10,
      backgroundColor: 'white',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      margin: isMobile ? 0 : 10,
      minWidth: isMobile ? undefined : 260,
    },
    map: {
      width: isMobile ? '100%' : '60%',
      backgroundColor: 'white',
      margin: isMobile ? 10 : 10,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      flex: 1,
    },
    listMenu: {
      width: isMobile ? '100%' : '20%',
      backgroundColor: 'white',
      margin: 10,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      padding: 10,
      flex: 1,
    },
    mobileSideMenu: {
      width: '100%',
      position: 'absolute',
      backgroundColor: 'white',
      zIndex: 999,
      elevation: 2,
      top: 0,
      left: 0,
      transform: [{ translateX: '-100%' }],
    },
    visibleMobileSideMenu: {
      transform: [{ translateX: 0 }],
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 998,
    },
    menuButtonContainer: {
      margin: 10,
      alignSelf: 'center',
      width: '90%',
    },
    menuButton: {
      backgroundColor: '#6aaaaa',
      borderRadius: 5,
    },
    menuButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
  });
};