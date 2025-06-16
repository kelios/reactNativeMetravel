import React, {
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    InteractionManager,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInView } from 'react-intersection-observer';

import { fetchTravel, fetchTravelBySlug } from '@/src/api/travels';
import type { Travel } from '@/src/types/types';
import FlightWidget from '@/components/aviosales/FlightWidget';
import HotelWidget from '@/components/HotelWidget/HotelWidget';
import TripsterWidget from '@/components/Tripster/TripsterWidget';

// ------------------
// helpers & lazyImport
// ------------------
function lazyImport<T>(factory: () => Promise<{ default: T }>) {
    return lazy(factory);
}

// lazy components – загружаем ТОЛЬКО при необходимости
const Slider = lazyImport(() => import('@/components/travel/Slider'));
const TravelDescription = lazyImport(() => import('@/components/travel/TravelDescription'));
const PointList = lazyImport(() => import('@/components/travel/PointList'));
const NearTravelList = lazyImport(() => import('@/components/travel/NearTravelList'));
const PopularTravelList = lazyImport(() => import('@/components/travel/PopularTravelList'));
const ToggleableMap = lazyImport(() => import('@/components/travel/ToggleableMapSection'));
const MapClientSide = lazyImport(() => import('@/components/Map'));
const CompactSideBarTravel = lazyImport(() => import('@/components/travel/CompactSideBarTravel'));

const WebView = Platform.select({
    native: () => lazyImport(() => import('react-native-webview').then(m => ({ default: m.default ?? m.WebView })) ),
    web: () => () => null,
})();

// Polyfill SList: на RN его ещё нет, на Web есть unstable_*
const SList: React.FC<any> = (props) => {
    // @ts-ignore – экспериментальное API
    const Experimental = (React as any).unstable_SuspenseList;
    return Experimental ? <Experimental {...props} /> : <>{props.children}</>;
};

const convertYouTubeLink = (url: string): string | null => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*v%3D))([^?&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const Fallback = () => (
    <View style={styles.fallback}>
        <ActivityIndicator size="small" color="#6B4F4F" />
    </View>
);

const MENU_WIDTH = 280;
const HEADER_OFFSET_DESKTOP = 72;
const HEADER_OFFSET_MOBILE = 56;
const MAX_CONTENT_WIDTH = 1200;

export default function TravelDetails() {
    // -------------
    // layout flags
    // -------------
    const { width } = useWindowDimensions();
    const isMobile = width <= 768;
    const headerOffset = isMobile ? HEADER_OFFSET_MOBILE : HEADER_OFFSET_DESKTOP;
    const insets = useSafeAreaInsets();
    const [menuOpen, setMenuOpen] = useState(!isMobile);

    const { param } = useLocalSearchParams();
    const slug = Array.isArray(param) ? param[0] : param ?? '';
    const id = Number(slug);
    const isId = !Number.isNaN(id);

    // ------------------
    // data loading
    // ------------------
    const { data: travel, isLoading, isError } = useQuery<Travel>({
        queryKey: ['travel', slug],
        queryFn: () => (isId ? fetchTravel(id) : fetchTravelBySlug(slug)),
        staleTime: 600_000,
        placeholderData: keepPreviousData,
    });

    const [isSuperuser, setIsSuperuser] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        AsyncStorage.multiGet(['isSuperuser', 'userId']).then(([[, su], [, uid]]) => {
            setIsSuperuser(su === 'true');
            setUserId(uid);
        });
    }, []);

    // -------------
    // refs & anchor map (useMemo – стабильный объект)
    // -------------
    const anchor = useMemo(() => ({
        gallery:   React.createRef<View>(),
        video:     React.createRef<View>(),
        description: React.createRef<View>(),
        recommendation: React.createRef<View>(),
        plus:      React.createRef<View>(),
        minus:     React.createRef<View>(),
        map:       React.createRef<View>(),
        points:    React.createRef<View>(),
        near:      React.createRef<View>(),
        popular:   React.createRef<View>(),
    }), []);

    const scrollRef = useRef<ScrollView>(null);
    useEffect(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [slug]);

    const scrollTo = useCallback((k: keyof typeof anchor) => {
        const node = anchor[k]?.current;
        if (!node || !scrollRef.current) return;
        node.measureLayout(
            scrollRef.current!.getInnerViewNode(),
            (_x, y) => {
                scrollRef.current!.scrollTo({ y: Math.max(0, y - headerOffset), animated: true });
            },
            () => {}
        );
        if (isMobile) closeMenu();
    }, [anchor, headerOffset, isMobile]);

    // -------------
    // menu animation
    // -------------
    const animatedX = useRef(new Animated.Value(isMobile ? -MENU_WIDTH : 0)).current;
    const animateMenu = useCallback((open: boolean) => {
        Animated.timing(animatedX, {
            toValue: open ? 0 : -MENU_WIDTH,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [animatedX]);

    const toggleMenu = () => {
        const newState = !menuOpen;
        setMenuOpen(newState);
        animateMenu(newState);
    };
    const closeMenu = () => {
        if (menuOpen) {
            setMenuOpen(false);
            animateMenu(false);
        }
    };

    useEffect(() => {
        if (!isMobile) {
            setMenuOpen(true);
            animateMenu(true);
        } else {
            setMenuOpen(false);
            animateMenu(false);
        }
    }, [isMobile, animateMenu]);

    // ------------------
    // Intersection flags (web) + InteractionManager (native)
    // ------------------
    const [mapVisible, setMapVisible]         = useState(Platform.OS !== 'web');
    const [pointsVisible, setPointsVisible]   = useState(Platform.OS !== 'web');
    const [nearVisible, setNearVisible]       = useState(Platform.OS !== 'web');
    const [popularVisible, setPopularVisible] = useState(Platform.OS !== 'web');

    const [refVideo,    inVideo]    = useInView({ rootMargin: '200px', triggerOnce: true });
    const [refTripster, inTripster] = useInView({ rootMargin: '200px', triggerOnce: true });
    const [refFlight,   inFlight]   = useInView({ rootMargin: '200px', triggerOnce: true });
    const [refHotel,    inHotel]    = useInView({ rootMargin: '200px', triggerOnce: true });

    const [refMap,  inMap]  = useInView({ rootMargin: '200px', triggerOnce: true });
    const [refPts,  inPts]  = useInView({ rootMargin: '200px', triggerOnce: true });
    const [refNear, inNear] = useInView({ rootMargin: '200px', triggerOnce: true });
    const [refPop,  inPop]  = useInView({ rootMargin: '200px', triggerOnce: true });

    useEffect(() => {
        if (Platform.OS === 'web') {
            if (inMap)  setMapVisible(true);
            if (inPts)  setPointsVisible(true);
            if (inNear) setNearVisible(true);
            if (inPop)  setPopularVisible(true);
        }
    }, [inMap, inPts, inNear, inPop]);

    const [canRenderHeavy, setCanRenderHeavy] = useState(Platform.OS === 'web');
    useEffect(() => {
        if (Platform.OS !== 'web') {
            const task = InteractionManager.runAfterInteractions(() => setCanRenderHeavy(true));
            return () => task.cancel();
        }
    }, []);

    // Prefetch near
    const queryClient = useQueryClient();
    useEffect(() => {
        if (travel?.id) {
            queryClient.prefetchQuery(['nearTravels', travel.id], () => fetchNearTravels(travel.id as number));
        }
    }, [travel?.id, queryClient]);

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#6B4F4F" />
            </View>
        );
    }
    if (isError || !travel) {
        return (
            <View style={styles.center}>
                <Text>Ошибка загрузки</Text>
            </View>
        );
    }
    // ------------------
    // SEO for web
    // ------------------
    const pageTitle       = `${travel.name} — metravel.by`;
    const pageDescription = (
        travel.description?.replace(/<[^>]+>/g, '').slice(0, 160) ||
        'Найди место для путешествия и поделись своим опытом.'
    );

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                {slug && <link rel="canonical" href={`https://metravel.by/travels/${slug}`} />}
            </Head>

            <View style={styles.wrapper}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.mainContainer}>
                        {/* -------------
                sidebar menu
            ------------- */}
                        <Animated.View
                            style={[styles.sideMenu, { transform: [{ translateX: animatedX }], width: MENU_WIDTH, zIndex: 1000 }]}
                        >
                            <Suspense fallback={<Fallback />}> {/* одно место для fallback */}
                                <CompactSideBarTravel
                                    travel={travel}
                                    isSuperuser={isSuperuser}
                                    storedUserId={userId}
                                    isMobile={isMobile}
                                    refs={anchor}
                                    closeMenu={closeMenu}
                                    onNavigate={scrollTo}
                                />
                            </Suspense>
                        </Animated.View>

                        {/* FAB – открыть/закрыть */}
                        {isMobile && (
                            <TouchableOpacity
                                onPress={toggleMenu}
                                style={[styles.fab, { top: insets.top + 8 }]}
                                hitSlop={12}
                            >
                                <MaterialIcons name={menuOpen ? 'close' : 'menu'} size={20} color="#fff" />
                            </TouchableOpacity>
                        )}

                        {/* -------------
                main scroll
            ------------- */}
                        <ScrollView
                            ref={scrollRef}
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            style={[styles.scrollView, { marginLeft: isMobile ? 0 : MENU_WIDTH }]}
                        >
                            <View style={styles.contentOuter}>
                                <View style={styles.contentWrapper}>
                                    {/* -----------------------
                      SuspenseList for content
                  ----------------------- */}
                                    <SList revealOrder="forwards" tail="collapsed">
                                        {/* Gallery */}
                                        <View ref={anchor.gallery} />
                                        {!!travel.gallery?.length && (
                                            <Suspense fallback={<Fallback />}>
                                                <View style={styles.sectionContainer}>
                                                    <View style={styles.sliderContainer}>
                                                        <Slider
                                                            images={travel.gallery}
                                                            showArrows={!isMobile}
                                                            showDots={isMobile}
                                                            imageProps={{ loading: 'lazy' }}
                                                        />
                                                    </View>
                                                </View>
                                            </Suspense>
                                        )}

                                        {/* Video */}
                                        <View ref={anchor.video} />
                                        {travel.youtube_link && (
                                            <Suspense fallback={<Fallback />}>
                                                <View style={styles.sectionContainer}>
                                                    <View ref={refVideo} style={styles.videoContainer}>
                                                        {Platform.OS === 'web' ? (
                                                            <div style={{ width: '100%', height: '100%' }}>
                                                                <iframe
                                                                    src={convertYouTubeLink(travel.youtube_link) ?? ''}
                                                                    width="100%"
                                                                    height="100%"
                                                                    style={{ border: 'none' }}
                                                                    loading="lazy"
                                                                    allowFullScreen
                                                                />
                                                            </div>
                                                        ) : (
                                                            <WebView source={{ uri: convertYouTubeLink(travel.youtube_link) ?? '' }} style={{ flex: 1 }} />
                                                        )}
                                                    </View>
                                                </View>
                                            </Suspense>
                                        )}

                                        {/* Description-like sections */}
                                        {[
                                            { ref: anchor.description, html: travel.description, title: travel.name },
                                            { ref: anchor.recommendation, html: travel.recommendation, title: 'Рекомендации' },
                                            { ref: anchor.plus, html: travel.plus, title: 'Плюсы' },
                                            { ref: anchor.minus, html: travel.minus, title: 'Минусы' },
                                        ].map(({ ref, html, title }) =>
                                            html ? (
                                                <Suspense key={title} fallback={<Fallback />}>
                                                    <View ref={ref} style={styles.sectionContainer}>
                                                        <View style={styles.descriptionContainer}>
                                                            <TravelDescription title={title} htmlContent={html} noBox />
                                                        </View>
                                                    </View>
                                                </Suspense>
                                            ) : null
                                        )}

                                        {/* Map */}
                                        <View ref={refMap} style={styles.mapObserver} />
                                        <View ref={anchor.map} style={styles.sectionContainer}>
                                            {canRenderHeavy && mapVisible && travel.coordsMeTravel?.length > 0 && (
                                                <Suspense fallback={<Fallback />}>
                                                    <ToggleableMap>
                                                        <MapClientSide travel={{ data: travel.travelAddress }} />
                                                    </ToggleableMap>
                                                </Suspense>
                                            )}
                                        </View>

                                        {/* Points */}
                                        <View ref={refPts} style={styles.mapObserver} />
                                        <View ref={anchor.points} style={styles.sectionContainer}>
                                            {pointsVisible && travel.travelAddress && (
                                                <Suspense fallback={<Fallback />}>
                                                    <PointList points={travel.travelAddress} />
                                                </Suspense>
                                            )}
                                        </View>

                                        {/* Flight widget */}
                                        <View ref={refFlight} style={styles.mapObserver} />
                                        {inFlight && (
                                            <Suspense fallback={<Fallback />}>
                                                <View style={styles.sectionContainer}>
                                                    <FlightWidget country={travel.countryName} />
                                                </View>
                                            </Suspense>
                                        )}

                                        {/* Near travels */}
                                        <View ref={refNear} style={styles.mapObserver} />
                                        <View ref={anchor.near} style={styles.sectionContainer}>
                                            {nearVisible && travel.travelAddress && (
                                                <Suspense fallback={<Fallback />}>
                                                    <NearTravelList travel={travel} />
                                                </Suspense>
                                            )}
                                        </View>

                                        {/* Popular travels */}
                                        <View ref={refPop} style={styles.mapObserver} />
                                        <View ref={anchor.popular} style={styles.sectionContainer}>
                                            {popularVisible && (
                                                <Suspense fallback={<Fallback />}>
                                                    <PopularTravelList />
                                                </Suspense>
                                            )}
                                        </View>

                                        {/* Tripster */}
                                        <View ref={refTripster} style={styles.mapObserver} />
                                        {inTripster && (
                                            <Suspense fallback={<Fallback />}>
                                                <View style={styles.sectionContainer}>
                                                    <TripsterWidget points={travel.travelAddress} />
                                                </View>
                                            </Suspense>
                                        )}

                                        {/* Hotel */}
                                        <View ref={refHotel} style={styles.mapObserver} />
                                        {inHotel && (
                                            <Suspense fallback={<Fallback />}>
                                                <View style={styles.sectionContainer}>
                                                    <HotelWidget points={travel.travelAddress} />
                                                </View>
                                            </Suspense>
                                        )}
                                    </SList>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </View>
        </>
    );
}

// ------------------
// styles (unchanged)
// ------------------
const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#f9f8f2',
    },
    safeArea: {
        flex: 1,
    },
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    sideMenu: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    fab: {
        position: 'absolute',
        right: 14,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(47,51,46,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1001,
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#f9f8f2',
    },
    scrollContent: {
        paddingBottom: 40,
        minHeight: '100vh',
    },
    contentOuter: {
        width: '100%',
        alignItems: 'center',
    },
    contentWrapper: {
        flex: 1,
        width: '100%',
        maxWidth: MAX_CONTENT_WIDTH,
        paddingHorizontal: 16,
    },
    sectionContainer: {
        width: '100%',
        maxWidth: MAX_CONTENT_WIDTH,
        alignSelf: 'center',
        marginBottom: 24,
    },
    sliderContainer: {
        width: '100%',
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    descriptionContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    mapObserver: {
        height: 1,
    },
    fallback: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f8f2',
    },
});
