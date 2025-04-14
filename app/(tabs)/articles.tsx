import {ActivityIndicator, Dimensions, FlatList, SafeAreaView, StyleSheet,} from 'react-native'
import ArticleListItem from '@/components/ArticleListItem'
import React, {useEffect, useState} from 'react'
import {Articles} from '@/src/types/types'
import {fetchArticles} from '@/src/api/travels'
import {View} from '@/components/Themed'
import {DataTable} from 'react-native-paper'
import {useLocalSearchParams} from 'expo-router'

export default function TabOneScreen() {
  const initialPage = 0
  const windowWidth = Dimensions.get('window').width
  const styles = getStyles(windowWidth)

  const isMobile = windowWidth <= 768

  const [articles, setArticles] = useState<Articles[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const itemsPerPageOptions = [10, 20, 30, 50, 100]
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[2])

  // 👇 безопасно получаем user_id
  const params = useLocalSearchParams()
  const user_id = typeof params.user_id === 'string' ? params.user_id : undefined

  // 👇 загрузка данных при пагинации или изменении user_id
  useEffect(() => {
    fetchMore()
  }, [currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(0)
  }, [itemsPerPage, user_id])

  const fetchMore = async () => {
    if (isLoading) return
    setIsLoading(true)
    const newData = await fetchArticles(currentPage, itemsPerPage, {
      user_id,
    })
    setArticles(newData)
    setIsLoading(false)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  if (!articles) {
    return <ActivityIndicator />
  }

  return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.content}>
            <FlatList
                data={articles?.data}
                renderItem={({ item }) => <ArticleListItem article={item} />}
                keyExtractor={(item, index) => index.toString()}
            />
            <View style={styles.containerPaginator}>
              <DataTable>
                <DataTable.Pagination
                    page={currentPage}
                    numberOfPages={Math.ceil(articles?.total / itemsPerPage) ?? 20}
                    onPageChange={(page) => handlePageChange(page)}
                    label={`${currentPage + 1} of ${Math.ceil(
                        articles?.total / itemsPerPage,
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
  })
}
