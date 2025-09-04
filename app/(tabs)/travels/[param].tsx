import React, {
    lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import {
    ActivityIndicator, Animated, Easing, InteractionManager, Platform, SafeAreaView, ScrollView,
    StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, Pressable, DeviceEventEmitter,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInView } from 'react-intersection-observer';
import { Image as ExpoImage } from 'expo-image';

import { fetchTravel, fetchTravelBySlug, fetchNearTravels } from '@/src/api/travels';
import type { Travel } from '@/src/types/types';
import Slider from '@/components/travel/Slider';

function lazyImport<T>(factory: () => Promise<{ default: T }>) {
    return lazy(factory);
}
const TravelDescription = lazyImport(() => import('@/components/travel/TravelDescription'));
const PointList = lazyImport(() => import('@/components/travel/PointList'));
const NearTravelList = lazyImport(() => import('@/components/travel/NearTravelList'));
const PopularTravelList = lazyImport(() => import('@/components/travel/PopularTravelList'));
const ToggleableMap = lazyImport(() => import('@/components/travel/ToggleableMapSection'));
const MapClientSide = lazyImport(() => import('@/components/Map'));
const CompactSideBarTravel = lazyImport(() => import('@/components/travel/CompactSideBarTravel'));
const WebView = Platform.select({
    native: () => lazyImport(() => import('react-native-webview').then(m => ({ default: m.default ?? m.WebView }))),
    web: () => () => null,
})();

const BelkrajWidget = Platform.select({
    web: () => lazyImport(() => import('@/components/belkraj/BelkrajWidget')),
    native: () => () => null,
})();

const SList: React.FC<any> = (props) => {
    const Experimental = (React as any).unstable_SuspenseList;
    return Experimental ? <Experimental {...props} /> : <>{props.children}</>;
};

const Fallback = () => (
    <View style={styles.fallback}>
        <ActivityIndicator size="small" />
    </View>
);

const MENU_WIDTH = 280;
const HEADER_OFFSET_DESKTOP = 72;
const HEADER_OFFSET_MOBILE = 56;
const MAX_CONTENT_WIDTH = 1200;

/** Utils */
const getYoutubeId = (url?: string | null) => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*v%3D))([^?&]+)/);
    return m?.[1] ?? null;
};

/** Collapsible section (управляемая, с forceOpen) */
const CollapsibleSection: React.FC<{
    title: string;
    initiallyOpen?: boolean;
    forceOpen?: boolean;
    children: React.ReactNode;
}> = ({ title, initiallyOpen = false, forceOpen = false, children }) => {
    const [open, setOpen] = useState(initiallyOpen);

    useEffect(() => {
        if (forceOpen) setOpen(true);
    }, [forceOpen]);

    return (
        <View style={styles.sectionContainer}>
            <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setOpen(o => !o)}
                style={styles.sectionHeaderBtn}
                hitSlop={10}
            >
                <Text style={styles.sectionHeaderText}>{title}</Text>
                <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={22} />
            </TouchableOpacity>
            {open ? <View style={{ marginTop: 12 }}>{children}</View> : null}
        </View>
    );
};

/** Lazy YouTube с постером */
const LazyYouTube: React.FC<{ url: string }> = ({ url }) => {
    const id = getYoutubeId(url);
    const [mounted, setMounted] = useState(false);
    if (!id) return null;

    if (!mounted) {
        return (
            <Pressable onPress={() => setMounted(true)} style={styles.videoContainer} accessibilityRole="button">
                <ExpoImage
                    source={{ uri: `https://img.youtube.com/vi/${id}/hqdefault.jpg` }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                />
                <View style={styles.playOverlay}>
                    <MaterialIcons name="play-circle-fill" size={64} color="#ffffff" />
                </View>
            </Pressable>
        );
    }

    return Platform.OS === 'web' ? (
        <div style={{ width: '100%', height: '100%' }}>
            <iframe
                src={`https://www.youtube.com/embed/${id}`}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                loading="lazy"
                allowFullScreen
            />
        </div>
    ) : (
        <WebView source={{ uri: `https://www.youtube.com/embed/${id}` }} style={{ flex: 1 }} />
    );
};

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

    /** ключ секции, которую нужно раскрыть по событию от сайдбара */
    const [forceOpenKey, setForceOpenKey] = useState<string | null>(null);
    useEffect(() => {
        const onWeb = (e: any) => setForceOpenKey(e?.detail?.key ?? null);
        const onNative = (key: string) => setForceOpenKey(key);

        if (Platform.OS === 'web') {
            // @ts-ignore
            window.addEventListener('open-section', onWeb);
            return () => {
                // @ts-ignore
                window.removeEventListener('open-section', onWeb);
            };
        } else {
            const sub = DeviceEventEmitter.addListener('open-section', onNative);
            return () => sub.remove();
        }
    }, []);

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

    const anchor = useMemo(() => ({
        gallery: React.createRef<View>(),
        video: React.createRef<View>(),
        description: React.createRef<View>(),
        recommendation: React.createRef<View>(),
        plus: React.createRef<View>(),
        minus: React.createRef<View>(),
        map: React.createRef<View>(),
        points: React.createRef<View>(),
        near: React.createRef<View>(),
        popular: React.createRef<View>(),
        excursions: React.createRef<View>(),
    }), []);

    const scrollRef = useRef<ScrollView>(null);
    useEffect(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [slug]);

    const scrollTo = useCallback((k: keyof typeof anchor) => {
        const node = anchor[k]?.current;
        if (!node || !scrollRef.current) return;
        // @ts-ignore
        node.measureLayout(
            // @ts-ignore
            scrollRef.current.getInnerViewNode(),
            (_x, y) => scrollRef.current!.scrollTo({ y: Math.max(0, y - headerOffset), animated: true }),
            () => {}
        );
        if (isMobile) closeMenu();
    }, [anchor, headerOffset, isMobile]);

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

    // лениво — только near/popular
    const [nearVisible, setNearVisible] = useState(Platform.OS !== 'web');
    const [popularVisible, setPopularVisible] = useState(Platform.OS !== 'web');
    const [refNear, inNear] = useInView({ rootMargin: '200px', triggerOnce: true });
    const [refPop, inPop] = useInView({ rootMargin: '200px', triggerOnce: true });

    useEffect(() => {
        if (Platform.OS === 'web') {
            if (inNear) setNearVisible(true);
            if (inPop) setPopularVisible(true);
        }
    }, [inNear, inPop]);

    const [canRenderHeavy, setCanRenderHeavy] = useState(Platform.OS === 'web');
    useEffect(() => {
        if (Platform.OS !== 'web') {
            const task = InteractionManager.runAfterInteractions(() => setCanRenderHeavy(true));
            return () => task.cancel();
        }
    }, []);

    const queryClient = useQueryClient();
    useEffect(() => {
        if (travel?.id) {
            queryClient.prefetchQuery(['nearTravels', travel.id], () => fetchNearTravels(travel.id as number));
        }
    }, [travel?.id, queryClient]);

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
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

    const pageTitle = `${travel.name} — metravel.by`;
    const pageDescription = (
        travel.description?.replace(/<[^>]+>/g, '').slice(0, 160) ||
        'Найди место для путешествия и поделись своим опытом.'
    );

    return (
        <>
            <Head key={slug}>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                {slug && <link rel="canonical" href={`https://metravel.by/travels/${slug}`} />}
                {Platform.OS === 'web' && travel?.gallery?.[0]?.url && (
                    <link
                        rel="preload"
                        as="image"
                        href={`${travel.gallery[0].url}?v=${Date.parse(travel.gallery[0].updated_at ?? travel.gallery[0].id)}`}
                        fetchpriority="high"
                    />
                )}
            </Head>

            <View style={styles.wrapper}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.mainContainer}>
                        {isMobile && menuOpen && (
                            <TouchableOpacity style={styles.backdrop} onPress={closeMenu} activeOpacity={1} />
                        )}

                        <Animated.View
                            style={[styles.sideMenu, { transform: [{ translateX: animatedX }], width: MENU_WIDTH, zIndex: 1000 }]}
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
                                style={[styles.fab, { top: insets.top + 10 }]}
                                hitSlop={12}
                            >
                                <MaterialIcons name={menuOpen ? 'close' : 'menu'} size={24} color="#fff" />
                            </TouchableOpacity>
                        )}

                        <ScrollView
                            ref={scrollRef}
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            style={[styles.scrollView, { marginLeft: isMobile ? 0 : MENU_WIDTH }]}
                        >
                            <View style={styles.contentOuter}>
                                <View style={styles.contentWrapper}>
                                    <SList revealOrder="forwards" tail="collapsed">
                                        <View ref={anchor.gallery} />
                                        {!!travel.gallery?.length && (
                                            <Suspense fallback={<Fallback />}>
                                                <View style={styles.sectionContainer}>
                                                    <View style={styles.sliderContainer}>
                                                        <Slider
                                                            images={travel.gallery}
                                                            showArrows={!isMobile}
                                                            showDots={isMobile}
                                                        />
                                                    </View>
                                                </View>
                                            </Suspense>
                                        )}

                                        {/* Текстовые секции — управляем через forceOpenKey */}
                                        {[
                                            { key: 'description', ref: anchor.description, html: travel.description, title: travel.name },
                                            { key: 'recommendation', ref: anchor.recommendation, html: travel.recommendation, title: 'Рекомендации' },
                                            { key: 'plus', ref: anchor.plus, html: travel.plus, title: 'Плюсы' },
                                            { key: 'minus', ref: anchor.minus, html: travel.minus, title: 'Минусы' },
                                        ].map(({ key, ref, html, title }) =>
                                            html ? (
                                                <Suspense key={title} fallback={<Fallback />}>
                                                    <View ref={ref}>
                                                        <CollapsibleSection
                                                            title={title}
                                                            initiallyOpen={!isMobile}
                                                            forceOpen={forceOpenKey === key}
                                                        >
                                                            <View style={styles.descriptionContainer}>
                                                                <TravelDescription title={title} htmlContent={html} noBox />
                                                            </View>
                                                        </CollapsibleSection>
                                                    </View>
                                                </Suspense>
                                            ) : null
                                        )}

                                        {/* Видео */}
                                        {travel.youtube_link && (
                                            <View ref={anchor.video} style={styles.sectionContainer}>
                                                <Text style={styles.sectionHeaderText}>Видео</Text>
                                                <View style={{ marginTop: 12 }}>
                                                    <LazyYouTube url={travel.youtube_link} />
                                                </View>
                                            </View>
                                        )}

                                        {/* Экскурсии — всегда показывать (web) */}
                                        {Platform.OS === 'web' && travel.travelAddress?.length > 0 && (
                                            <Suspense fallback={<Fallback />}>
                                                <View ref={anchor.excursions} style={styles.sectionContainer}>
                                                    <Text style={styles.sectionHeaderText}>Экскурсии</Text>
                                                    <View style={{ marginTop: 12 }}>
                                                        <BelkrajWidget
                                                            countryCode={travel.countryCode}
                                                            points={travel.travelAddress}
                                                            collapsedHeight={600}
                                                            expandedHeight={1000}
                                                        />
                                                    </View>
                                                </View>
                                            </Suspense>
                                        )}

                                        {/* Карта — всегда показывать */}
                                        <View ref={anchor.map} style={styles.sectionContainer}>
                                            <Text style={styles.sectionHeaderText}></Text>
                                            <View style={{ marginTop: 12 }}>
                                                {canRenderHeavy && travel.coordsMeTravel?.length > 0 && (
                                                    <Suspense fallback={<Fallback />}>
                                                        <ToggleableMap>
                                                            <MapClientSide travel={{ data: travel.travelAddress }} />
                                                        </ToggleableMap>
                                                    </Suspense>
                                                )}
                                            </View>
                                        </View>

                                        {/* Точки — всегда показывать */}
                                        <View ref={anchor.points} style={styles.sectionContainer}>
                                            <Text style={styles.sectionHeaderText}></Text>
                                            <View style={{ marginTop: 12 }}>
                                                {travel.travelAddress && (
                                                    <Suspense fallback={<Fallback />}>
                                                        <PointList points={travel.travelAddress} />
                                                    </Suspense>
                                                )}
                                            </View>
                                        </View>

                                        {/* Рядом — лениво */}
                                        <View ref={refNear} style={{ height: 1 }} />
                                        <View ref={anchor.near} style={styles.sectionContainer}>
                                            <Text style={styles.sectionHeaderText}></Text>
                                            <View style={{ marginTop: 12 }}>
                                                {nearVisible && travel.travelAddress && (
                                                    <Suspense fallback={<Fallback />}>
                                                        <NearTravelList travel={travel} />
                                                    </Suspense>
                                                )}
                                            </View>
                                        </View>

                                        {/* Популярное — лениво */}
                                        <View ref={refPop} style={{ height: 1 }} />
                                        <View ref={anchor.popular} style={styles.sectionContainer}>
                                            <Text style={styles.sectionHeaderText}></Text>
                                            <View style={{ marginTop: 12 }}>
                                                {popularVisible && (
                                                    <Suspense fallback={<Fallback />}>
                                                        <PopularTravelList />
                                                    </Suspense>
                                                )}
                                            </View>
                                        </View>
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

const ANDROID_ELEVATION_CARD = Platform.select({ android: 2, default: 0 });
const ANDROID_ELEVATION_MENU = Platform.select({ android: 5, default: 0 });

const styles = StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: '#f9f8f2' },
    safeArea: { flex: 1 },
    mainContainer: { flex: 1, flexDirection: 'row' },

    backdrop: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.25)',
        zIndex: 999,
    },

    sideMenu: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0,
        backgroundColor: '#fff',
        shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
        shadowRadius: Platform.OS === 'ios' ? 4 : 0,
        elevation: ANDROID_ELEVATION_MENU,
    },

    fab: {
        position: 'absolute',
        right: 14,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(47,51,46,0.72)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1001,
    },

    scrollView: { flex: 1, backgroundColor: '#f9f8f2' },
    scrollContent: { paddingBottom: 40, minHeight: Platform.OS === 'web' ? '100vh' as any : undefined },
    contentOuter: { width: '100%', alignItems: 'center' },
    contentWrapper: { flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH, paddingHorizontal: 16 },

    sectionContainer: {
        width: '100%',
        maxWidth: MAX_CONTENT_WIDTH,
        alignSelf: 'center',
        marginBottom: 16,
    },

    sectionHeaderBtn: {
        width: '100%',
        minHeight: 44,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
        shadowOpacity: Platform.OS === 'ios' ? 0.06 : 0,
        shadowRadius: Platform.OS === 'ios' ? 2 : 0,
        shadowOffset: { width: 0, height: 1 },
        elevation: ANDROID_ELEVATION_CARD,
    },

    sectionHeaderText: {
        fontSize: 16,
        fontWeight: '600',
    },

    sliderContainer: { width: '100%' },

    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
    },

    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },

    descriptionContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,

        shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: Platform.OS === 'ios' ? 0.05 : 0,
        shadowRadius: Platform.OS === 'ios' ? 2 : 0,
        elevation: ANDROID_ELEVATION_CARD,
    },

    fallback: { paddingVertical: 24, alignItems: 'center' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f8f2' },
});
