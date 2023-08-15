import { StyleSheet, FlatList, ActivityIndicator, Button } from 'react-native'

import TravelListItem from '@/components/TravelListItem'
import { useEffect, useState } from 'react'
import { Travels } from '@/src/types/types'
import { fetchTravels } from '@/src/api/travels'
import { Text, View } from '@/components/Themed'
import Paginator from '@/components/Paginator'

export default function TabOneScreen() {
  const initialItemsPerPage = 20
  const initialPage = 1

  const [travels, setTravels] = useState<Travels[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  useEffect(() => {
    fetchMore()
  }, [currentPage, itemsPerPage])

  const fetchMore = async () => {
    if (isLoading) return
    setIsLoading(true)
    const newData = await fetchTravels(currentPage, itemsPerPage)
    setTravels(newData)
    setIsLoading(false)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
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

      <Paginator
        totalItems={travels?.total ?? 20}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  pageInfo: {
    marginTop: 20,
    fontSize: 18,
  },
})
