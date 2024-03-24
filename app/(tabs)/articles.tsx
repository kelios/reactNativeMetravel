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
import ArticleListItem from '@/components/ArticleListItem'
import React, { useEffect, useState, useCallback } from 'react'
import { Articles } from '@/src/types/types'
import { fetchArticles } from '@/src/api/travels'
import { View } from '@/components/Themed'
import { DataTable } from 'react-native-paper'
import { SearchBar, Button } from 'react-native-elements'
import MultiSelect from 'react-native-multiple-select'
import { useLocalSearchParams } from 'expo-router'

interface Category {
  id: string
  name: string
}

export default function TabOneScreen() {
  const initialPage = 0
  const windowWidth = Dimensions.get('window').width
  const styles = getStyles(windowWidth)

  const isMobile = windowWidth <= 768
  const initMenuVisible = !isMobile

  const [articles, setArticles] = useState<Articles[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const itemsPerPageOptions = [10, 20, 30, 50, 100]
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[2])
  const { user_id } = useLocalSearchParams()

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
      user_id: user_id,
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
