import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Linking,
  Platform,
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
            console.log(`Can't open URL: ${url}`);
          }
        })
        .catch((err) => console.error('Error:', err));
  };

  return (
      <View style={styles.container}>
        <StatusBar style="dark" />

        <ImageBackground
            source={require('@/assets/images/media/slider/about.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
          <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Title style={styles.title}>METRAVEL</Title>

              <Paragraph style={styles.paragraph}>
                MeTravel.by – это некоммерческий проект для путешественников.
              </Paragraph>
              <Paragraph style={styles.paragraph}>
                Чтобы поделиться своими путешествиями:
              </Paragraph>
              <Paragraph style={styles.paragraph}>1) Регистрируемся</Paragraph>
              <Paragraph style={styles.paragraph}>2) Создаём новое путешествие</Paragraph>
              <Paragraph style={styles.paragraph}>3) Ставим статус «Опубликовать»</Paragraph>
              <Paragraph style={styles.paragraph}>4) Ждём модерации (до 24 часов)</Paragraph>
              <Paragraph style={styles.paragraph}>
                5) Хотите в Instagram? Напишите в директ @metravelby
              </Paragraph>
              <Paragraph style={styles.paragraph}>
                Проект запущен в июне 2020. Использование материалов — только с разрешения автора. Идеи, отзывы и предложения присылайте на:
              </Paragraph>

              <TouchableOpacity onPress={sendMail}>
                <Text style={styles.link}>metraveldev@gmail.com</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 10,
  },
  link: {
    color: '#4b7c6f',
    fontSize: 16,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});
