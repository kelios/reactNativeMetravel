import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface SliderProps {
  images: Record<string, string>;
  onLayout?: (event: any) => void;
}

const Slider: React.FC<SliderProps> = ({ images, onLayout }) => {
  const imageKeys = Object.keys(images);
  const countOfImages = imageKeys.length - 1;
  const [currentIndex, setCurrentIndex] = useState(0);
  const windowDimensions = useWindowDimensions();

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < countOfImages) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
      <View style={styles.container} onLayout={onLayout}>
        <View
            style={[
              styles.imageContainer,
              {
                width: windowDimensions.width * 0.9,
                height: windowDimensions.width * 0.5, // Используем аспектный коэффициент для высоты
              },
            ]}
        >
          <Image
              source={{ uri: images[imageKeys[currentIndex]] }}
              style={styles.image}
              resizeMode="contain"
          />
          {countOfImages > 0 && (
              <>
                <TouchableOpacity
                    onPress={handlePrevious}
                    style={[styles.arrow, styles.leftArrow, currentIndex === 0 && { opacity: 0.5 }]}
                    disabled={currentIndex === 0}
                >
                  <Icon name="chevron-left" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleNext}
                    style={[styles.arrow, styles.rightArrow, currentIndex === countOfImages && { opacity: 0.5 }]}
                    disabled={currentIndex === countOfImages}
                >
                  <Icon name="chevron-right" size={30} color="white" />
                </TouchableOpacity>
              </>
          )}
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom: 20, // Отступ снизу
  },
  imageContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -15 }],
    zIndex: 2, // Убедиться, что стрелки на переднем плане
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Темный фон для лучшего контраста
    padding: 10,
    borderRadius: 20,
  },
  leftArrow: {
    position: 'absolute',
    left: '15%',
    top: '50%',
    transform: [{ translateY: -15 }],
  },
  rightArrow: {
    position: 'absolute',
    right: '15%',
    top: '50%',
    transform: [{ translateY: -15 }],
  },
});

export default Slider;
