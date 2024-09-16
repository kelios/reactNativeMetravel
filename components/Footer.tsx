import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const Footer: React.FC = () => {
  const windowsWidth = useWindowDimensions().width;
  const styles = getStyles(windowsWidth);
  const navigation = useNavigation();

  return (
      <View style={styles.footerContainer}>
        <View style={styles.linkContainer}>
          <TouchableOpacity
              onPress={() => {
                navigation.navigate('index');
              }}
              style={styles.link}
          >
            <Icon name="home" size={20} color="#ff9f5a" />
            <Text style={styles.linkText}>Все путешествия</Text>
          </TouchableOpacity>
          <TouchableOpacity
              onPress={() => {
                navigation.navigate('travelsby');
              }}
              style={styles.link}
          >
            <Icon name="globe" size={20} color="#ff9f5a" />
            <Text style={styles.linkText}>Путешествуем по Беларуси</Text>
          </TouchableOpacity>
          <TouchableOpacity
              onPress={() => {
                navigation.navigate('map');
              }}
              style={styles.link}
          >
            <Icon name="map" size={20} color="#ff9f5a" />
            <Text style={styles.linkText}>Карта путешествий</Text>
          </TouchableOpacity>
          <TouchableOpacity
              onPress={() => {
                navigation.navigate('travels/439');
              }}
              style={styles.link}
          >
            <Icon name="instagram" size={20} color="#ff9f5a" />
            <Text style={styles.linkText}>Аккаунты в Instagram</Text>
          </TouchableOpacity>
          <TouchableOpacity
              onPress={() => {
                navigation.navigate('contact');
              }}
              style={styles.link}
          >
            <Icon name="envelope" size={20} color="#ff9f5a" />
            <Text style={styles.linkText}>Обратная связь</Text>
          </TouchableOpacity>
          <TouchableOpacity
              onPress={() => {
                navigation.navigate('about');
              }}
              style={styles.link}
          >
            <Icon name="info-circle" size={20} color="#ff9f5a" />
            <Text style={styles.linkText}>О сайте</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerText}>© MeTravel 2020</Text>
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
    },
    linkText: {
      color: '#ff9f5a',
      fontSize: windowsWidth > 500 ? 16 : 14,
      marginLeft: 8,
      textDecorationLine: 'underline',
    },
    footerTextContainer: {
      alignItems: 'center',
    },
    footerText: {
      color: '#bbb',
      fontSize: windowsWidth > 500 ? 16 : 14,
    },
  });
};

export default Footer;
