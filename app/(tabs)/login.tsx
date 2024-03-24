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

export default function login() {
  return (
    <View>
      <Image
        source={{ uri: '/assets/images/media/slider/about.jpg' }}
        style={styles.topImage}
      />
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
