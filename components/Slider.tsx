import React, { useState } from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  useWindowDimensions
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

interface SliderProps {
  images: Record<string, string>
}

const Slider: React.FC<SliderProps> = ({ images }) => {
  const imageKeys = Object.keys(images)
  const [currentIndex, setCurrentIndex] = useState(0)
  const windowDimensions = useWindowDimensions();

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < imageKeys.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.imageContainer,{ width: windowDimensions.width, height: windowDimensions.height - 100 }]}>
        <Image
          source={{ uri: images[imageKeys[currentIndex]] }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity onPress={handlePrevious} style={styles.leftArrow}>
          <Icon name="chevron-left" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} style={styles.rightArrow}>
          <Icon name="chevron-right" size={30} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  leftArrow: {
    position: 'absolute',
    left: 20,
    top: '50%',
    transform: [{ translateY: -15 }],
  },
  rightArrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -15 }],
  },
})

export default Slider
