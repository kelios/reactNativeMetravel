import 'react-native-reanimated';
import React, { useState } from 'react';
import {
    View,
    Image,
    StyleSheet,
    useWindowDimensions,
    TouchableOpacity,
    ImageBackground
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { AntDesign } from '@expo/vector-icons';

interface SliderProps {
    images: { url: string; id: number }[];
}

const Slider: React.FC<SliderProps> = ({ images }) => {
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const carouselRef = React.useRef<Carousel<any>>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const sliderHeight = Math.min(Math.max(windowHeight * 0.6, 400), 700);

    return (
        <View style={[styles.container, { height: sliderHeight }]}>
            {/* Фон сразу меняется без анимации */}
            <ImageBackground
                source={{ uri: images[activeIndex]?.url }}
                style={styles.backgroundImage}
                blurRadius={10} // Оптимально для слабых устройств
            />

            {/* Основной карусель слайдер */}
            <Carousel
                ref={carouselRef}
                loop
                width={windowWidth}
                height={sliderHeight}
                autoPlay
                autoPlayInterval={8000}
                data={images}
                scrollAnimationDuration={10}
                onSnapToItem={(index) => setActiveIndex(index)} // Меняем фон сразу
                renderItem={({ item }) => (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: item.url }} style={styles.image} resizeMode="contain" />
                    </View>
                )}
            />

            {/* Кнопки навигации */}
            <TouchableOpacity
                style={[styles.navButton, { left: 10 }]}
                onPress={() => carouselRef.current?.prev()}
            >
                <AntDesign name="left" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.navButton, { right: 10 }]}
                onPress={() => carouselRef.current?.next()}
            >
                <AntDesign name="right" size={24} color="white" />
            </TouchableOpacity>

            {/* Индикатор слайдов */}
            <View style={styles.pagination}>
                {images.map((_, index) => (
                    <View key={index} style={[
                        styles.dot,
                        activeIndex === index ? styles.activeDot : null
                    ]} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    navButton: {
        position: 'absolute',
        top: '50%',
        transform: [{ translateY: -20 }],
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        borderRadius: 20,
    },
    pagination: {
        position: 'absolute',
        bottom: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: 'white',
        width: 10,
        height: 10,
    },
});

export default Slider;
