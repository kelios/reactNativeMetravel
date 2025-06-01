import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

/**
 * Append ?v=timestamp so that when CMS updates an image, the CDN busts cache while
 * untouched URLs stay cached aggressively.
 */
const appendVersion = (url: string, updated?: string | number) => {
    if (!url) return '';
    const ts = updated
        ? typeof updated === 'string'
            ? Date.parse(updated)
            : updated
        : '';
    return ts ? `${url}?v=${ts}` : url;
};

const NavButton = memo(
    ({
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
    ),
);

/**
 * Slide: постоянный размытый бэкграунд + контент (contain).
 * Блюр закрывает «чёрные полосы», не пропадает после загрузки hi‑res.
 */
const Slide = memo(
    ({ uri, isVisible }: { uri: string; isVisible: boolean }) => (
        <View style={styles.slide} pointerEvents="none">
            {/* Permanent blurred background */}
            <Image
                style={styles.bg}
                source={{ uri, cachePolicy: 'memory-disk' }}
                contentFit="cover"
                blurRadius={20}
                priority="low"
            />

            {/* High‑res */}
            {isVisible && (
                <Image
                    style={styles.img}
                    source={{ uri, cachePolicy: 'memory-disk' }}
                    contentFit="contain"
                    priority={isVisible ? 'high' : 'low'}
                    transition={150}
                />
            )}
        </View>
    ),
);

const Slider: React.FC<SliderProps> = ({
                                           images = [],
                                           showArrows = true,
                                           showDots = true,
                                       }) => {
    const { width } = useWindowDimensions();
    const maxWidth = Math.min(width - 32, 1000);
    const sliderH = useMemo(() => maxWidth * 0.5625, [maxWidth]);

    const carouselRef = useRef<Carousel<SliderImage>>(null);
    const [index, setIndex] = useState(0);

    // Unique key -> forces full remount when dataset changes, eliminating old frames
    const carouselKey = useMemo(() => images.map((i) => i.id).join('-'), [images]);

    // Reset index when navigating to a new article
    useEffect(() => {
        setIndex(0);
        carouselRef.current?.scrollTo({ animated: false, index: 0 });
    }, [images]);

    // Render only current ±1
    const shouldRender = useCallback(
        (slideIdx: number) => Math.abs(index - slideIdx) <= 1,
        [index],
    );

    const renderItem = useCallback(
        ({ item, index: slideIdx }: { item: SliderImage; index: number }) => {
            const uri = appendVersion(item.url, item.updated_at ?? item.id);
            const visible = shouldRender(slideIdx);
            return <Slide uri={uri} isVisible={visible} />;
        },
        [shouldRender],
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
                key={carouselKey}
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
                    <NavButton direction="left" offset={10} onPress={() => carouselRef.current?.prev()} />
                    <NavButton direction="right" offset={10} onPress={() => carouselRef.current?.next()} />
                </>
            )}

            {showDots && (
                <View style={styles.dots} pointerEvents="none">
                    {images.map((_, i) => (
                        <View key={i} style={[styles.dot, i === index && styles.active]} />
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
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    /** Constant blurred background */
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
