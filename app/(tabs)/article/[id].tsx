import React, { useEffect, useState, useRef, Suspense } from 'react'
import {
  View,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Article } from '@/src/types/types'
import IframeRenderer, { iframeModel } from '@native-html/iframe-plugin'
import RenderHTML from 'react-native-render-html'
import { WebView } from 'react-native-webview'
import { Card, Title } from 'react-native-paper'
import Slider from '@/components/Slider'
import PointList from '@/components/PointList'
import { IS_LOCAL_API } from '@env'
import { fetchArticle } from '@/src/api/travels'

interface ArticleDetailsProps {
  id: number
}

const ArticleDetails: React.FC<ArticleDetailsProps> = () => {
  const [isMounted, setIsMounted] = useState(false)
  const { id } = useLocalSearchParams()
  const [article, setArticle] = useState<Article | null>(null)
  const { width } = useWindowDimensions()
  const isMobile = width <= 768

  useEffect(() => {
    fetchArticle(Number(id))
      .then((articleData) => {
        setArticle(articleData)
      })
      .catch((error) => {
        console.log('Failed to fetch article data:')
      })
  }, [id])

  if (!article) {
    return <ActivityIndicator />
  }

  const isWeb = Platform.OS === 'web'

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Stack.Screen options={{ headerTitle: article.name }} />
        {article?.description && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>{article.name}</Title>

              {Platform.select({
                web: (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: article.description,
                    }}
                  />
                ),
                default: (
                  <RenderHTML
                    source={{ html: article.description }}
                    contentWidth={width - 50}
                    renderers={{
                      iframe: IframeRenderer,
                    }}
                    customHTMLElementModels={{
                      iframe: iframeModel,
                    }}
                    WebView={WebView}
                    defaultWebViewProps={{}}
                    renderersProps={{
                      iframe: {
                        scalesPageToFit: true,
                        webViewProps: {
                          allowsFullScreen: true,
                        },
                      },
                    }}
                    tagsStyles={{
                      p: { marginTop: 15, marginBottom: 0 },
                      iframe: {
                        height: 1500,
                        width: 680,
                        overflow: 'hidden',
                        marginTop: 15,
                        borderRadius: 5,
                        marginHorizontal: 0,
                      },
                    }}
                  />
                ),
              })}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'white',
  },
  mapBlock: {
    //  flex: 1,
    width: 800,
    height: 800,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
    width: '80%',
    backgroundColor: 'white',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 800,
    marginHorizontal: 'auto', // Horizontally center the content
  },
  card: {
    margin: 20,
    elevation: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    maxWidth: 800,
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
    // backgroundImage:'/assets/images/media/slider/8.jpg'
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
    width: '100%',
    backgroundColor: '#6aaaaa',
  },
  menuButton: {
    backgroundColor: '#6aaaaa',
  },
  linkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
  },
  menuButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})

export default ArticleDetails
