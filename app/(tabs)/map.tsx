import React, { useState, Suspense, useEffect } from 'react';
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
import { View } from '@/components/Themed';
import { DataTable } from 'react-native-paper';
import AddressListItem from '@/components/AddressListItem';

import { fetchTravelsForMap, fetchFiltersMap } from '@/src/api/travels';
import * as Location from 'expo-location';

// Подгружаем карту через React.lazy
const MapClientSideComponent = React.lazy(() => import('@/components/Map'));

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
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;
  const styles = getStyles(isMobile);

  // Состояния фильтров
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
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

  // Состояние для списка путешествий
  const [travelsData, setTravelsData] = useState<any | null>(null);

  // Параметры пагинации
  const initialPage = 0;
  const itemsPerPageOptions = [10, 20, 30, 50, 100];
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[2]); // Начальное значение — 30

  // Состояние для карты (координаты)
  const [coordinates, setCoordinates] = useState({
    latitude: 53.8828449,
    longitude: 27.7273595,
  });

  // Логика показа/скрытия меню фильтров (боковое/мобильное)
  const initMenuVisible = !isMobile; // На десктопе сразу открыто
  const [menuVisible, setMenuVisible] = useState(initMenuVisible);

  // ----------------------------
  // 1. ЗАПРОС НА РАЗРЕШЕНИЕ И ПОЛУЧЕНИЕ ГЕОПОЗИЦИИ
  // ----------------------------
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;
          setCoordinates({ latitude, longitude });
        } else {
          console.log('Permission to access location was denied');
        }
      } catch (error) {
        console.log('Error getting location:', error);
      }
    })();
  }, []);

  // ----------------------------
  // 2. ЗАГРУЗКА ФИЛЬТРОВ (один раз при монтировании)
  // ----------------------------
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

  // ----------------------------
  // 3. СБРОС СТРАНИЦЫ ПРИ СМЕНЕ ФИЛЬТРОВ ИЛИ ITEMS PER PAGE
  // ----------------------------
  useEffect(() => {
    // Каждый раз, когда меняются фильтры или количество элементов на странице
    // сбрасываем на первую страницу (0). Данные потом подхватит следующий эффект.
    setCurrentPage(0);
  }, [filterValue, itemsPerPage]);

  // ----------------------------
  // 4. ЗАГРУЗКА ДАННЫХ (ПУТЕШЕСТВИЙ) ПРИ ИЗМЕНЕНИИ PAGE / FILTERVALUE / ITEMS PER PAGE
  // ----------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const travelData = await fetchTravelsForMap(
            currentPage,
            itemsPerPage,
            filterValue
        );
        setTravelsData(travelData);
      } catch (error) {
        console.log('Failed to fetch travel data:', error);
      }
    };

    fetchData();
  }, [filterValue, currentPage, itemsPerPage]);

  // ----------------------------
  // ОБРАБОТЧИКИ ДЛЯ ФИЛЬТРОВ И ПАГИНАЦИИ
  // ----------------------------
  const onSelectedItemsChange =
      (field: keyof FilterMapValue) => (selectedItems: string[]) => {
        setFilterValue((prev) => ({
          ...prev,
          [field]: selectedItems,
        }));
      };

  const handleTextFilterChange = (value: string) => {
    setFilterValue((prev) => ({
      ...prev,
      address: value,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Сброс фильтров:
  const resetFilters = () => {
    setFilterValue({
      radius: [],
      categories: [],
      address: '',
    });
  };

  // ----------------------------
  // ОТРИСОВКА ФИЛЬТРОВ
  // ----------------------------
  const renderFilters = () => {
    return (
        <View style={styles.filters}>
          <Text style={styles.filtersHeader}>Фильтры</Text>

          {/* Категории */}
          <MultiSelect
              hideTags
              fixedHeight
              hideDropdown
              items={filters.categories} // массив объектов { id, name }
              uniqueKey="id"
              onSelectedItemsChange={onSelectedItemsChange('categories')}
              selectedItems={filterValue.categories}
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

          {/* Радиус */}
          <MultiSelect
              single
              hideTags
              items={filters.radius}
              uniqueKey="id"
              onSelectedItemsChange={onSelectedItemsChange('radius')}
              selectedItems={filterValue.radius}
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

          {/* Адрес места */}
          <TextInput
              style={styles.input}
              placeholder="Адрес места"
              value={filterValue.address}
              onChangeText={handleTextFilterChange}
              keyboardType="default"
          />

          {/* Кнопка "Очистить фильтры" */}
          <Button
              title="Очистить фильтры"
              onPress={resetFilters}
              containerStyle={styles.resetButtonContainer}
              buttonStyle={styles.resetButton}
              titleStyle={styles.resetButtonText}
          />

          {/* Кнопка "Закрыть" на мобильном */}
          {isMobile && (
              <TouchableOpacity style={styles.closeButton} onPress={closeMenu}>
                <Text style={styles.closeButtonText}>Закрыть</Text>
              </TouchableOpacity>
          )}
        </View>
    );
  };

  // ----------------------------
  // ЛОГИКА ПОКАЗА/СКРЫТИЯ ФИЛЬТРОВ
  // ----------------------------
  const toggleMenu = () => setMenuVisible((prev) => !prev);
  const closeMenu = () => setMenuVisible(false);

  // ----------------------------
  // РЕНДЕР
  // ----------------------------
  return (
      <SafeAreaView style={styles.safeContainer}>
        <View
            style={[
              styles.container,
              { flexDirection: isMobile ? 'column' : 'row' },
            ]}
        >
          {/* "Затемнение" фона при открытом меню на мобильном */}
          {isMobile && menuVisible && (
              <Pressable onPress={closeMenu} style={styles.overlay} />
          )}

          {/* Боковая панель (фильтры) */}
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

          {/* Кнопка открытия меню на мобильном (если меню ещё не открыто) */}
          {isMobile && !menuVisible && (
              <Button
                  title="Фильтры"
                  onPress={toggleMenu}
                  containerStyle={styles.menuButtonContainer}
                  buttonStyle={styles.menuButton}
                  titleStyle={styles.menuButtonText}
              />
          )}

          {/* Карта */}
          <View style={styles.map}>
            <Suspense fallback={<ActivityIndicator size="large" color="#ff9f5a" />}>
              <MapClientSideComponent travel={travelsData} coordinates={coordinates} />
            </Suspense>
          </View>

          {/* Список результатов + пагинация */}
          <View style={styles.listMenu}>
            {/* Выводим количество найденных объектов (если есть) */}
            {!!travelsData?.total && (
                <Text style={styles.resultsCount}>
                  Найдено {travelsData.total} объектов
                </Text>
            )}
            <ScrollView>
              <FlatList
                  style={{ flex: 1 }}
                  showsHorizontalScrollIndicator={false}
                  data={travelsData?.data || []}
                  renderItem={({ item }) => <AddressListItem travel={item} />}
                  keyExtractor={(_item, index) => index.toString()}
                  horizontal={false}
                  ListEmptyComponent={() =>
                      !travelsData?.data?.length ? (
                          <View style={{ padding: 20 }}>
                            <Text>Нет данных для отображения</Text>
                          </View>
                      ) : null
                  }
              />
            </ScrollView>

            <View style={styles.containerPaginator}>
              <DataTable>
                <DataTable.Pagination
                    page={currentPage}
                    numberOfPages={
                      travelsData?.total
                          ? Math.ceil(travelsData.total / itemsPerPage)
                          : 1
                    }
                    onPageChange={(page) => handlePageChange(page)}
                    label={
                      travelsData?.total
                          ? `${currentPage + 1} из ${Math.ceil(
                              travelsData.total / itemsPerPage
                          )}`
                          : '1 из 1'
                    }
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

/**
 * Стили
 */
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
    filtersHeader: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 15,
      textAlign: 'left',
    },
    map: {
      flex: isMobile ? 1 : 4, // 40% ширины на больших экранах
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
      flex: isMobile ? 0 : 2, // 20% ширины на больших экранах
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
      flex: isMobile ? 1 : 2, // 20% ширины на больших экранах
      backgroundColor: 'white',
      margin: 10,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      padding: 10,
    },
    containerPaginator: {
      backgroundColor: 'white',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      marginTop: 10,
      paddingBottom: 10,
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
    resetButtonContainer: {
      marginBottom: 10,
      marginTop: 5,
      alignSelf: 'center',
      width: '100%',
    },
    resetButton: {
      backgroundColor: '#ff9f5a',
      borderRadius: 5,
      height: 40,
    },
    resetButtonText: {
      fontWeight: 'bold',
    },
    closeButton: {
      backgroundColor: '#aaa',
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
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 998,
    },
    resultsCount: {
      fontSize: 16,
      marginBottom: 10,
      fontWeight: '600',
    },
  });
};
