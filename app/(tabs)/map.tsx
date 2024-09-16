import React, { useState, Suspense, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Text,
  useWindowDimensions,
  TextInput,
  Pressable,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Button } from 'react-native-elements';
import MultiSelect from 'react-native-multiple-select';
const MapClientSideComponent = React.lazy(() => import('@/components/Map'));
import { View } from '@/components/Themed';
import { TravelCoords, TravelsForMap } from '@/src/types/types';
import { fetchTravelsForMap, fetchFiltersMap } from '@/src/api/travels';
import { DataTable } from 'react-native-paper';
import AddressListItem from '@/components/AddressListItem';
import * as Location from 'expo-location';

interface FiltersMap {
  radius: string[];
  categories: string[];
  address: string;
}

interface FilterMapValue {
  radius: string[];
  categories: string[];
  address: string;
}

export default function MapScreen() {
  const [travel, setTravel] = useState<TravelsForMap | null>([]);
  const initialPage = 0;
  const itemsPerPageOptions = [10, 20, 30, 50, 100];
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[2]);
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const styles = getStyles(isMobile);
  const initMenuVisible = !isMobile;
  const [menuVisible, setMenuVisible] = useState(initMenuVisible);
  const [filters, setFilters] = useState<FiltersMap>({
    radius: [],
    categories: [],
    address: '',
  });
  const [filterValue, setFilterValue] = useState<FilterMapValue>({
    radius: [],
    categories: [],
    address: '',
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const [coordinates, setCoordinates] = useState({
    latitude: 53.8828449,
    longitude: 27.7273595,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCoordinates({ latitude, longitude });
    })();
  }, []);

  useEffect(() => {
    getFiltersMap();
  }, []);

  useEffect(() => {
    fetchTravelsForMap(currentPage, itemsPerPage, filterValue)
        .then((travelData) => {
          setTravel(travelData);
        })
        .catch((error) => {
          console.log('Failed to fetch travel data:', error);
        });
  }, [filterValue, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [itemsPerPage, filters]);

  const getFiltersMap = useCallback(async () => {
    if (isLoadingFilters) return;
    setIsLoadingFilters(true);
    const newData = await fetchFiltersMap();
    setFilters((prevFilters) => ({
      ...prevFilters,
      categories: newData?.categories,
      radius: newData?.radius,
    }));
    setIsLoadingFilters(false);
  }, [isLoadingFilters]);

  const onSelectedItemsChange =
      (field: keyof FilterMapValue) => (selectedItems: string[]) => {
        setFilterValue({
          ...filterValue,
          [field]: selectedItems,
        });
      };

  const handleTextFilterChange = (value: string) => {
    setFilterValue({
      ...filterValue,
      address: value,
    });
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const renderFilters = () => {
    return (
        <View style={styles.filters}>
          <MultiSelect
              hideTags
              fixedHeight
              hideDropdown
              items={filters?.categories}
              uniqueKey="id"
              onSelectedItemsChange={onSelectedItemsChange('categories')}
              selectedItems={filterValue?.categories}
              selectText="Категория объекта..."
              searchInputPlaceholderText="Категория объекта..."
              tagRemoveIconColor="#CCC"
              tagBorderColor="#CCC"
              tagTextColor="#CCC"
              selectedItemTextColor="#CCC"
              selectedItemIconColor="#CCC"
              itemTextColor="#000"
              displayKey="name"
              searchInputStyle={{ color: '#CCC' }}
              styleListContainer={{ height: 200 }}
              submitButtonColor="#CCC"
              submitButtonText="Применить"
          />

          <MultiSelect
              single
              hideTags
              items={filters?.radius}
              uniqueKey="id"
              onSelectedItemsChange={onSelectedItemsChange('radius')}
              selectedItems={filterValue?.radius}
              selectText="Искать в радиусе (км)"
              searchInputPlaceholderText="Искать в радиусе (км)"
              tagRemoveIconColor="#CCC"
              tagBorderColor="#CCC"
              tagTextColor="#CCC"
              selectedItemTextColor="#CCC"
              selectedItemIconColor="#CCC"
              itemTextColor="#000"
              displayKey="name"
              searchInputStyle={{ color: '#CCC' }}
              submitButtonColor="#CCC"
              submitButtonText="Применить"
          />

          <TextInput
              style={styles.input}
              placeholder="Адрес места"
              value={filterValue?.address}
              onChangeText={handleTextFilterChange}
              keyboardType="default"
          />

          {isMobile && (
              <TouchableOpacity style={styles.closeButton} onPress={closeMenu}>
                <Text style={styles.closeButtonText}>Закрыть</Text>
              </TouchableOpacity>
          )}
        </View>
    );
  };

  return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={[styles.container, { flexDirection: isMobile ? 'column' : 'row' }]}>
          {isMobile && menuVisible && (
              <Pressable onPress={closeMenu} style={styles.overlay} />
          )}

          {isMobile ? (
              <View
                  style={[
                    styles.sideMenu,
                    styles.mobileSideMenu,
                    menuVisible && styles.visibleMobileSideMenu,
                  ]}
              >
                {renderFilters()}
              </View>
          ) : (
              <View style={styles.sideMenu}>{renderFilters()}</View>
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

          <View style={styles.map}>
            <Suspense fallback={<ActivityIndicator size="large" color="#ff9f5a" />}>
              <MapClientSideComponent travel={travel} coordinates={coordinates} />
            </Suspense>
          </View>

          <View style={styles.listMenu}>
            <ScrollView>
              <FlatList
                  style={{ flex: 1 }}
                  showsHorizontalScrollIndicator={false}
                  data={travel?.data}
                  renderItem={({ item }) => <AddressListItem travel={item} />}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal={false}
              />
            </ScrollView>

            <View style={styles.containerPaginator}>
              <DataTable>
                <DataTable.Pagination
                    page={currentPage}
                    numberOfPages={Math.ceil(travel?.total / itemsPerPage) ?? 20}
                    onPageChange={(page) => handlePageChange(page)}
                    label={`${currentPage + 1} of ${Math.ceil(
                        travel?.total / itemsPerPage
                    )}`}
                    showFastPaginationControls
                    numberOfItemsPerPageList={itemsPerPageOptions}
                    numberOfItemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                    style={{
                      flexWrap: 'nowrap',
                      alignSelf: 'flex-start',
                    }}
                />
              </DataTable>
            </View>
          </View>
        </View>
      </SafeAreaView>
  );
}

const getStyles = (isMobile: boolean) => {
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
    filters: {
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      marginBottom: isMobile ? 10 : 0,
    },
    map: {
      flex: isMobile ? 1 : 4, // 40% of the width on larger screens
      backgroundColor: 'white',
      margin: 10,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    sideMenu: {
      flex: isMobile ? 0 : 2, // 20% of the width on larger screens
      padding: 10,
      backgroundColor: 'white',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    listMenu: {
      flex: isMobile ? 1 : 2, // 20% of the width on larger screens
      backgroundColor: 'white',
      margin: 10,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    containerPaginator: {
      backgroundColor: 'white',
      color: 'black',
      paddingBottom: isMobile ? 140 : 70,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    mobileSideMenu: {
      width: '100%',
      position: 'absolute',
      backgroundColor: 'white',
      zIndex: 999,
      elevation: 2,
      top: 0,
      left: 0,
      transform: [{ translateX: -1000 }],
    },
    visibleMobileSideMenu: {
      transform: [{ translateX: 0 }],
    },
    input: {
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 8,
      backgroundColor: 'white',
      borderRadius: 5,
    },
    applyButton: {
      backgroundColor: '#6aaaaa',
      padding: 10,
      alignItems: 'center',
      borderRadius: 5,
    },
    applyButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    closeButton: {
      backgroundColor: 'gray',
      padding: 10,
      alignItems: 'center',
      borderRadius: 5,
      marginTop: 10,
    },
    closeButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    menuButtonContainer: {
      marginBottom: 10,
      padding: 10,
    },
    menuButton: {
      backgroundColor: '#6aaaaa',
      borderRadius: 5,
    },
    menuButtonText: {
      color: 'white',
      fontWeight: 'bold',
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
  });
};
