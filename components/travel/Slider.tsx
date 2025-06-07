import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    LayoutChangeEvent,
    Platform,
    useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import Carousel from 'react-native-reanimated-carousel';
import { AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface SliderImage {
    url: string;
    id: number;
    updated_at?: string;
}

interface SliderProps {
    images: SliderImage[];
    showArrows?: boolean;
    showDots?: boolean;
    hideArrowsOnMobile?: boolean;
    aspectRatio?: number;       // по умолчанию 16/9
    autoPlay?: boolean;
    autoPlayInterval?: number;  // в миллисекундах
    onIndexChanged?: (index: number) => void;
}

const DEFAULT_ASPECT_RATIO = 16 / 9;
const NAV_BTN_OFFSET = 10;

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
            accessibilityLabel={
                direction === 'left'
                    ? 'Предыдущий слайд'
                    : 'Следующий слайд'
            }
            hitSlop={10}
        >
            <AntDesign
                name={direction === 'left' ? 'left' : 'right'}
                size={20}
                color="#fff"
            />
        </TouchableOpacity>
    )
);

const Slide = memo(
    ({ uri, isVisible }: { uri: string; isVisible: boolean }) => {
        if (!isVisible) return null;

        return (
            <View style={styles.slide}>
                <Image
                    style={styles.bg}
                    source={{ uri, cachePolicy: 'memory-disk' }}
                    contentFit="cover"
                    blurRadius={20}
                    priority="low"
                />
                <Image
                    style={styles.img}
                    source={{ uri, cachePolicy: 'memory-disk' }}
                    contentFit="contain"
                    priority="high"
                    transition={150}
                />
            </View>
        );
    }
);

const Slider: React.FC<SliderProps> = ({
                                           images,
                                           showArrows = true,
                                           showDots = true,
                                           hideArrowsOnMobile = false,
                                           aspectRatio = DEFAULT_ASPECT_RATIO,
                                           autoPlay = true,
                                           autoPlayInterval = 8000,
                                           onIndexChanged,
                                       }) => {
    if (!images || images.length === 0) return null;

    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [containerHeight, setContainerHeight] = useState<number>(0);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadedIndices, setLoadedIndices] = useState<Set<number>>(
        () => new Set([0])
    );

    const carouselRef = useRef<Carousel<SliderImage>>(null);

    const carouselKey = useMemo(
        () =>
            images.map((i) => `${i.id}_${i.updated_at ?? ''}`).join('-'),
        [images]
    );

    const isMobile = useMemo(() => {
        if (containerWidth === 0) return false;
        return containerWidth <= 768;
    }, [containerWidth]);

    useEffect(() => {
        setCurrentIndex(0);
        carouselRef.current?.scrollTo({ index: 0, animated: false });

        setLoadedIndices((prev) => {
            const nxt = new Set(prev);
            nxt.add(0);
            return nxt;
        });
    }, [carouselKey]);

    useEffect(() => {
        if (isMobile) {
            const safeHeight = windowHeight - insets.top - insets.bottom;
            const desiredHeight = safeHeight * 0.75; // например, 85% высоты экрана
            setContainerHeight(desiredHeight);
        } else if (containerWidth > 0) {
            setContainerHeight(containerWidth / aspectRatio);
        }
    }, [isMobile, containerWidth, aspectRatio, windowHeight, insets]);

    const handleIndexChanged = useCallback(
        (idx: number) => {
            setCurrentIndex(idx);
            onIndexChanged?.(idx);

            setLoadedIndices((prev) => {
                const nxt = new Set(prev);
                nxt.add(idx);
                if (idx - 1 >= 0) nxt.add(idx - 1);
                if (idx + 1 < images.length) nxt.add(idx + 1);
                return nxt;
            });
        },
        [images.length, onIndexChanged]
    );

    const shouldRender = useCallback(
        (slideIdx: number) => loadedIndices.has(slideIdx),
        [loadedIndices]
    );

    const renderItem = useCallback(
        ({ item, index: slideIdx }: { item: SliderImage; index: number }) => {
            const uri = appendVersion(item.url, item.updated_at ?? item.id);
            const visible = shouldRender(slideIdx);
            return <Slide key={item.id} uri={uri} isVisible={visible} />;
        },
        [shouldRender]
    );

    const onLayoutContainer = useCallback(
        (e: LayoutChangeEvent) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0 && w !== containerWidth) {
                setContainerWidth(w);
            }
        },
        [containerWidth]
    );

    const navPrev = useCallback(() => carouselRef.current?.prev(), []);
    const navNext = useCallback(() => carouselRef.current?.next(), []);

    useEffect(() => {
        images.forEach((img) => {
            const uri = appendVersion(img.url, img.updated_at ?? img.id);
            Image.prefetch(uri);
        });
    }, [images]);

    return (
        <View
            style={styles.wrapper}
            onLayout={onLayoutContainer}
            accessibilityRole="group"
            accessibilityLabel="Слайдер изображений"
            removeClippedSubviews
        >
            {containerWidth > 0 && containerHeight > 0 && (
                <>
                    <Carousel
                        key={carouselKey}
                        ref={carouselRef}
                        data={images}
                        width={containerWidth}
                        height={containerHeight}
                        loop
                        autoPlay={autoPlay}
                        autoPlayInterval={autoPlayInterval}
                        onSnapToItem={handleIndexChanged}
                        renderItem={renderItem}
                    />

                    {showArrows && !(isMobile && hideArrowsOnMobile) && (
                        <>
                            <NavButton
                                direction="left"
                                offset={NAV_BTN_OFFSET}
                                onPress={navPrev}
                            />
                            <NavButton
                                direction="right"
                                offset={NAV_BTN_OFFSET}
                                onPress={navNext}
                            />
                        </>
                    )}

                    {showDots && (
                        <View style={styles.dots}>
                            {images.map((_, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        styles.dotWrapper,
                                        i === currentIndex && styles.dotActiveWrapper,
                                    ]}
                                    onPress={() => {
                                        carouselRef.current?.scrollTo({ index: i, animated: true });
                                    }}
                                    hitSlop={12}
                                >
                                    <View
                                        style={[
                                            styles.dot,
                                            i === currentIndex && styles.active,
                                        ]}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </>
            )}
        </View>
    );
};

export default memo(Slider);

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        backgroundColor: '#f9f8f2',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 12,
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
        bottom: 12,
        flexDirection: 'row',
        alignSelf: 'center',
    },
    dotWrapper: {
        marginHorizontal: 6,
        padding: 6,
    },
    dotActiveWrapper: {
        padding: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    active: {
        width: 10,
        height: 10,
        backgroundColor: '#000',
    },
});
