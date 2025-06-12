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
    PanResponder,
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
    aspectRatio?: number;
    autoPlay?: boolean;
    autoPlayInterval?: number;
    onIndexChanged?: (index: number) => void;
}

const DEFAULT_ASPECT_RATIO = 16 / 9;
const NAV_BTN_OFFSET = 10;
const MOBILE_BREAKPOINT = 768;
const SWIPE_THRESHOLD = 50;

const NavButton = memo(
    ({ direction, onPress, offset }: { direction: 'left' | 'right'; onPress: () => void; offset: number; }) => (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.navBtn,
                direction === 'left' ? { left: offset } : { right: offset },
            ]}
            accessibilityRole="button"
            accessibilityLabel={direction === 'left' ? 'Previous slide' : 'Next slide'}
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
                    source={{ uri }}
                    contentFit="cover"
                    cachePolicy="disk"
                    blurRadius={20}
                    priority="low"
                />
                <Image
                    style={styles.img}
                    source={{ uri }}
                    contentFit="contain"
                    cachePolicy="disk"
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
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const [containerWidth, setContainerWidth] = useState<number>(windowWidth);
    const [containerHeight, setContainerHeight] = useState<number>(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadedIndices, setLoadedIndices] = useState<Set<number>>(new Set([0]));
    const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);

    const carouselRef = useRef<Carousel<SliderImage>>(null);
    const isScrolling = useRef(false);

    const carouselKey = useMemo(
        () => images.map((i) => `${i.id}_${i.updated_at ?? ''}`).join('-'),
        [images]
    );

    const isMobile = containerWidth <= MOBILE_BREAKPOINT;

    const uriMap = useMemo(() => {
        return images.map(img => {
            const ts = img.updated_at ? Date.parse(img.updated_at) : img.id;
            return `${img.url}${ts ? `?v=${ts}` : ''}`;
        });
    }, [images]);

    useEffect(() => {
        setCurrentIndex(0);
        carouselRef.current?.scrollTo({ index: 0, animated: false });
        setLoadedIndices(new Set([0]));
    }, [carouselKey]);

    useEffect(() => {
        const safeHeight = isMobile
            ? (windowHeight - insets.top - insets.bottom) * 0.75
            : containerWidth / aspectRatio;
        setContainerHeight(safeHeight);
    }, [isMobile, containerWidth, aspectRatio, windowHeight, insets]);

    const handleIndexChanged = useCallback((idx: number) => {
        setCurrentIndex(idx);
        onIndexChanged?.(idx);

        setLoadedIndices(prev => {
            const nxt = new Set(prev);
            nxt.add(idx);
            if (idx - 1 >= 0) nxt.add(idx - 1);
            if (idx + 1 < images.length) nxt.add(idx + 1);
            return nxt;
        });
    }, [images.length, onIndexChanged]);

    const renderItem = useCallback(({ item, index }: { item: SliderImage; index: number }) => {
        return <Slide key={item.id} uri={uriMap[index]} isVisible={loadedIndices.has(index)} />;
    }, [uriMap, loadedIndices]);

    const navPrev = useCallback(() => carouselRef.current?.prev(), []);
    const navNext = useCallback(() => carouselRef.current?.next(), []);

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
            const { dx, dy } = gestureState;
            if (Math.abs(dy) > Math.abs(dx)) {
                isScrolling.current = true;
                return false;
            }
            isScrolling.current = false;
            return true;
        },
        onPanResponderMove: (_, gestureState) => {
            if (isScrolling.current) return;
            const { dx } = gestureState;
            if (Math.abs(dx) > SWIPE_THRESHOLD) {
                dx > 0 ? navPrev() : navNext();
                isScrolling.current = true;
            }
        },
        onPanResponderRelease: () => {
            isScrolling.current = false;
        },
    }), [navPrev, navNext]);

    return (
        <View
            style={styles.wrapper}
            onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
            accessibilityRole="group"
            accessibilityLabel="Image slider"
            {...(Platform.OS === 'web' && isMobile ? panResponder.panHandlers : {})}
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
                        autoPlay={!isAutoPlayPaused && autoPlay}
                        autoPlayInterval={autoPlayInterval}
                        onSnapToItem={handleIndexChanged}
                        renderItem={renderItem}
                        panGestureHandlerProps={Platform.select({
                            default: { activeOffsetX: [-10, 10], activeOffsetY: [-999, 999] },
                            web: isMobile ? undefined : { activeOffsetX: [-10, 10] }
                        })}
                        onTouchStart={() => setIsAutoPlayPaused(true)}
                        onTouchEnd={() => setIsAutoPlayPaused(false)}
                        onTouchCancel={() => setIsAutoPlayPaused(false)}
                        enabled={Platform.OS !== 'web' || !isMobile}
                    />

                    {showArrows && !(isMobile && hideArrowsOnMobile) && (
                        <>
                            <NavButton direction="left" offset={NAV_BTN_OFFSET} onPress={navPrev} />
                            <NavButton direction="right" offset={NAV_BTN_OFFSET} onPress={navNext} />
                        </>
                    )}

                    {showDots && (
                        <View style={styles.dots}>
                            {images.map((_, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.dotWrapper}
                                    onPress={() => carouselRef.current?.scrollTo({ index: i, animated: true })}
                                    hitSlop={12}
                                >
                                    <View style={[
                                        styles.dot,
                                        i === currentIndex && styles.active,
                                    ]} />
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
        ...Platform.select({
            web: {
                touchAction: 'pan-y',
                userSelect: 'none',
            },
        }),
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
