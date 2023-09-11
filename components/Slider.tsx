import React, { useState, useRef } from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

interface SliderProps {
  images: Record<string, string>
  onLayout?: (event: any) => void
}

const Slider: React.FC<SliderProps> = ({ images, onLayout }) => {
  const imageKeys = Object.keys(images)
  const countOfImages = imageKeys.length - 1
  const [currentIndex, setCurrentIndex] = useState(0)
  const windowDimensions = useWindowDimensions()
  const swipeableRef = useRef(null)

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < countOfImages) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View
        style={[
          styles.imageContainer,
          {
            width: windowDimensions.width,
            height: windowDimensions.height * 0.6,
          },
        ]}
      >
        <Image
          source={{ uri: images[imageKeys[currentIndex]] }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          onPress={handlePrevious}
          style={[styles.leftArrow, currentIndex === 0 && { opacity: 0.5 }]}
          disabled={currentIndex === 0}
        >
          <Icon name="chevron-left" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
          style={[
            styles.rightArrow,
            currentIndex === countOfImages && { opacity: 0.5 },
          ]}
          disabled={currentIndex === countOfImages}
        >
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
    backgroundColor: 'white',
  },
  imageContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 1000,
  },
  image: {
    width: '100%',
    height: '100%',
    flex: 1,
    maxWidth: 800,
  },
  leftArrow: {
    position: 'absolute',
    left: '5%',
    top: '50%',
    transform: [{ translateY: -15 }],
  },
  rightArrow: {
    position: 'absolute',
    right: '5%',
    top: '50%',
    transform: [{ translateY: -15 }],
  },
})

export default Slider
