import { StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import TravelListItem from '@/components/TravelListItem'
import { useEffect, useState } from 'react'
import { Travels } from '@/src/types/types'
import { fetchTravelsby } from '@/src/api/travels'
import { View } from '@/components/Themed'
import { DataTable } from 'react-native-paper'

export default function TravelsBycreen() {
  const initialPage = 0

  const [travels, setTravels] = useState<Travels[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const itemsPerPageOptions = [10, 20, 30, 50, 100]
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[2])

  useEffect(() => {
    fetchMore()
  }, [currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(0)
  }, [itemsPerPage])

  const fetchMore = async () => {
    if (isLoading) return
    setIsLoading(true)
    const newData = await fetchTravelsby(currentPage, itemsPerPage)
    setTravels(newData)
    setIsLoading(false)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
  }

  if (!travels) {
    return <ActivityIndicator />
  }

  return (
    <View style={styles.container}>
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
})
