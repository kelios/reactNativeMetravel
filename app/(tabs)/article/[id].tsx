import React, { useEffect, useState } from 'react'
import {
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Article } from '@/src/types/types'
import IframeRenderer, { iframeModel } from '@native-html/iframe-plugin'
import RenderHTML from 'react-native-render-html'
import { WebView } from 'react-native-webview'
import { Card, Title } from 'react-native-paper'
import { fetchArticle } from '@/src/api/travels'

export default function ArticleDetails() {
  const { width } = useWindowDimensions()
  const isMobile = width <= 768

  const params = useLocalSearchParams()
  const id = typeof params.id === 'string' ? Number(params.id) : undefined

  const [article, setArticle] = useState<Article | null>(null)

  useEffect(() => {
    if (!id) return

    fetchArticle(id)
        .then((articleData) => {
          setArticle(articleData)
        })
        .catch((error) => {
          console.log('Failed to fetch article data:', error)
        })
  }, [id])

  if (!article) {
    return <ActivityIndicator />
  }

  return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
          <Stack.Screen options={{ headerTitle: article.name }} />
          {article.description && (
              <Card style={styles.card}>
                <Card.Content>
                  <Title>{article.name}</Title>
                  {Platform.select({
                    web: (
                        <div
                            dangerouslySetInnerHTML={{ __html: article.description }}
                        />
                    ),
                    default: (
                        <RenderHTML
                            source={{ html: article.description }}
                            contentWidth={width - 50}
                            renderers={{ iframe: IframeRenderer }}
                            customHTMLElementModels={{ iframe: iframeModel }}
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
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    margin: 20,
    elevation: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    maxWidth: 800,
  },
})

