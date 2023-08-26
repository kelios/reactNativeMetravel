import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native'
import TravelListItem from '@/components/TravelListItem'
import { useEffect, useState } from 'react'
import { Travels } from '@/src/types/types'
import { fetchTravels } from '@/src/api/travels'
import { View } from '@/components/Themed'
import { DataTable } from 'react-native-paper'
import { SearchBar } from 'react-native-elements'

export default function TabOneScreen() {
  const initialPage = 0

  const [search, setSearch] = useState('')
  const [filteredDataSource, setFilteredDataSource] = useState([])

  const [travels, setTravels] = useState<Travels[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const itemsPerPageOptions = [10, 20, 30, 50, 100]
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[2])

  useEffect(() => {
    fetchMore()
  }, [currentPage, itemsPerPage,search])

  useEffect(() => {
    setCurrentPage(0)
  }, [itemsPerPage])

  useEffect(() => {
    setCurrentPage(0)
  }, [search])

  const fetchMore = async () => {
    if (isLoading) return
    setIsLoading(true)
    const newData = await fetchTravels(currentPage, itemsPerPage, search)
    setTravels(newData)
    setIsLoading(false)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
  }

  const updateSearch = (search) => {
    setSearch(search);
  };

  if (!travels) {
    return <ActivityIndicator />
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.containerSearch}>
        <SearchBar
          placeholder="Введите ключевые слова или фразы, которые описывают то, что вы ищете. 
          Например, если вы ищете пляжи, вы можете ввести пляж, море, горы и т.д."
          onChangeText={updateSearch}
          value={search}
          lightTheme
          round
          containerStyle={styles.searchBarContainer}
          inputContainerStyle= {{backgroundColor:'white'}}
          inputStyle= {{backgroundColor:'white',fontSize:14}}
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  containerPaginator: {
    marginTop: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    color: 'black',
  },
  containerSearch:{
    marginTop: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    color: 'black',
    width: '100%',
  },
  searchBarContainer: {
    backgroundColor:'white',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
  }
})
