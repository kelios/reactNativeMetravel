import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity,useWindowDimensions } from 'react-native'

const Footer: React.FC = () => {
  const windowsWidth = useWindowDimensions().width
  const styles = getStyles(windowsWidth); 
  return (
    <View style={styles.footerContainer}>
      <View style={styles.linkContainer}>
        <TouchableOpacity
          onPress={() => {
            /* Navigate to About page */
          }}
        >
          <Text style={styles.linkText}>О сайте</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            /* Navigate to News/Giveaways page */
          }}
        >
          <Text style={styles.linkText}>Новости/Розыгрыши</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            /* Navigate to Feedback page */
          }}
        >
          <Text style={styles.linkText}>Обратная связь</Text>
        </TouchableOpacity>
        <View style={styles.footerText}>
          <Text style={styles.footerText}>© MeTravel 2020</Text>
        </View>
      </View>
    </View>
  )
}

const getStyles = (windowsWidth: number) => {
  return StyleSheet.create({
  footerContainer: {
    width: '100%',
    backgroundColor: '#333',
    padding: windowsWidth > 500 ? 10 : 5,
    position: 'absolute',
    bottom: 0,
    height: windowsWidth > 500 ? 30 : 40,
    borderColor: 'black',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  linkText: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
  footerText: {
    color: '#6c757d',
    fontSize: windowsWidth > 500 ? 12 : 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
});
};

export default Footer
