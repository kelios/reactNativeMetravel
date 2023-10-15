import { StatusBar } from 'expo-status-bar'
import { Platform, StyleSheet,Text,View,Dimensions } from 'react-native'
import { Card, Title,Paragraph } from 'react-native-paper'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { Stack } from 'expo-router'

const { width, height } = Dimensions.get('window')
export default function AboutScreen() {
  return (
    <View style={styles.container}>
       <Stack.Screen options={{ headerTitle: 'О сайте' }} />
     <Card style={styles.card}>
          <View style={styles.imageWrapper}>
            <Card.Cover
              source={{ uri: '/assets/images/media/slider/about.jpg' }}
              style={styles.image}
            />
          </View>
          <Card.Content  style={styles.cardContent}>
            <Title>METRAVEL</Title>
            <Paragraph>MeTravel.by – это некоммерческий проект для путешественников. </Paragraph>
            <Paragraph>Для того что бы поделиться своими путешествиями:</Paragraph>
            <Paragraph>1) Регистрируемся</Paragraph>
            <Paragraph>2) Делимся своими воспоминаниями Новое путешествие</Paragraph>
            <Paragraph>3) Ставим статус Опубликовать.</Paragraph>
            <Paragraph>4) Совсем немного (в течении 24 часов) ожидаем модерации.</Paragraph>
            <Paragraph>5) Если хотите, что бы ваша статья была опубликована в нашем instagram, пишите в директ
        Старт проекта июнь 2020.</Paragraph>
            <Paragraph>Использование материала и перепечатка, возможны только с разрешения владельца статьи.
        Отзывы и любые идеи можно присылать на почту. <a href="mailto:info@metravel.by">info@metravel.by</a></Paragraph>

          </Card.Content>
        </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    // alignItems: 'center',
     width: '100%',
    backgroundColor: 'white',
  },
  card: {
    borderRadius: 10,
    elevation: 2,
    padding: wp(1.5),
    marginHorizontal: wp(1.5),
    //height: 600,
  },
  cardContent:{
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    flex: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
  },
  image: {
    aspectRatio: 1 / 1,
    width: '100%',
    height: width < 600 ? 340 : 400,
  },
})

