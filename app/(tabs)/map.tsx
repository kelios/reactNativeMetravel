import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
  View,
} from 'react-native';
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

  const [coordinates, setCoordinates] = useState({
    latitude: 53.8828449,
    longitude: 27.7273595,
  });

  const [infoVisible, setInfoVisible] = useState(true);
  const toggleInfoPanel = () => setInfoVisible(prev => !prev);

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
          if (location?.coords) {
            const { latitude, longitude } = location.coords;
            setCoordinates({ latitude, longitude });
          }
        }
      } catch (error) {
        console.log('Error getting location:', error);
      }
    })();
  }, []);

  useEffect(() => {
    const loadFilters = async () => {
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
    };
    loadFilters();
  }, []);

  useEffect(() => {
    if (filters.radius.length && !filterValue.radius) {
      setFilterValue(prev => ({ ...prev, radius: filters.radius[0].id }));
    }
  }, [filters.radius]);

  useEffect(() => {
    setCurrentPage(0);
  }, [filterValue, itemsPerPage]);

  // 🔄 Загружаем с сервера только по радиусу
  useEffect(() => {
    const fetchData = async () => {
      try {
        const travelData = await fetchTravelsForMap(currentPage, itemsPerPage, {
          radius: filterValue.radius,
        });

        setRawTravelsData(travelData?.data || []);
      } catch (error) {
        console.log('Failed to fetch travel data:', error);
      }
    };

    if (filterValue.radius) {
      fetchData();
    }
  }, [filterValue.radius, currentPage, itemsPerPage]);

  useEffect(() => {
    if (!rawTravelsData.length) return;

    const filtered = rawTravelsData.filter(travel => {
      const travelCategories = travel.categoryName
          ? travel.categoryName.split(',').map(s => s.trim())
          : [];

      const categoryMatch =
          !filterValue.categories.length ||
          filterValue.categories.every(cat => travelCategories.includes(cat));

      const addressMatch =
          !filterValue.address ||
          travel.address?.toLowerCase().includes(filterValue.address.toLowerCase());

      return categoryMatch && addressMatch;
    });

    setTravelsData(filtered);
  }, [filterValue.categories, filterValue.address, rawTravelsData]);

  const onFilterChange = (field, value) => {
    setFilterValue(prev => ({ ...prev, [field]: value }));
  };

  const onTextFilterChange = (value) => {
    setFilterValue(prev => ({ ...prev, address: value }));
  };

  const resetFilters = () => {
    setFilterValue({
      radius: filters.radius.length ? filters.radius[0].id : '',
      categories: [],
      address: '',
    });
  };

  return (
      <PaperProvider>
        <SafeAreaView style={styles.safeContainer}>
          <View style={styles.container}>
            {/* Панель фильтров */}
            <View style={styles.topFilters}>
              <FiltersPanel
                  filters={filters}
                  filterValue={filterValue}
                  onFilterChange={onFilterChange}
                  onTextFilterChange={onTextFilterChange}
                  resetFilters={resetFilters}
                  travelsData={rawTravelsData}
                  isMobile={isMobile}
                  closeMenu={() => {}}
              />
            </View>

            {/* Карта + Список */}
            <View style={{ flex: 1, flexDirection: isMobile ? 'column' : 'row' }}>
              <MapPanel travelsData={travelsData} coordinates={coordinates} style={styles.map} />

              {infoVisible && (
                  <View style={isMobile ? styles.infoPanel : styles.desktopInfoWrapper}>
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
                        containerStyle={isMobile ? styles.infoButtonContainer : styles.desktopHideButtonContainer}
                        buttonStyle={styles.infoButton}
                        titleStyle={styles.infoButtonText}
                    />
                  </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </PaperProvider>
  );
}

const getStyles = (isMobile) => StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f5f5f5',
    flexDirection: 'column',
  },
  topFilters: {
    width: '100%',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: '#f5f5f5',
  },
  map: {
    flex: 1,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '50%',
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  infoButtonContainer: {
    marginTop: 10,
    alignSelf: 'center',
    width: '90%',
  },
  infoButton: {
    backgroundColor: '#6aaaaa',
    borderRadius: 5,
  },
  infoButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  desktopInfoWrapper: {
    flex: 1, // ← теперь панель займет всю доступную высоту
    maxWidth: 360, // ← максимальная ширина, но без жестких ограничений
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  desktopHideButtonContainer: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
});
