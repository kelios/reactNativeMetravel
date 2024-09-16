import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
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
                navigation.navigate('about');
              }}
          >
            <Text style={styles.linkText}>О сайте</Text>
          </TouchableOpacity>
          <TouchableOpacity
              onPress={() => {
                navigation.navigate('contact');
              }}
          >
            <Text style={styles.linkText}>Обратная связь</Text>
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
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    linkText: {
      color: '#ff9f5a',
      fontSize: 16,
      textDecorationLine: 'underline',
    },
    footerTextContainer: {
      alignItems: 'center',
    },
    footerText: {
      color: '#bbb',
      fontSize: 14,
    },
  });
};

export default Footer;
