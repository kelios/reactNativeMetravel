import React from 'react';
import { View, Pressable, Dimensions, StyleSheet } from 'react-native';
import { Article } from '@/src/types/types';
import { Card, Title, Paragraph, Text } from 'react-native-paper';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import RenderHTML from 'react-native-render-html';
import { router } from 'expo-router';

type ArticleListItemProps = {
  article: Article;
};

const { width } = Dimensions.get('window');
const DEFAULT_IMAGE =
    'https://metravel.by/media/2014/J6LCVaIYULghPG2Hin0lu8m8U3ZKPMhIQvRiWgGM.jpg';

const ArticleListItem: React.FC<ArticleListItemProps> = ({ article }) => {
  const { id, name, description, article_image_thumb_url, article_type } = article;

  return (
      <View style={styles.container}>
        <Pressable onPress={() => router.push(`/article/${id}`)}>
          <Card style={styles.card}>
            <View style={styles.imageWrapper}>
              <Card.Cover
                  source={{ uri: article_image_thumb_url || DEFAULT_IMAGE }}
                  style={styles.image}
              />
            </View>
            <Card.Content>
              <Title numberOfLines={2}>{name}</Title>
              <RenderHTML
                  source={{ html: description || '' }}
                  contentWidth={width - wp(6)}
                  baseStyle={styles.htmlText}
              />
              {article_type?.name && (
                  <Paragraph>
                    <Text style={styles.textOrange}>{article_type.name}</Text>
                  </Paragraph>
              )}
            </Card.Content>
          </Card>
        </Pressable>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
  },
  card: {
    borderRadius: 10,
    elevation: 2,
    padding: wp(1.5),
    marginHorizontal: wp(1.5),
    maxWidth: 500,
  },
  imageWrapper: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
  },
  image: {
    aspectRatio: 1,
    width: '100%',
    height: width < 600 ? 340 : 500,
  },
  htmlText: {
    fontSize: 14,
    color: '#444',
  },
  textOrange: {
    color: '#ff9f5a',
  },
});

export default ArticleListItem;
