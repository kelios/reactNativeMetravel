import React, {
    lazy, Suspense, useCallback, useEffect, useRef, useState,
} from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    Platform,
    Pressable,
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
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInView } from 'react-intersection-observer';

import { fetchTravel, fetchTravelBySlug } from '@/src/api/travels';
import type { Travel } from '@/src/types/types';

const Slider = lazy(() => import('@/components/travel/Slider'));
const TravelDescription = lazy(() => import('@/components/travel/TravelDescription'));
const PointList = lazy(() => import('@/components/travel/PointList'));
const NearTravelList = lazy(() => import('@/components/travel/NearTravelList'));
const PopularTravelList = lazy(() => import('@/components/travel/PopularTravelList'));
const ToggleableMap = lazy(() => import('@/components/travel/ToggleableMapSection'));
const MapClientSide = lazy(() => import('@/components/Map'));
const CompactSideBarTravel = lazy(() => import('@/components/travel/CompactSideBarTravel'));
const WebView = Platform.select({
    native: () => lazy(() => import('react-native-webview').then(m => ({ default: m.WebView }))),
    web: () => () => null,
})();

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
    const { width } = useWindowDimensions();
    const isMobile = width <= 768;
    const headerOffset = isMobile ? HEADER_OFFSET_MOBILE : HEADER_OFFSET_DESKTOP;
    const insets = useSafeAreaInsets();
    const [menuOpen, setMenuOpen] = useState(!isMobile);

    const { param } = useLocalSearchParams();
    const slug = Array.isArray(param) ? param[0] : param ?? '';
    const id = Number(slug);
    const isId = !Number.isNaN(id);

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

    const animatedX = useRef(new Animated.Value(isMobile ? -MENU_WIDTH : 0)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    const animateMenu = (open: boolean) => {
        Animated.parallel([
            Animated.timing(animatedX, {
                toValue: open ? 0 : -MENU_WIDTH,
                duration: 250,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
                toValue: open ? 0.5 : 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    };

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
    }, [isMobile]);

    const scrollRef = useRef<ScrollView>(null);
    const anchor = {
        gallery: useRef<View>(null),
        video: useRef<View>(null),
        description: useRef<View>(null),
        recommendation: useRef<View>(null),
        plus: useRef<View>(null),
        minus: useRef<View>(null),
        map: useRef<View>(null),
        points: useRef<View>(null),
        near: useRef<View>(null),
        popular: useRef<View>(null),
    } as const;

    const scrollTo = useCallback((k: keyof typeof anchor) => {
        const node = anchor[k]?.current;
        if (!node || !scrollRef.current) return;
        setTimeout(() => {
            node.measureLayout(
                scrollRef.current!.getInnerViewNode(),
                (_x, y) => {
                    scrollRef.current!.scrollTo({ y: Math.max(0, y - headerOffset), animated: true });
                },
                () => {}
            );
            if (isMobile) closeMenu();
        }, 0);
    }, [headerOffset, isMobile]);

    const [refMap, inMap] = useInView({ rootMargin: '200px', triggerOnce: true });
    const [refPts, inPoints] = useInView({ rootMargin: '200px', triggerOnce: true });
    const [refNear, inNear] = useInView({ rootMargin: '200px', triggerOnce: true });
    const [refPop, inPopular] = useInView({ rootMargin: '200px', triggerOnce: true });

    if (isLoading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#6B4F4F" />
        </View>
    );
    if (isError || !travel) return (
        <View style={styles.center}>
            <Text>Ошибка загрузки</Text>
        </View>
    );

    const descTxt = travel.description?.replace(/<[^>]+>/g, '').slice(0, 160) || '';
    const contentWidth = Math.min(width - (isMobile ? 0 : MENU_WIDTH) - 32, MAX_CONTENT_WIDTH);

    return (
        <>
            <Head>
                <title>{travel.name} — metravel.by</title>
                <meta name="description" content={descTxt} />
                <link rel="canonical" href={`https://metravel.by/travels/${slug}`} />
            </Head>

            <View style={styles.wrapper}>
                <SafeAreaView style={styles.safeArea}>


                    <View style={styles.mainContainer}>
                        <Animated.View
                            style={[
                                styles.sideMenu,
                                {
                                    transform: [{ translateX: animatedX }],
                                    width: MENU_WIDTH,
                                    zIndex: 1000,
                                }
                            ]}
                        >
                            <Suspense fallback={<Fallback />}>
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

                        {isMobile && (
                            <TouchableOpacity
                                onPress={toggleMenu}
                                style={[styles.fab, { top: insets.top + 8 }]}
                                hitSlop={12}
                            >
                                <MaterialIcons name={menuOpen ? 'close' : 'menu'} size={20} color="#fff" />
                            </TouchableOpacity>
                        )}

                        <ScrollView
                            ref={scrollRef}
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            style={[
                                styles.scrollView,
                                {
                                    marginLeft: isMobile ? 0 : MENU_WIDTH,
                                }
                            ]}
                        >
                            <View style={[styles.contentWrapper, { width: contentWidth }]}>
                                <View ref={anchor.gallery} />
                                {!!travel.gallery?.length && (
                                    <Suspense fallback={<Fallback />}>
                                        <View style={styles.sliderContainer}>
                                            <Slider
                                                images={travel.gallery}
                                                showArrows={!isMobile}
                                                showDots={isMobile}
                                            />
                                        </View>
                                    </Suspense>
                                )}

                                <View ref={anchor.video} />
                                {travel.youtube_link && (
                                    <View style={styles.videoContainer}>
                                        {Platform.OS === 'web' ? (
                                            <div style={{ width: '100%', height: '100%' }}>
                                                <iframe
                                                    src={convertYouTubeLink(travel.youtube_link) ?? ''}
                                                    width="100%"
                                                    height="100%"
                                                    style={{ border: 'none' }}
                                                    allowFullScreen
                                                />
                                            </div>
                                        ) : (
                                            <WebView
                                                source={{ uri: convertYouTubeLink(travel.youtube_link) ?? '' }}
                                                style={{ flex: 1 }}
                                            />
                                        )}
                                    </View>
                                )}

                                {[
                                    { ref: anchor.description, html: travel.description, title: travel.name },
                                    { ref: anchor.recommendation, html: travel.recommendation, title: 'Рекомендации' },
                                    { ref: anchor.plus, html: travel.plus, title: 'Плюсы' },
                                    { ref: anchor.minus, html: travel.minus, title: 'Минусы' },
                                ].map(({ ref, html, title }) => html && (
                                    <React.Fragment key={title}>
                                        <View ref={ref} />
                                        <View style={styles.descriptionContainer}>
                                            <Suspense fallback={<Fallback />}>
                                                <TravelDescription
                                                    title={title}
                                                    htmlContent={html}
                                                    noBox
                                                />
                                            </Suspense>
                                        </View>
                                    </React.Fragment>
                                ))}

                                <View ref={refMap} />
                                <View ref={anchor.map}>
                                    {inMap && travel.coordsMeTravel?.length > 0 && (
                                        <Suspense fallback={<Fallback />}>
                                            <ToggleableMap>
                                                <MapClientSide travel={{ data: travel.travelAddress }} />
                                            </ToggleableMap>
                                        </Suspense>
                                    )}
                                </View>

                                <View ref={refPts} />
                                <View ref={anchor.points}>
                                    {inPoints && travel.travelAddress && (
                                        <Suspense fallback={<Fallback />}>
                                            <PointList points={travel.travelAddress} />
                                        </Suspense>
                                    )}
                                </View>

                                <View ref={refNear} />
                                <View ref={anchor.near}>
                                    {inNear && travel.travelAddress && (
                                        <Suspense fallback={<Fallback />}>
                                            <NearTravelList travel={travel} />
                                        </Suspense>
                                    )}
                                </View>

                                <View ref={refPop} />
                                <View ref={anchor.popular}>
                                    {inPopular && (
                                        <Suspense fallback={<Fallback />}>
                                            <PopularTravelList />
                                        </Suspense>
                                    )}
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </View>
        </>
    );
}

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
    overlayWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 999,
    },
    overlayPressable: {
        flex: 1,
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
    },
    contentWrapper: {
        flex: 1,
        alignSelf: 'center',
        paddingHorizontal: 16,
    },
    sliderContainer: {
        width: '100%',
        marginBottom: 32,
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16/9,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
        marginBottom: 32,
    },
    descriptionContainer: {
        width: '100%',
        marginBottom: 32,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    mapContainer: {
        width: '100%',
        marginBottom: 32,
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    pointsContainer: {
        width: '100%',
        marginBottom: 32,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    nearContainer: {
        width: '100%',
        marginBottom: 32,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    popularContainer: {
        width: '100%',
        marginBottom: 32,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
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