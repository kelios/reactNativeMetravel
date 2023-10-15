import React, { useState, Suspense, useEffect, useCallback } from 'react'
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Text,
  useWindowDimensions,
  TextInput,
  Pressable,
  TouchableOpacity,
} from 'react-native'
import { Button } from 'react-native-elements'
import MultiSelect from 'react-native-multiple-select'
const MapClientSideComponent = React.lazy(() => import('@/components/Map'))
import { View } from '@/components/Themed'
import { TravelCoords, TravelsForMap } from '@/src/types/types'
import { fetchTravelsForMap, fetchFiltersMap } from '@/src/api/travels'
import { DataTable } from 'react-native-paper'
import AddressListItem from '@/components/AddressListItem'
import Geolocation from 'react-native-geolocation-service';

interface FiltersMap {
  radius: string[]
  categories: string[]
  address: string
}

interface FilterMapValue {
  radius: string[]
  categories: string[]
  address: string
}

export default function MapScreen() {
  const [travel, setTravel] = useState<TravelsForMap | null>([])
  const initialPage = 0
  const itemsPerPageOptions = [10, 20, 30, 50, 100]
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[2])
  const [search, setSearch] = useState('')

  const { width } = useWindowDimensions()
  const isMobile = width <= 768
  const numCol = isMobile ? 1 : 3
  const setFlexDirection = isMobile ? 'column' : 'row'
  const [isLoadingFilters, setIsLoadingFilters] = useState(false)
  const styles = getStyles(isMobile)

  const initMenuVisible = !isMobile
  const [menuVisible, setMenuVisible] = useState(initMenuVisible) // Состояние видимости меню

  const [filters, setFilters] = useState<FiltersMap>({
    radius: [],
    categories: [],
    address: '',
  })
  const [filterValue, setFilterValue] = useState<FilterMapValue>({
    radius: [],
    categories: [],
    address: '',
  })

  const [coordinates, setCoordinates] = useState({ latitude: 53.8828449, longitude: 27.7273595 });  // Используйте начальные значения ваших координат


  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });
       console.log(latitude,longitude);
      },
      error => {
        console.error(error);  // Логируйте ошибку в консоль, если возникнет проблема с получением координат
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  useEffect(() => {
    getFiltersMap()
  }, [])

  useEffect(() => {
    fetchTravelsForMap(currentPage, itemsPerPage, filterValue)
      .then((travelData) => {
        setTravel(travelData)
      })
      .catch((error) => {
        console.log('Failed to fetch travel data:')
      })
  }, [filterValue])

  const getFiltersMap = useCallback(async () => {
    if (isLoadingFilters) return
    setIsLoadingFilters(true)
    const newData = await fetchFiltersMap()
    setFilters((prevFilters) => ({
      ...prevFilters,
      categories: newData?.categories,
      radius: newData?.radius,
    }))
    setIsLoadingFilters(false)
  }, [isLoadingFilters, filters])

  const onSelectedItemsChange =
    (field: keyof FilterMapValue) => (selectedItems: string[]) => {
      setFilterValue({
        ...filterValue,
        [field]: selectedItems,
      })
    }

  const handleTextFilterChange = (value: string) => {
    setFilterValue({
      ...filterValue,
      address: value,
    })
  }
  const toggleMenu = () => {
    setMenuVisible(!menuVisible)
  }

  const closeMenu = () => {
    setMenuVisible(false)
  }

  const renderFilters = () => {
    return (
      <View style={styles.filters}>
        <MultiSelect
          hideTags
          fixedHeight={true}
          hideDropdown={true}
          items={filters?.categories}
          uniqueKey="id"
          onSelectedItemsChange={onSelectedItemsChange('categories')}
          selectedItems={filterValue?.categories}
          selectText="Категория обьекта..."
          searchInputPlaceholderText="Категория обьекта..."
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
          submitButtonText="Submit"
        />

        <MultiSelect
          single={true}
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
          submitButtonText="Submit"
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
    )
  }

  return (
    <View style={[styles.container, { flexDirection: setFlexDirection }]}>
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
          {/* Ваши фильтры */}
          {renderFilters()}
        </View>
      ) : (
        // Фильтры для больших экранов
        <View style={styles.sideMenu}>
          {/* Ваши фильтры */}
          {renderFilters()}
        </View>
      )}
      {isMobile && !menuVisible && (
        <Button
          title="Фильтры"
          onPress={toggleMenu}
          containerStyle={styles.menuButtonContainer} // Стили контейнера
          buttonStyle={styles.menuButton} // Стили кнопки
          titleStyle={styles.menuButtonText} // Стили текста на кнопке
        />
      )}
      {/* Компонент карты */}
      <View style={styles.map}>
        <Suspense fallback={<Text>Loading...</Text>}>
          <MapClientSideComponent travel={travel} coordinates={coordinates} />
        </Suspense>
      </View>

      {/* Список адресов */}
      {Object.values(travel) && (
        <View style={styles.listMenu}>
          {/* Ваш список адресов */}
          <FlatList
            style={{ flex: 1 }}
            showsHorizontalScrollIndicator={false}
            data={Object.values(travel)}
            renderItem={({ item }) => <AddressListItem travel={item} />}
            keyExtractor={(item, index) => index.toString()}
            horizontal={false}
          />

          {/* Пагинация */}
          <View style={styles.containerPaginator}>
            <DataTable>
              <DataTable.Pagination
                page={currentPage}
                numberOfPages={Math.ceil(travel?.total / itemsPerPage) ?? 20}
                onPageChange={(page) => handlePageChange(page)}
                label={`${currentPage + 1} of ${Math.ceil(
                  travel?.total / itemsPerPage,
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
      )}
    </View>
  )
}

const getStyles = (isMobile: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      backgroundColor: 'white',
    },
    filters: {
      backgroundColor: 'white',
      padding: 15,
    },
    map: {
      width: isMobile ? '100%' : '67%', // Карта занимает 60% ширины на мобильных и больших экранах
      height: isMobile ? '35%' : 'auto',
      backgroundColor: 'white',
    },
    sideMenu: {
      width: isMobile ? '100%' : '13%', // Фильтры занимают 20% ширины на мобильных и больших экранах
      backgroundColor: 'white',
    },
    listMenu: {
      width: isMobile ? '100%' : '20%', // Список адресов занимает 20% ширины на мобильных и больших экранах
      height: isMobile ? '65%' : 'auto',
      backgroundColor: 'white',
    },
    containerPaginator: {
      backgroundColor: 'white',
      color: 'black',
      paddingBottom: isMobile ? 100 : 70,
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
    desktopSideMenu: {
      // width: 300,
      backgroundColor: 'white',
    },
    input: {
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 8,
      backgroundColor: 'white',
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

    menuButtonContainer: {},
    menuButton: {
      backgroundColor: '#6aaaaa',
    },
    menuButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
  })
}
