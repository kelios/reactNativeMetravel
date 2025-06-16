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

/* ------------------------------------------------------------------
 * Types
 * ----------------------------------------------------------------*/
export interface SliderImage {
    url: string;
    id: number | string;
    updated_at?: string;
}

export interface SliderProps {
    images: SliderImage[];
    /** show navigation arrows (desktop‑first UX) */
    showArrows?: boolean;
    /** show slide indicator dots */
    showDots?: boolean;
    /** hide arrows when width < MOBILE_BREAKPOINT */
    hideArrowsOnMobile?: boolean;
    /** 16 / 9 by default */
    aspectRatio?: number;
    /** enable autoplay */
    autoPlay?: boolean;
    /** autoplay interval in ms */
    autoPlayInterval?: number;
    /** callback on index change */
    onIndexChanged?: (index: number) => void;
    /** additional props passed directly to <ExpoImage> */
    imageProps?: Partial<React.ComponentProps<typeof ExpoImage>>;
    /** how many adjacent slides to preload (default: 2) */
    preloadCount?: number;
}

/* ------------------------------------------------------------------
 * Constants
 * ----------------------------------------------------------------*/
const DEFAULT_ASPECT_RATIO = 16 / 9;
const NAV_BTN_OFFSET = 10;
const MOBILE_BREAKPOINT = 768;
const SWIPE_THRESHOLD = 50;

/* ------------------------------------------------------------------
 * Helpers
 * ----------------------------------------------------------------*/
const buildUri = (img: SliderImage) => {
    const ts = img.updated_at ? Date.parse(img.updated_at) : img.id;
    return `${img.url}${ts ? `?v=${ts}` : ""}`;
};

/* ------------------------------------------------------------------
 * Lightweight memoised components
 * ----------------------------------------------------------------*/
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
            accessibilityLabel={
                direction === "left" ? "Previous slide" : "Next slide"
            }
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
     }: {
        uri: string;
        isVisible: boolean;
        imageProps?: Partial<React.ComponentProps<typeof ExpoImage>>;
    }) => (
        <View style={styles.slide} collapsable={false}>
            {isVisible && (
                <>
                    <ExpoImage
                        style={styles.bg}
                        source={{ uri }}
                        contentFit="cover"
                        cachePolicy="disk"
                        blurRadius={20}
                        priority="low"
                        recyclingKey={`bg-${uri}`}
                        {...imageProps}
                    />
                    <ExpoImage
                        style={styles.img}
                        source={{ uri }}
                        contentFit="contain"
                        cachePolicy="disk"
                        priority="high"
                        transition={150}
                        recyclingKey={`img-${uri}`}
                        {...imageProps}
                    />
                </>
            )}
        </View>
    ),
    (p, n) => p.uri === n.uri && p.isVisible === n.isVisible
);

/* ------------------------------------------------------------------
 * Main component (forwardRef so parent can control the carousel)
 * ----------------------------------------------------------------*/
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
        /* ------------------------------ basics ------------------------------*/
        const { width: windowWidth, height: windowHeight } = useWindowDimensions();
        const insets = useSafeAreaInsets();

        const [containerWidth, setContainerWidth] = useState<number>(windowWidth);
        const [containerHeight, setContainerHeight] = useState<number>(0);
        const [currentIndex, setCurrentIndex] = useState(0);
        const [loadedIndices, setLoadedIndices] = useState<Set<number>>(
            () => new Set([...Array(preloadCount + 1).keys()])
        );
        const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);

        /* ----------------------------- refs --------------------------------*/
        const carouselRef = useRef<Carousel<SliderImage>>(null);
        // allow parent ref access
        React.useImperativeHandle(externalRef, () => carouselRef.current as any, []);

        const isScrolling = useRef(false);

        /* --------------------------- memo data -----------------------------*/
        const carouselKey = useMemo(
            () => images.map((i) => `${i.id}_${i.updated_at ?? ""}`).join("-"),
            [images]
        );

        const isMobile = containerWidth <= MOBILE_BREAKPOINT;

        const uriMap = useMemo(() => images.map(buildUri), [images]);

        /* ----------------------- preload / prefetch ------------------------*/
        useEffect(() => {
            uriMap.slice(0, preloadCount + 1).forEach((uri) => {
                ExpoImage.prefetch?.(uri).catch(() => undefined);
            });
        }, [uriMap, preloadCount]);

        /* --------------------- re-calc dimensions -------------------------*/
        useEffect(() => {
            const safeHeight = isMobile
                ? (windowHeight - insets.top - insets.bottom) * 0.75
                : containerWidth / aspectRatio;
            setContainerHeight(safeHeight);
        }, [isMobile, containerWidth, aspectRatio, windowHeight, insets]);

        /* ---------------------- reset on images change --------------------*/
        useEffect(() => {
            setCurrentIndex(0);
            carouselRef.current?.scrollTo?.({ index: 0, animated: false });
            setLoadedIndices(new Set([...Array(preloadCount + 1).keys()]));
        }, [carouselKey, preloadCount]);

        /* ----------------------- handlers --------------------------------*/
        const handleIndexChanged = useCallback(
            (idx: number) => {
                setCurrentIndex(idx);
                onIndexChanged?.(idx);

                // mark current, prev & next as loaded
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
                />
            ),
            [uriMap, loadedIndices, imageProps]
        );

        const navPrev = useCallback(() => carouselRef.current?.prev?.(), []);
        const navNext = useCallback(() => carouselRef.current?.next?.(), []);

        /* --------------------- pan responder (web mobile) ------------------*/
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

        /* ----------------------------- render ------------------------------*/
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
                                            <View
                                                style={[
                                                    styles.dot,
                                                    active && styles.active,
                                                ]}
                                            />
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

/* ------------------------------------------------------------------
 * Styles – keep outside component to avoid re‑creation
 * ----------------------------------------------------------------*/
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
