import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import Carousel from 'react-native-reanimated-carousel';
import { AntDesign } from '@expo/vector-icons';

export interface SliderImage {
    url: string;
    id: number;
    updated_at?: string;
}

interface SliderProps {
    images: SliderImage[];
    showArrows?: boolean;
    showDots?: boolean;
}

const appendVersion = (url: string, updated?: string | number) => {
    if (!url) return '';
    const v = updated
        ? typeof updated === 'string'
            ? Date.parse(updated)
            : updated
        : '';
    return v ? `${url}?v=${v}` : url;
};

const NavButton = ({
                       direction,
                       onPress,
                       offset,
                   }: {
    direction: 'left' | 'right';
    onPress: () => void;
    offset: number;
}) => (
    <TouchableOpacity
        onPress={onPress}
        style={[
            styles.navBtn,
            direction === 'left' ? { left: offset } : { right: offset },
        ]}
        accessibilityRole="button"
        accessibilityLabel={direction === 'left' ? 'Предыдущий слайд' : 'Следующий слайд'}
        hitSlop={10}
    >
        <AntDesign
            name={direction === 'left' ? 'left' : 'right'}
            size={20}
            color="#fff"
        />
    </TouchableOpacity>
);

const Slider: React.FC<SliderProps> = ({ images = [], showArrows = true, showDots = true }) => {
    const { width } = useWindowDimensions();
    const maxWidth = Math.min(width - 32, 1000); // учитывать паддинги ScrollView
    const sliderH = useMemo(() => maxWidth * 0.5625, [maxWidth]);

    const carouselRef = useRef<Carousel<SliderImage>>(null);
    const [index, setIndex] = useState(0);

    const renderItem = useCallback(
        ({ item, index: i }: { item: SliderImage; index: number }) => {
            const uri = appendVersion(item.url, item.updated_at ?? item.id);
            const shouldLoad = Math.abs(index - i) <= 1;

            return (
                <View style={styles.slide}>
                    {Platform.OS === 'web' ? (
                        <img
                            src={uri}
                            alt=""
                            style={{ ...styles.hero, filter: 'blur(20px)' }}
                        />
                    ) : (
                        shouldLoad && (
                            <Image
                                style={styles.bg}
                                source={{ uri }}
                                contentFit="cover"
                                blurRadius={20}
                                priority="low"
                            />
                        )
                    )}
                    {shouldLoad && (
                        <Image
                            style={styles.img}
                            source={{ uri }}
                            contentFit="contain"
                            priority={i === index ? 'high' : 'low'}
                            transition={150}
                        />
                    )}
                </View>
            );
        },
        [index]
    );

    if (!images.length) return null;

    return (
        <View
            style={[
                styles.container,
                {
                    width: maxWidth,
                    height: sliderH,
                    alignSelf: 'center',
                    overflow: 'hidden',
                    borderRadius: 12,
                },
            ]}
            accessibilityRole="group"
            accessibilityLabel="Слайдер изображений"
        >
            <Carousel
                key={images.map(img => img.id).join('-')}
                ref={carouselRef}
                data={images}
                width={maxWidth}
                height={sliderH}
                loop
                autoPlay
                autoPlayInterval={8000}
                onSnapToItem={setIndex}
                renderItem={renderItem}
            />

            {showArrows && (
                <>
                    <NavButton
                        direction="left"
                        offset={10}
                        onPress={() => carouselRef.current?.prev()}
                    />
                    <NavButton
                        direction="right"
                        offset={10}
                        onPress={() => carouselRef.current?.next()}
                    />
                </>
            )}

            {showDots && (
                <View style={styles.dots} pointerEvents="none">
                    {images.map((_, i) => (
                        <View
                            key={i}
                            style={[styles.dot, i === index && styles.active]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

export default memo(Slider);

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    hero: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: 0,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    bg: {
        ...StyleSheet.absoluteFillObject,
    },
    img: {
        width: '100%',
        height: '100%',
    },
    navBtn: {
        position: 'absolute',
        top: '50%',
        marginTop: -20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 10,
        borderRadius: 20,
        zIndex: 10,
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    dots: {
        position: 'absolute',
        bottom: 18,
        flexDirection: 'row',
        alignSelf: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 4,
    },
    active: {
        width: 10,
        height: 10,
        backgroundColor: '#fff',
    },
});
