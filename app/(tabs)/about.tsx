import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Title, Paragraph } from 'react-native-paper';

const { width } = Dimensions.get('window');

export default function AboutScreen() {
  const sendMail = () => {
    const email = 'metraveldev@gmail.com';
    const subject = 'Info metravel.by';
    const body = 'Добрый день!';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(url);
          } else {
            console.log(`Don't know how to open this URL: ${url}`);
          }
        })
        .catch((err) => console.error('An error occurred', err));
  };

  return (
      <View style={styles.container}>
        {/* Темный/светлый статус-бар */}
        <StatusBar style="dark" />

        <ImageBackground
            source={require('@/assets/images/media/slider/about.jpg')}
            style={styles.backgroundImage}
        >
          <View style={styles.content}>
            <View style={styles.aboutText}>
              <Title style={styles.title}>METRAVEL</Title>

              <Paragraph style={styles.paragraph}>
                MeTravel.by – это некоммерческий проект для путешественников.
              </Paragraph>
              <Paragraph style={styles.paragraph}>
                Для того чтобы поделиться своими путешествиями:
              </Paragraph>
              <Paragraph style={styles.paragraph}>1) Регистрируемся</Paragraph>
              <Paragraph style={styles.paragraph}>
                2) Делимся своими воспоминаниями, создаем новое путешествие
              </Paragraph>
              <Paragraph style={styles.paragraph}>
                3) Ставим статус «Опубликовать».
              </Paragraph>
              <Paragraph style={styles.paragraph}>
                4) Ожидаем модерации (в течение 24 часов).
              </Paragraph>
              <Paragraph style={styles.paragraph}>
                5) Если хотите, чтобы ваша статья была опубликована в нашем Instagram, пишите в директ. Старт проекта — июнь 2020.
              </Paragraph>
              <Paragraph style={styles.paragraph}>
                Использование материала и перепечатка возможны только с разрешения владельца статьи. Отзывы и любые идеи можно присылать на почту:
              </Paragraph>

              <TouchableOpacity onPress={sendMail}>
                <Text style={styles.link}>metraveldev@gmail.com</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  aboutText: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  link: {
    color: '#4b7c6f',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
