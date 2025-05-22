import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    useWindowDimensions,
    Platform,
} from 'react-native';
import { Image } from 'expo-image';
import Carousel from 'react-native-reanimated-carousel';
import { AntDesign } from '@expo/vector-icons';

interface SliderImage {
    url: string;
    id: number;
    updated_at?: string;
}

interface SliderProps {
    images: SliderImage[];
}

const appendVersion = (url: string, updated_at?: string | number) => {
    if (!url) return '';
    const version = updated_at
        ? typeof updated_at === 'string'
            ? Date.parse(updated_at)
            : updated_at
        : '';
    return version ? `${url}?v=${version}` : url;
};

const NavButton = ({ direction, onPress }: { direction: 'left' | 'right'; onPress: () => void }) => (
    <TouchableOpacity
        onPress={onPress}
        style={[styles.navButton, direction === 'left' ? styles.left : styles.right]}
        hitSlop={10}
    >
        <AntDesign name={direction} size={24} color="#fff" />
    </TouchableOpacity>
);

/**
 * Синхронный фон: перенос blur-изображения внутрь слайда,
 * чтобы во время перелистывания фон всегда соответствовал картинке.
 */
const Slider: React.FC<SliderProps> = ({ images = [] }) => {
    const { width, height } = useWindowDimensions();
    const carouselRef = useRef<Carousel<SliderImage>>(null);
    const [index, setIndex] = useState(0);

    const sliderHeight = useMemo(() => Math.min(Math.max(height * 0.6, 400), 700), [height]);

    /* ---------------------------- рендер одного слайда ---------------------------- */
    const renderItem = useCallback(
        ({ item }: { item: SliderImage }) => {
            const uri = appendVersion(item.url, item.updated_at ?? item.id);
            return (
                <View style={styles.slide}>
                    {/* Синхронный фон */}
                    <Image
                        style={styles.slideBg}
                        source={{ uri }}
                        contentFit="cover"
                        blurRadius={20}
                        priority="low"
                    />

                    {/* Основное изображение */}
                    <Image
                        style={styles.slideImg}
                        source={{ uri }}
                        contentFit="contain"
                        priority="high"
                        transition={200}
                    />
                </View>
            );
        },
        [],
    );

    if (!images.length) return null;

    const currentUrl = appendVersion(images[index]?.url, images[index]?.updated_at ?? images[index]?.id);

    return (
        <View style={[styles.container, { height: sliderHeight }]}
              accessibilityRole="group"
              accessibilityLabel="Слайдер изображений">

            {/* LCP hero-img для Web / SEO */}
            {Platform.OS === 'web' && currentUrl && (
                <img
                    src={currentUrl}
                    alt="Обложка путешествия"
                    width="1920"
                    height="1080"
                    style={styles.heroImg}
                    fetchpriority="high"
                    loading="eager"
                    decoding="async"
                />
            )}

            <Carousel
                ref={carouselRef}
                data={images}
                width={width}
                height={sliderHeight}
                loop
                autoPlay
                autoPlayInterval={8000}
                onSnapToItem={setIndex}
                renderItem={renderItem}
            />

            <NavButton direction="left" onPress={() => carouselRef.current?.prev()} />
            <NavButton direction="right" onPress={() => carouselRef.current?.next()} />

            <View style={styles.dotsRow} pointerEvents="none">
                {images.map((_, i) => (
                    <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
                ))}
            </View>
        </View>
    );
};

export default memo(Slider);

/* -------------------------------------------------------------------------- */
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        overflow: 'hidden',
    },
    heroImg: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        zIndex: -2,
    },
    /* --- slide --- */
    slide: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    slideBg: {
        ...StyleSheet.absoluteFillObject,
    },
    slideImg: {
        width: '100%',
        height: '100%',
    },
    /* --- nav buttons --- */
    navButton: {
        position: 'absolute',
        top: '50%',
        marginTop: -20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 10,
        borderRadius: 20,
        zIndex: 10,
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    left: { left: 10 },
    right: { right: 10 },
    /* --- dots --- */
    dotsRow: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 5,
    },
    dotActive: {
        backgroundColor: '#fff',
        width: 10,
        height: 10,
    },
});
