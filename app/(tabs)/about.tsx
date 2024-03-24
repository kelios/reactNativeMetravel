import React from 'react'
import { StatusBar } from 'expo-status-bar'
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Button,
  Linking,
  Image,
  TouchableOpacity,
} from 'react-native'
import { Card, Title, Paragraph } from 'react-native-paper'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { Stack } from 'expo-router'

const { width, height } = Dimensions.get('window')
export default function AboutScreen() {
  const sendMail = () => {
    const email = 'info@metravel.by'
    const subject = 'Info metravel.by'
    const body = 'Добрый день!'
    const url = `mailto:${email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url)
        } else {
          console.log("Don't know how to open this URL:", url)
        }
      })
      .catch((err) => console.error('An error occurred', err))
  }

  return (
    <View>
      <Image
        source={{ uri: '/assets/images/media/slider/about.jpg' }}
        style={styles.topImage}
      />
      <View style={styles.container}>
        <View>
          <Title>METRAVEL</Title>
          <Paragraph>
            MeTravel.by – это некоммерческий проект для путешественников.{' '}
          </Paragraph>
          <Paragraph>
            Для того что бы поделиться своими путешествиями:
          </Paragraph>
          <Paragraph>1) Регистрируемся</Paragraph>
          <Paragraph>
            2) Делимся своими воспоминаниями Новое путешествие
          </Paragraph>
          <Paragraph>3) Ставим статус Опубликовать.</Paragraph>
          <Paragraph>
            4) Совсем немного (в течении 24 часов) ожидаем модерации.
          </Paragraph>
          <Paragraph>
            5) Если хотите, что бы ваша статья была опубликована в нашем
            instagram, пишите в директ Старт проекта июнь 2020.
          </Paragraph>
          <Paragraph>
            Использование материала и перепечатка, возможны только с разрешения
            владельца статьи. Отзывы и любые идеи можно присылать на почту
          </Paragraph>

          <TouchableOpacity onPress={sendMail}>
            <Text style={styles.link}> info@metravel.by </Text>
          </TouchableOpacity>
        </View>
        <Image
          source={{ uri: '/assets/images/media/slider/main2.jpg' }}
          style={styles.image}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // This makes the child elements (Image and Text) sit side by side
    alignItems: 'center', // This vertically aligns the child items in the middle
    padding: 50,
  },
  image: {
    width: '50%',
    height: 400,
    marginRight: 10, // Adds some space between the image and the text
  },
  topImage: {
    width: '100%',
    height: 300,
  },
  text: {
    padding: 10,
    fontSize: 16,
  },
  link: {
    color: '#4b7c6f',
    fontSize: 16,
  },
})
