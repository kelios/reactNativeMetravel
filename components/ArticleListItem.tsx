import React from 'react'
import { View, Pressable, Dimensions, StyleSheet } from 'react-native'
import { Article } from '@/src/types/types'
import * as Linking from 'expo-linking'
import { Card, Title, Paragraph, Text } from 'react-native-paper'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import RenderHTML from 'react-native-render-html'
import {
  useFonts,
  PlayfairDisplay_400Regular,
} from '@expo-google-fonts/playfair-display'
import {useRoute} from "@react-navigation/native";
import {router} from "expo-router";

type ArticleListItemProps = {
  article: Article
  onImagePress?: () => void
}
const { width, height } = Dimensions.get('window')

const ArticleListItem = ({ article }: ArticleListItemProps) => {
  const {
    id = 1,
    name,
    description,
    article_image_thumb_url,
    article_type,
  } = article

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.push(`/article/${id}`)}>
        <Card style={styles.card}>
          <View style={styles.imageWrapper}>
            <Card.Cover
              source={{
                uri:
                  article_image_thumb_url ??
                  'https://metravel.by/media/2014/J6LCVaIYULghPG2Hin0lu8m8U3ZKPMhIQvRiWgGM.jpg',
              }}
              style={styles.image}
            />
          </View>
          <Card.Content>
            <Title>{name}</Title>

            <RenderHTML source={{ html: description.substring(0, 400) }} />
            <Paragraph>
              <Text style={styles.textOrange}>{article_type.name}</Text>
            </Paragraph>
          </Card.Content>
        </Card>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 40,
  },
  card: {
    borderRadius: 10,
    elevation: 2,
    padding: wp(1.5),
    marginHorizontal: wp(1.5),
    maxWidth: 500,
  },
  imageWrapper: {
    flex: width < 600 ? 0 : 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
  },
  image: {
    aspectRatio: 1 / 1,
    width: '100%',
    height: width < 600 ? 340 : 500,
  },
  paragraphLeft: {
    marginLeft: wp(1.5),
  },
  textOrange: {
    color: '#ff9f5a',
  },
})

export default ArticleListItem
