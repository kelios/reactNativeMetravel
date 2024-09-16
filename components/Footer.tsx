import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Image,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Тип для маршрутов навигации, используемый для корректной типизации.
type RootStackParamList = {
  index: undefined;
  travelsby: undefined;
  map: undefined;
  'travels/[id]': { id: number };
  contact: undefined;
  about: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const Footer: React.FC = () => {
  const windowsWidth = useWindowDimensions().width;
  const styles = getStyles(windowsWidth);
  const navigation = useNavigation<NavigationProp>();

  const links = [
    { name: 'home', label: 'Путешествия', route: 'index' as keyof RootStackParamList },
    { name: 'globe', label: 'Беларусь', route: 'travelsby' as keyof RootStackParamList },
    { name: 'map', label: 'Карта', route: 'map' as keyof RootStackParamList },
    { name: 'instagram', label: 'Аккаунты в Instagram', route: 'travels/[id]' as keyof RootStackParamList, params: { id: 439 } },
    { name: 'envelope', label: 'Обратная связь', route: 'contact' as keyof RootStackParamList },
    { name: 'info-circle', label: 'О сайте', route: 'about' as keyof RootStackParamList },
  ];

  return (
      <View style={styles.footerContainer}>
        <View style={styles.linkContainer}>
          {links.map((link, index) => (
              <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate(link.route, link.params)}
                  style={styles.link}
              >
                <Icon name={link.name} size={20} color="#ff9f5a" />
                <Text style={styles.linkText}>{link.label}</Text>
              </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footerBottomContainer}>
          <View style={styles.socialContainer}>
            <TouchableOpacity
                onPress={() => { Linking.openURL('https://www.tiktok.com/@metravel.by'); }}
                style={styles.socialLink}
            >
              <View style={styles.iconBackground}>
                <Image
                    source={require('../assets/icons/tik-tok.png')} // Относительный путь к изображению
                    style={styles.tiktokIcon}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => { Linking.openURL('https://www.instagram.com/metravelby/'); }}
                style={styles.socialLink}
            >
              <Icon name="instagram" size={20} color="#ff9f5a" />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => { Linking.openURL('https://www.youtube.com/@metravelby'); }}
                style={styles.socialLink}
            >
              <Icon name="youtube" size={20} color="#ff9f5a" />
            </TouchableOpacity>
          </View>

          <View style={styles.footerTextContainer}>
            <Image
                source={require('../assets/icons/logo_yellow.png')} // Относительный путь к изображению
                style={styles.footerLogo}
            />
            <Text style={styles.footerText}>© MeTravel 2020</Text>
          </View>
        </View>
      </View>
  );
};

const getStyles = (windowsWidth: number) => {
  return StyleSheet.create({
    footerContainer: {
      width: '100%',
      backgroundColor: '#333',
      paddingVertical: windowsWidth > 500 ? 15 : 10,
      paddingHorizontal: 20,
      position: 'absolute',
      bottom: 0,
      borderTopWidth: 1,
      borderTopColor: '#444',
    },
    linkContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    link: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      maxWidth: '48%',
    },
    linkText: {
      color: '#ff9f5a',
      fontSize: windowsWidth > 500 ? 14 : 12,
      marginLeft: 8,
    },
    footerBottomContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    socialContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    socialLink: {
      marginHorizontal: 10,
    },
    footerTextContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    footerText: {
      color: '#bbb',
      fontSize: windowsWidth > 500 ? 12 : 10,
      marginLeft: 8,
    },
    iconBackground: {
      backgroundColor: '#ff9f5a', // Оранжевый цвет фона
      padding: 5, // Отступ вокруг иконки
      borderRadius: 10, // Радиус скругления
      alignItems: 'center',
      justifyContent: 'center',
    },
    tiktokIcon: {
      width: 15, // Увеличен размер иконки
      height: 15,
    },
    footerLogo: {
      width: 24, // Установите размер логотипа
      height: 24,
      marginRight: 8, // Добавьте отступ справа от логотипа
    },
  });
};

export default Footer;
