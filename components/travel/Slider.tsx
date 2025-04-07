import 'react-native-reanimated';
import React, { useState, useRef } from 'react';
import {
    View,
    Image,
    StyleSheet,
    useWindowDimensions,
    TouchableOpacity,
    ImageBackground,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { AntDesign } from '@expo/vector-icons';

interface SliderProps {
    images: { url: string; id: number }[];
}

const Slider: React.FC<SliderProps> = ({ images }) => {
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const carouselRef = useRef<Carousel<any>>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const sliderHeight = Math.min(Math.max(windowHeight * 0.6, 400), 700);

    return (
        <View style={[styles.container, { height: sliderHeight }]}>
            {images[activeIndex]?.url && (
                <ImageBackground
                    source={{ uri: images[activeIndex].url }}
                    style={styles.backgroundImage}
                    blurRadius={10}
                />
            )}

            <Carousel
                ref={carouselRef}
                loop
                width={windowWidth}
                height={sliderHeight}
                autoPlay
                autoPlayInterval={8000}
                data={images}
                scrollAnimationDuration={10}
                onSnapToItem={(index) => setActiveIndex(index)}
                renderItem={({ item }) => (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: item.url }} style={styles.image} resizeMode="contain" />
                    </View>
                )}
            />

            <TouchableOpacity
                style={[styles.navButton, styles.leftButton]}
                onPress={() => carouselRef.current?.prev()}
                hitSlop={10}
            >
                <AntDesign name="left" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.navButton, styles.rightButton]}
                onPress={() => carouselRef.current?.next()}
                hitSlop={10}
            >
                <AntDesign name="right" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.pagination}>
                {images.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            activeIndex === index && styles.activeDot,
                        ]}
                    />
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
        backgroundColor: '#000', // fallback фон
        position: 'relative',
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
        zIndex: 10,
    },
    leftButton: {
        left: 10,
    },
    rightButton: {
        right: 10,
    },
    pagination: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        zIndex: 5,
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
