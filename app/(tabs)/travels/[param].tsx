// app/travels/[param].tsx
import React, {
    lazy, Suspense, useCallback, useEffect, useRef, useState, useMemo,
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
    Pressable,
    DeviceEventEmitter,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInView } from 'react-intersection-observer';
import { Image as ExpoImage } from 'expo-image';

import { fetchTravel, fetchTravelBySlug, fetchNearTravels } from '@/src/api/travels';
import type { Travel } from '@/src/types/types';
import Slider from '@/components/travel/Slider';
import InstantSEO from '@/components/seo/InstantSEO';
import {useIsFocused} from "@react-navigation/native/src";

// ---- lazy helper with inline error fallback ----
const createLazyComponent = <T,>(factory: () => Promise<{ default: T }>) =>
    lazy(() =>
        factory().catch(() => ({
            default: (() => <Text>Component failed to load</Text>) as unknown as T,
        })),
    );

const TravelDescription     = createLazyComponent(() => import('@/components/travel/TravelDescription'));
const PointList             = createLazyComponent(() => import('@/components/travel/PointList'));
const NearTravelList        = createLazyComponent(() => import('@/components/travel/NearTravelList'));
const PopularTravelList     = createLazyComponent(() => import('@/components/travel/PopularTravelList'));
const ToggleableMap         = createLazyComponent(() => import('@/components/travel/ToggleableMapSection'));
const MapClientSide         = createLazyComponent(() => import('@/components/Map'));
const CompactSideBarTravel  = createLazyComponent(() => import('@/components/travel/CompactSideBarTravel'));

const WebViewComponent = Platform.OS === 'web'
    ? (() => null)
    : createLazyComponent(() => import('react-native-webview').then(m => ({ default: m.default ?? m.WebView })));

const BelkrajWidgetComponent = Platform.OS === 'web'
    ? createLazyComponent(() => import('@/components/belkraj/BelkrajWidget'))
    : (() => null);

const SList: React.FC<any> = (props) => {
    const Experimental = (React as any).unstable_SuspenseList || (React as any).SuspenseList;
    return Experimental ? <Experimental {...props} /> : <>{props.children}</>;
};

const Fallback = () => (
    <View style={styles.fallback}>
        <ActivityIndicator size="small" />
    </View>
);

const MENU_WIDTH = 280;
const HEADER_OFFSET_DESKTOP = 72;
const HEADER_OFFSET_MOBILE  = 56;
const MAX_CONTENT_WIDTH     = 1200;

/** Utils */
const getYoutubeId = (url?: string | null) => {
    if (!url) return null;
    const m =
        url.match(/(?:youtu\.be\/|shorts\/|embed\/|watch\?v=|watch\?.*?v%3D)([^?&/#]+)/) ||
        url.match(/youtube\.com\/.*?[?&]v=([^?&#]+)/);
    return m?.[1] ?? null;
};

const stripToDescription = (html?: string) => {
    const plain = (html || '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    return (plain || 'Найди место для путешествия и поделись своим опытом.').slice(0, 160);
};

/** Collapsible section */
const CollapsibleSection: React.FC<{
    title: string;
    initiallyOpen?: boolean;
    forceOpen?: boolean;
    children: React.ReactNode;
}> = ({ title, initiallyOpen = false, forceOpen = false, children }) => {
    const [open, setOpen] = useState(initiallyOpen);
    useEffect(() => { if (forceOpen) setOpen(true); }, [forceOpen]);

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

/** Lazy YouTube */
const LazyYouTube: React.FC<{ url: string }> = ({ url }) => {
    const id = useMemo(() => getYoutubeId(url), [url]);
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
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
        </div>
    ) : (
        <WebViewComponent source={{ uri: `https://www.youtube.com/embed/${id}` }} style={{ flex: 1 }} />
    );
};

// Anchors
interface SectionAnchors {
    gallery: React.RefObject<View>;
    video: React.RefObject<View>;
    description: React.RefObject<View>;
    recommendation: React.RefObject<View>;
    plus: React.RefObject<View>;
    minus: React.RefObject<View>;
    map: React.RefObject<View>;
    points: React.RefObject<View>;
    near: React.RefObject<View>;
    popular: React.RefObject<View>;
    excursions: React.RefObject<View>;
}

const useResponsive = () => {
    const { width } = useWindowDimensions();
    const isMobile = width <= 768;
    return { isMobile, headerOffset: isMobile ? HEADER_OFFSET_MOBILE : HEADER_OFFSET_DESKTOP, width };
};

const useSectionAnchors = (): SectionAnchors =>
    useMemo(() => ({
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

export default function TravelDetails() {
    const { isMobile, headerOffset } = useResponsive();
    const insets = useSafeAreaInsets();
    const [menuOpen, setMenuOpen] = useState(!isMobile);
    const { param } = useLocalSearchParams();
    const slug = Array.isArray(param) ? param[0] : (param ?? '');
    const id = Number(slug);
    const isId = !Number.isNaN(id);

    const [forceOpenKey, setForceOpenKey] = useState<string | null>(null);
    const handleSectionOpen = useCallback((key: string) => setForceOpenKey(key), []);

    useEffect(() => {
        const handler = Platform.OS === 'web'
            ? (e: any) => handleSectionOpen(e?.detail?.key ?? '')
            : (key: string) => handleSectionOpen(key);

        if (Platform.OS === 'web') {
            window.addEventListener('open-section', handler as EventListener);
            return () => window.removeEventListener('open-section', handler as EventListener);
        } else {
            const sub = DeviceEventEmitter.addListener('open-section', handler);
            return () => sub.remove();
        }
    }, [handleSectionOpen]);

    const { data: travel, isLoading, isError } = useQuery<Travel>({
        queryKey: ['travel', slug],
        queryFn: () => (isId ? fetchTravel(id) : fetchTravelBySlug(slug)),
        staleTime: 600_000,
        placeholderData: keepPreviousData,
    });

    const [isSuperuser, setIsSuperuser] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    useEffect(() => {
        let mounted = true;
        AsyncStorage.multiGet(['isSuperuser', 'userId'])
            .then(([[, su], [, uid]]) => { if (mounted) { setIsSuperuser(su === 'true'); setUserId(uid); }})
            .catch((e) => console.error('Failed to load user data:', e));
        return () => { mounted = false; };
    }, []);

    const anchor = useSectionAnchors();
    const scrollRef = useRef<ScrollView>(null);
    useEffect(() => { scrollRef.current?.scrollTo({ y: 0, animated: false }); }, [slug]);

    const scrollTo = useCallback((k: keyof SectionAnchors) => {
        const node = anchor[k]?.current;
        if (!node || !scrollRef.current) return;

        requestAnimationFrame(() => {
            // @ts-ignore
            node.measureLayout(scrollRef.current!.getInnerViewNode(),
                (_x, y) => {
                    scrollRef.current!.scrollTo({ y: Math.max(0, y - headerOffset), animated: true });
                },
                () => {});
        });
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

    const toggleMenu = () => { const n = !menuOpen; setMenuOpen(n); animateMenu(n); };
    const closeMenu  = () => { if (menuOpen) { setMenuOpen(false); animateMenu(false); } };

    useEffect(() => {
        if (!isMobile) { setMenuOpen(true); animateMenu(true); }
        else          { setMenuOpen(false); animateMenu(false); }
    }, [isMobile, animateMenu]);

    // Preload LCP image on web
    const preloadImages = useCallback((images: any[]) => {
        if (Platform.OS === 'web' && images?.[0]?.url) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = `${images[0].url}?v=${Date.parse(images[0].updated_at ?? `${images[0].id}`)}`;
            // @ts-ignore
            link.fetchPriority = 'high';
            document.head.appendChild(link);
        }
    }, []);
    useEffect(() => { if (travel?.gallery) preloadImages(travel.gallery); }, [travel?.gallery, preloadImages]);

    // ленивые секции
    const [nearVisible, setNearVisible] = useState(Platform.OS !== 'web');
    const [popularVisible, setPopularVisible] = useState(Platform.OS !== 'web');
    const [refNear, inNear] = useInView({ rootMargin: '200px', triggerOnce: true });
    const [refPop, inPop]   = useInView({ rootMargin: '200px', triggerOnce: true });
    useEffect(() => {
        if (Platform.OS === 'web') { if (inNear) setNearVisible(true); if (inPop) setPopularVisible(true); }
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
        if (travel?.id) queryClient.prefetchQuery(['nearTravels', travel.id], () => fetchNearTravels(travel.id as number));
    }, [travel?.id, queryClient]);

    // ---------- META via InstantSEO ----------
    const SITE = process.env.EXPO_PUBLIC_SITE_URL || 'https://metravel.by';
    const isFocused = useIsFocused();
    const canonicalUrl = `${SITE}/travels/${slug}`;

    const loadingTitle = 'MeTravel — Путешествие';
    const loadingDesc  = 'Загружаем описание путешествия…';

    const errorTitle = 'MeTravel — Ошибка загрузки';
    const errorDesc  = 'Не удалось загрузить путешествие.';

    const readyTitle = travel?.name ? `${travel.name} — MeTravel` : loadingTitle;
    const readyDesc  = stripToDescription(travel?.description);
    const readyImage = travel?.gallery?.[0]?.url
        ? `${travel.gallery[0].url}?v=${Date.parse(travel.gallery[0].updated_at ?? `${travel.gallery[0].id}`)}`
        : `${SITE}/og-preview.jpg`;

    const headKey = `travel-${slug}`;
    // -----------------------------------------

    // LOADING
    if (isLoading) {
        return (
            <>
                {isFocused && (
                <InstantSEO
                    headKey={headKey}
                    title={loadingTitle}
                    description={loadingDesc}
                    canonical={canonicalUrl}
                    image={`${SITE}/og-preview.jpg`}
                    ogType="article"
                />
                )}
                <View style={styles.center}><ActivityIndicator size="large" /></View>
            </>
        );
    }

    // ERROR
    if (isError || !travel) {
        return (
            <>
                {isFocused && (
                <InstantSEO
                    headKey={headKey}
                    title={errorTitle}
                    description={errorDesc}
                    canonical={canonicalUrl}
                    image={`${SITE}/og-preview.jpg`}
                    ogType="article"
                />
                )}
                <View style={styles.center}><Text>Ошибка загрузки</Text></View>
            </>
        );
    }

    // READY
    return (
        <>
            {isFocused && (
            <InstantSEO
                headKey={headKey}
                title={readyTitle}
                description={readyDesc}
                canonical={canonicalUrl}
                image={readyImage}
                ogType="article"
            />
            )}
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
                                accessibilityRole="button"
                                accessibilityLabel="Открыть меню разделов"
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
                                                        <Slider images={travel.gallery} showArrows={!isMobile} showDots={isMobile} />
                                                    </View>
                                                </View>
                                            </Suspense>
                                        )}

                                        {[
                                            { key: 'description',    ref: anchor.description,    html: travel.description,    title: travel.name },
                                            { key: 'recommendation', ref: anchor.recommendation, html: travel.recommendation, title: 'Рекомендации' },
                                            { key: 'plus',           ref: anchor.plus,           html: travel.plus,           title: 'Плюсы' },
                                            { key: 'minus',          ref: anchor.minus,          html: travel.minus,          title: 'Минусы' },
                                        ].map(({ key, ref, html, title }) =>
                                            html ? (
                                                <Suspense key={key} fallback={<Fallback />}>
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
                                            ) : null,
                                        )}

                                        {travel.youtube_link && (
                                            <View ref={anchor.video} style={styles.sectionContainer}>
                                                <Text style={styles.sectionHeaderText}>Видео</Text>
                                                <View style={{ marginTop: 12 }}>
                                                    <LazyYouTube url={travel.youtube_link} />
                                                </View>
                                            </View>
                                        )}

                                        {Platform.OS === 'web' && travel.travelAddress?.length > 0 && (
                                            <Suspense fallback={<Fallback />}>
                                                <View ref={anchor.excursions} style={styles.sectionContainer}>
                                                    <Text style={styles.sectionHeaderText}>Экскурсии</Text>
                                                    <View style={{ marginTop: 12 }}>
                                                        <BelkrajWidgetComponent
                                                            countryCode={travel.countryCode}
                                                            points={travel.travelAddress}
                                                            collapsedHeight={600}
                                                            expandedHeight={1000}
                                                        />
                                                    </View>
                                                </View>
                                            </Suspense>
                                        )}

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
    scrollContent: { paddingBottom: 40, minHeight: Platform.OS === 'web' ? ('100vh' as any) : undefined },
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

    sectionHeaderText: { fontSize: 16, fontWeight: '600' },

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
