// components/common/Slider.tsx
import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    forwardRef,
} from "react";
import {
    StyleSheet,
    TouchableOpacity,
    View,
    LayoutChangeEvent,
    Platform,
    useWindowDimensions,
    PanResponder,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import Carousel from "react-native-reanimated-carousel";
import { AntDesign } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SliderImage {
    url: string;
    id: number | string;
    updated_at?: string;
    width?: number;
    height?: number;
}

interface SliderProps {
    images: SliderImage[];
    showArrows?: boolean;
    showDots?: boolean;
    hideArrowsOnMobile?: boolean;
    aspectRatio?: number; // fallback если у изображений нет размеров
    autoPlay?: boolean;
    autoPlayInterval?: number;
    onIndexChanged?: (index: number) => void;
    imageProps?: Partial<React.ComponentProps<typeof ExpoImage>>;
    preloadCount?: number; // сколько слайдов вокруг активного держать в памяти
}

const DEFAULT_ASPECT_RATIO = 16 / 9;
const NAV_BTN_OFFSET = 10;
const MOBILE_BREAKPOINT = 768;
const SWIPE_THRESHOLD = 50;

const buildUri = (img: SliderImage) => {
    const ts = img.updated_at ? Date.parse(img.updated_at) : Number(img.id);
    return ts && Number.isFinite(ts) ? `${img.url}?v=${ts}` : img.url;
};

const NavButton = memo(
    ({
         direction,
         onPress,
         offset,
     }: {
        direction: "left" | "right";
        onPress: () => void;
        offset: number;
    }) => (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.navBtn,
                direction === "left" ? { left: offset } : { right: offset },
            ]}
            accessibilityRole="button"
            accessibilityLabel={direction === "left" ? "Previous slide" : "Next slide"}
            hitSlop={10}
        >
            <AntDesign
                name={direction === "left" ? "left" : "right"}
                size={20}
                color="#fff"
            />
        </TouchableOpacity>
    )
);

const Slide = memo(
    ({
         uri,
         isVisible,
         imageProps,
         isPriorityImage,
         dimensions,
     }: {
        uri: string;
        isVisible: boolean;
        imageProps?: Partial<React.ComponentProps<typeof ExpoImage>>;
        isPriorityImage?: boolean;
        dimensions?: { width?: number; height?: number };
    }) => {
        // итоговый стиль основного изображения
        const mainStyle =
            dimensions?.width && dimensions?.height
                ? [styles.img, { aspectRatio: dimensions.width / dimensions.height }]
                : styles.img;

        return (
            <View style={styles.slide} collapsable={false}>
                {isVisible && (
                    <>
                        {/* фон с блюром (не влияет на layout) */}
                        <ExpoImage
                            source={{ uri }}
                            contentFit="cover"
                            cachePolicy="disk"
                            priority={isPriorityImage ? "high" : "low"}
                            recyclingKey={`bg-${uri}`}
                            {...Platform.select({
                                web: {
                                    style: [styles.bg, { filter: "blur(6px)", willChange: "filter" }],
                                },
                                default: {
                                    style: styles.bg,
                                    blurRadius: 20,
                                },
                            })}
                        />
                        {/* основное изображение */}
                        <ExpoImage
                            source={{ uri }}
                            contentFit="contain"
                            cachePolicy="disk"
                            priority="high"
                            transition={150}
                            recyclingKey={`img-${uri}`}
                            contentPosition="center"
                            accessibilityIgnoresInvertColors
                            // RN Web поддерживает нативный fetchpriority – прокидываем как prop
                            {...(Platform.OS === "web" && isPriorityImage
                                ? { fetchpriority: "high" as any }
                                : {})}
                            style={mainStyle as any}
                            {...imageProps}
                        />
                    </>
                )}
            </View>
        );
    },
    (p, n) =>
        p.uri === n.uri &&
        p.isVisible === n.isVisible &&
        p.isPriorityImage === n.isPriorityImage
);

const Slider = forwardRef<Carousel<SliderImage>, SliderProps>(
    (
        {
            images,
            showArrows = true,
            showDots = true,
            hideArrowsOnMobile = false,
            aspectRatio = DEFAULT_ASPECT_RATIO,
            autoPlay = true,
            autoPlayInterval = 8000,
            onIndexChanged,
            imageProps,
            preloadCount = 2,
        },
        externalRef
    ) => {
        const { width: windowWidth, height: windowHeight } = useWindowDimensions();
        const insets = useSafeAreaInsets();

        const [containerWidth, setContainerWidth] = useState<number>(windowWidth);
        const [containerHeight, setContainerHeight] = useState<number>(0);
        const [currentIndex, setCurrentIndex] = useState(0);
        const [loadedIndices, setLoadedIndices] = useState<Set<number>>(
            () => new Set([...Array(Math.min(preloadCount + 1, images.length)).keys()])
        );
        const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);

        const carouselRef = useRef<Carousel<SliderImage>>(null);
        const isScrolling = useRef(false);

        React.useImperativeHandle(externalRef, () => carouselRef.current as any, []);

        // если у первого изображения есть размеры – используем их для высоты,
        // чтобы уменьшить CLS
        const firstAR = useMemo(() => {
            const first = images[0];
            return first?.width && first?.height
                ? first.width / first.height
                : aspectRatio;
        }, [images, aspectRatio]);

        const carouselKey = useMemo(
            () => images.map((i) => `${i.id}_${i.updated_at ?? ""}`).join("-"),
            [images]
        );

        const isMobile = containerWidth <= MOBILE_BREAKPOINT;
        const uriMap = useMemo(() => images.map(buildUri), [images]);

        useEffect(() => {
            const safeHeight = isMobile
                ? (windowHeight - insets.top - insets.bottom) * 0.75
                : containerWidth / firstAR;
            setContainerHeight(Math.max(160, safeHeight)); // минимальная высота для стабильности
        }, [isMobile, containerWidth, firstAR, windowHeight, insets]);

        // при смене набора изображений сбрасываем индекс и окно предзагрузки
        useEffect(() => {
            setCurrentIndex(0);
            carouselRef.current?.scrollTo?.({ index: 0, animated: false });
            setLoadedIndices(
                new Set([...Array(Math.min(preloadCount + 1, images.length)).keys()])
            );
        }, [carouselKey, preloadCount, images.length]);

        const handleIndexChanged = useCallback(
            (idx: number) => {
                setCurrentIndex(idx);
                onIndexChanged?.(idx);
                setLoadedIndices((prev) => {
                    const nxt = new Set(prev);
                    for (let i = -preloadCount; i <= preloadCount; i++) {
                        const target = idx + i;
                        if (target >= 0 && target < images.length) nxt.add(target);
                    }
                    return nxt;
                });
            },
            [images.length, onIndexChanged, preloadCount]
        );

        const renderItem = useCallback(
            ({ item, index }: { item: SliderImage; index: number }) => (
                <Slide
                    key={`slide-${item.id}`}
                    uri={uriMap[index]}
                    isVisible={loadedIndices.has(index)}
                    imageProps={imageProps}
                    isPriorityImage={index === 0}
                    dimensions={{ width: item.width, height: item.height }}
                />
            ),
            [uriMap, loadedIndices, imageProps]
        );

        const navPrev = useCallback(() => carouselRef.current?.prev?.(), []);
        const navNext = useCallback(() => carouselRef.current?.next?.(), []);

        const panResponder = useMemo(
            () =>
                PanResponder.create({
                    onStartShouldSetPanResponder: () => true,
                    onMoveShouldSetPanResponder: (_, gesture) => {
                        const { dx, dy } = gesture;
                        if (Math.abs(dy) > Math.abs(dx)) {
                            isScrolling.current = true;
                            return false;
                        }
                        isScrolling.current = false;
                        return true;
                    },
                    onPanResponderMove: (_, gesture) => {
                        if (isScrolling.current) return;
                        const { dx } = gesture;
                        if (Math.abs(dx) > SWIPE_THRESHOLD) {
                            dx > 0 ? navPrev() : navNext();
                            isScrolling.current = true;
                        }
                    },
                    onPanResponderRelease: () => {
                        isScrolling.current = false;
                    },
                }),
            [navPrev, navNext]
        );

        if (!images.length) return null;

        return (
            <View
                style={[styles.wrapper, { height: containerHeight }]}
                onLayout={(e: LayoutChangeEvent) =>
                    setContainerWidth(e.nativeEvent.layout.width)
                }
                accessibilityRole="group"
                accessibilityLabel="Image slider"
                {...(Platform.OS === "web" && isMobile ? panResponder.panHandlers : {})}
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
                                default: {
                                    activeOffsetX: [-10, 10],
                                    activeOffsetY: [-999, 999],
                                },
                                web: isMobile ? undefined : { activeOffsetX: [-10, 10] },
                            })}
                            onTouchStart={() => setIsAutoPlayPaused(true)}
                            onTouchEnd={() => setIsAutoPlayPaused(false)}
                            onTouchCancel={() => setIsAutoPlayPaused(false)}
                            enabled={Platform.OS !== "web" || !isMobile}
                        />

                        {showArrows && !(isMobile && hideArrowsOnMobile) && (
                            <>
                                <NavButton direction="left" offset={NAV_BTN_OFFSET} onPress={navPrev} />
                                <NavButton direction="right" offset={NAV_BTN_OFFSET} onPress={navNext} />
                            </>
                        )}

                        {showDots && (
                            <View style={styles.dots} pointerEvents="box-none">
                                {images.map((_, i) => {
                                    const active = i === currentIndex;
                                    return (
                                        <TouchableOpacity
                                            key={`dot-${i}`}
                                            style={styles.dotWrapper}
                                            onPress={() =>
                                                carouselRef.current?.scrollTo?.({ index: i, animated: true })
                                            }
                                            hitSlop={12}
                                        >
                                            <View style={[styles.dot, active && styles.active]} />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </>
                )}
            </View>
        );
    }
);

export default memo(Slider);

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        backgroundColor: "#f9f8f2",
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        ...Platform.select({
            web: {
                touchAction: "pan-y",
                userSelect: "none",
            },
        }),
    },
    slide: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    bg: {
        ...StyleSheet.absoluteFillObject,
    },
    img: {
        width: "100%",
        height: "100%",
    },
    navBtn: {
        position: "absolute",
        top: "50%",
        marginTop: -20,
        backgroundColor: "rgba(0,0,0,0.4)",
        padding: 10,
        borderRadius: 20,
        zIndex: 10,
        ...Platform.select({ web: { cursor: "pointer" } }),
    },
    dots: {
        position: "absolute",
        bottom: 12,
        flexDirection: "row",
        alignSelf: "center",
    },
    dotWrapper: {
        marginHorizontal: 6,
        padding: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    active: {
        width: 10,
        height: 10,
        backgroundColor: "#000",
    },
});
