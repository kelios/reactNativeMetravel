import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Text,
  TextInput,
  Dimensions,
  Pressable,
} from 'react-native'
import TravelListItem from '@/components/TravelListItem'
import { useEffect, useState, useCallback } from 'react'
import { Travels } from '@/src/types/types'
import {
  fetchTravels,
  fetchFilters,
  fetchFiltersTravel,
  fetchFiltersCountry,
} from '@/src/api/travels'
import { View } from '@/components/Themed'
import { DataTable } from 'react-native-paper'
import { SearchBar, Button } from 'react-native-elements'
import MultiSelect from 'react-native-multiple-select'
import { useLocalSearchParams } from 'expo-router'

interface Category {
  id: string
  name: string
}

interface Filters {
  countries: string[]
  categories: string[]
  categoryTravelAddress: string[]
  companion: string[]
  complexity: string[]
  month: string[]
  overNightStay: string[]
  transports: string[]
  year: string
}

interface FilterValue {
  countries: string[]
  categories: string[]
  categoryTravelAddress: string[]
  companion: string[]
  complexity: string[]
  month: string[]
  overNightStay: string[]
  transports: string[]
  year: string
}

export default function TabOneScreen() {
  const initialPage = 0
  const windowWidth = Dimensions.get('window').width
  const styles = getStyles(windowWidth)
  const [search, setSearch] = useState('')

  const [filters, setFilters] = useState<Filters>({
    countries: [],
    categories: [],
    categoryTravelAddress: [],
    companion: [],
    complexity: [],
    month: [],
    overNightStay: [],
    transports: [],
    year: '',
  })
  const [filterValue, setFilterValue] = useState<FilterValue>({
    countries: [],
    categories: [],
    categoryTravelAddress: [],
    companion: [],
    complexity: [],
    month: [],
    overNightStay: [],
    transports: [],
    year: '',
  })
  const [isLoadingFilters, setIsLoadingFilters] = useState(false)

  const isMobile = windowWidth <= 768
  const initMenuVisible = !isMobile

  const [menuVisible, setMenuVisible] = useState(initMenuVisible) // Состояние видимости меню

  const [travels, setTravels] = useState<Travels[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const itemsPerPageOptions = [10, 20, 30, 50, 100]
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[2])
  const { user_id } = useLocalSearchParams()

  useEffect(() => {
    getFilters()
    getFiltersCountry()
  }, [])

  useEffect(() => {
    fetchMore()
  }, [currentPage, itemsPerPage, search])

  useEffect(() => {
    setCurrentPage(0)
  }, [itemsPerPage, search, user_id])

  const fetchMore = async () => {
    if (isLoading) return
    setIsLoading(true)
    const newData = await fetchTravels(currentPage, itemsPerPage, search, {
      user_id: user_id,
    })
    setTravels(newData)
    setIsLoading(false)
  }

  const getFilters = useCallback(async () => {
    if (isLoadingFilters) return
    setIsLoadingFilters(true)
    const newData = await fetchFilters()
    setFilters((prevFilters) => ({
      ...prevFilters,
      categories: newData?.categories,
      categoryTravelAddress: newData?.categoryTravelAddress,
      companion: newData?.companion,
      complexity: newData?.complexity,
      month: newData?.month,
      overNightStay: newData?.overNightStay,
      transports: newData?.transports,
    }))
    setIsLoadingFilters(false)
  }, [isLoadingFilters, filters])

  const getFiltersCountry = useCallback(async () => {
    if (isLoadingFilters) return
    setIsLoadingFilters(true)
    const country = await fetchFiltersCountry()
    setFilters((prevFilters) => ({
      ...prevFilters,
      countries: country,
    }))
    setIsLoadingFilters(false)
  }, [isLoadingFilters, filters])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleApplyFilters = async () => {
    if (isLoading) return
    setIsLoading(true)
    const newData = await fetchFiltersTravel(
      currentPage,
      itemsPerPage,
      search,
      filterValue,
    )
    setTravels(newData)
    setIsLoading(false)
    if (isMobile) {
      closeMenu()
    }
  }

  const updateSearch = (search: string) => {
    setSearch(search)
  }

  const onSelectedItemsChange =
    (field: keyof FilterValue) => (selectedItems: string[]) => {
      setFilterValue({
        ...filterValue,
        [field]: selectedItems,
      })
    }

  const handleTextFilterChange = (value: string) => {
    setFilterValue({
      ...filterValue,
      year: value,
    })
  }

  const toggleMenu = () => {
    setMenuVisible(!menuVisible)
  }

  const closeMenu = () => {
    setMenuVisible(false)
  }

  if (!filters) {
    return <ActivityIndicator />
  }

  const renderFilters = () => {
    if (menuVisible) {
      return (
        <View style={{ backgroundColor: 'white' }}>
          <MultiSelect
            hideTags
            items={filters?.countries || []}
            uniqueKey="country_id"
            onSelectedItemsChange={onSelectedItemsChange('countries')}
            selectedItems={filterValue?.countries}
            isLoading={isLoadingFilters}
            selectText="Выберите страны..."
            searchInputPlaceholderText="Выберите страны..."
            onChangeInput={(text) => console.log(text)}
            styleListContainer={{ height: 200 }}
            //  altFontFamily="ProximaNova-Light"
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#CCC"
            selectedItemTextColor="#CCC"
            selectedItemIconColor="#CCC"
            itemTextColor="#000"
            displayKey="title_ru"
            searchInputStyle={{ color: '#CCC' }}
            submitButtonColor="#CCC"
            submitButtonText="Submit"
          />

          <MultiSelect
            hideTags
            items={filters?.categories || []}
            uniqueKey="id"
            onSelectedItemsChange={onSelectedItemsChange('categories')}
            selectedItems={filterValue?.categories}
            isLoading={isLoadingFilters}
            selectText="Категории..."
            searchInputPlaceholderText="Категории..."
            onChangeInput={(text) => console.log(text)}
            //   altFontFamily="ProximaNova-Light"
            styleListContainer={{ height: 200 }}
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

          <MultiSelect
            hideTags
            items={filters?.categoryTravelAddress || []}
            uniqueKey="id"
            onSelectedItemsChange={onSelectedItemsChange(
              'categoryTravelAddress',
            )}
            selectedItems={filterValue?.categoryTravelAddress}
            isLoading={isLoadingFilters}
            selectText="Обьекты..."
            searchInputPlaceholderText="Обьекты..."
            onChangeInput={(text) => console.log(text)}
            styleListContainer={{ height: 200 }}
            //   altFontFamily="ProximaNova-Light"
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

          <MultiSelect
            hideTags
            items={filters?.transports}
            uniqueKey="id"
            onSelectedItemsChange={onSelectedItemsChange('transports')}
            selectedItems={filterValue?.transports}
            isLoading={isLoadingFilters}
            selectText="Транспорт..."
            searchInputPlaceholderText="Транспорт..."
            onChangeInput={(text) => console.log(text)}
            styleListContainer={{ height: 200 }}
            //altFontFamily="ProximaNova-Light"
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

          <MultiSelect
            hideTags
            items={filters?.complexity}
            uniqueKey="id"
            onSelectedItemsChange={onSelectedItemsChange('complexity')}
            selectedItems={filterValue?.complexity}
            isLoading={isLoadingFilters}
            styleListContainer={{ height: 200 }}
            selectText="Уровень физической подготовки..."
            searchInputPlaceholderText="Уровень физической подготовки..."
            onChangeInput={(text) => console.log(text)}
            // altFontFamily="ProximaNova-Light"
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

          <MultiSelect
            hideTags
            items={filters?.companion}
            uniqueKey="id"
            styleListContainer={{ height: 200 }}
            onSelectedItemsChange={onSelectedItemsChange('companion')}
            selectedItems={filterValue?.companion}
            isLoading={isLoadingFilters}
            selectText="Варианты отдыха с..."
            searchInputPlaceholderText="Варианты отдыха с..."
            onChangeInput={(text) => console.log(text)}
            //   altFontFamily="ProximaNova-Light"
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

          <MultiSelect
            hideTags
            items={filters?.overNightStay}
            uniqueKey="id"
            styleListContainer={{ height: 200 }}
            onSelectedItemsChange={onSelectedItemsChange('overNightStay')}
            selectedItems={filterValue?.overNightStay}
            isLoading={isLoadingFilters}
            selectText="Варианты ночлега..."
            searchInputPlaceholderText="Варианты ночлега..."
            onChangeInput={(text) => console.log(text)}
            // altFontFamily="ProximaNova-Light"
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

          <MultiSelect
            hideTags
            items={filters?.month}
            uniqueKey="id"
            styleListContainer={{ height: 200 }}
            onSelectedItemsChange={onSelectedItemsChange('month')}
            selectedItems={filterValue?.month}
            isLoading={isLoadingFilters}
            selectText="Месяц..."
            searchInputPlaceholderText="Месяц..."
            onChangeInput={(text) => console.log(text)}
            //  altFontFamily="ProximaNova-Light"
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
            placeholder="Год"
            value={filterValue?.year}
            onChangeText={handleTextFilterChange}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyFilters}
          >
            <Text style={styles.applyButtonText}>Поиск</Text>
          </TouchableOpacity>
          {isMobile && (
            <TouchableOpacity style={styles.closeButton} onPress={closeMenu}>
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
          )}
        </View>
      )
    }
    return null
  }

  if (!travels) {
    return <ActivityIndicator />
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
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
          <View style={[styles.sideMenu, styles.desktopSideMenu]}>
            {renderFilters()}
          </View>
        )}
        <View style={styles.content}>
          {isMobile && !menuVisible && (
            <Button
              title="Фильтры"
              onPress={toggleMenu}
              containerStyle={styles.menuButtonContainer} // Стили контейнера
              buttonStyle={styles.menuButton} // Стили кнопки
              titleStyle={styles.menuButtonText} // Стили текста на кнопке
            />
          )}
          <View style={styles.containerSearch}>
            <SearchBar
              placeholder="Введите ключевые слова или фразы, которые описывают то, что вы ищете. 
          Например, если вы ищете пляжи, вы можете ввести пляж, море, горы и т.д."
              onChangeText={updateSearch}
              value={search}
              lightTheme
              round
              containerStyle={styles.searchBarContainer}
              inputContainerStyle={{ backgroundColor: 'white' }}
              inputStyle={{ backgroundColor: 'white', fontSize: 14 }}
            />
          </View>
          <FlatList
            data={travels?.data}
            renderItem={({ item }) => <TravelListItem travel={item} />}
            keyExtractor={(item) => item.id.toString()}
          />
          <View style={styles.containerPaginator}>
            <DataTable>
              <DataTable.Pagination
                page={currentPage}
                numberOfPages={Math.ceil(travels?.total / itemsPerPage) ?? 20}
                onPageChange={(page) => handlePageChange(page)}
                label={`${currentPage + 1} of ${Math.ceil(
                  travels?.total / itemsPerPage,
                )}`}
                showFastPaginationControls
                numberOfItemsPerPageList={itemsPerPageOptions}
                numberOfItemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                style={{ flexWrap: 'nowrap' }}
              />
            </DataTable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const getStyles = (windowWidth: number) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      width: '100%',
      backgroundColor: 'white',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      backgroundColor: 'white',
    },
    containerPaginator: {
      marginTop: 10,
      paddingHorizontal: 10,
      backgroundColor: 'white',
      color: 'black',
      paddingBottom: windowWidth > 500 ? '7%' : '20%',
    },
    containerSearch: {
      marginTop: 10,
      paddingHorizontal: 10,
      backgroundColor: 'white',
      color: 'black',
      width: '100%',
    },
    searchBarContainer: {
      backgroundColor: 'white',
      flexDirection: 'row',
      //  flex: 1,
      // height:200,
      justifyContent: 'center',
      alignItems: 'center',
      alignContent: 'center',
      borderBottomColor: 'transparent',
      borderTopColor: 'transparent',
    },

    //боковое меню
    overlay: {
      flex: 1,
      backgroundColor: 'white',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
    },
    sideMenu: {
      padding: 20,
      backgroundColor: 'white',
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
      width: 300,
      backgroundColor: 'white',
    },
    filterHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
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

    menuButtonContainer: {
      //alignSelf: 'flex-start', // Позиционирование кнопки
      //flex:1,
      width: 600,
      // marginLeft: 20, // Отступ слева
      // marginTop: 20, // Отступ сверху
    },
    menuButton: {
      // flex: 1,
      backgroundColor: '#6aaaaa',
      // paddingHorizontal: 20,
      //  paddingVertical: 10,
      //  borderRadius: 5,
    },
    menuButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
  })
}
