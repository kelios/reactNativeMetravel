/* исправленный TravelDetails с центрированием и видео */
import React, {
  lazy, Suspense, useCallback, useEffect, useRef, useState,
} from 'react';
import {
  ActivityIndicator,
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

const Slider            = lazy(() => import('@/components/travel/Slider'));
const TravelDescription = lazy(() => import('@/components/travel/TravelDescription'));
const PointList         = lazy(() => import('@/components/travel/PointList'));
const NearTravelList    = lazy(() => import('@/components/travel/NearTravelList'));
const PopularTravelList = lazy(() => import('@/components/travel/PopularTravelList'));
const ToggleableMap     = lazy(() => import('@/components/travel/ToggleableMapSection'));
const MapClientSide     = lazy(() => import('@/components/Map'));
const SideBarTravel     = lazy(() => import('@/components/travel/CompactSideBarTravel'));
const WebView = Platform.select({
  native: () => lazy(() => import('react-native-webview').then(m => ({ default: m.WebView }))),
  web:   () => () => null,
})();

const ytId    = (u: string) => u.match(/(?:youtu\.be\/|(?:v=|embed\/))([^?&]+)/)?.[1] || '';
const ytEmbed = (u?: string) => (u ? `https://www.youtube.com/embed/${ytId(u)}?rel=0&playsinline=1&enablejsapi=1` : '');
const Fallback = () => <View style={styles.fallback}><ActivityIndicator size="small" color="#6B4F4F" /></View>;

const SIDE_DESKTOP = 260;
const HEADER_OFFSET_DESKTOP = 72;
const HEADER_OFFSET_MOBILE  = 56;

export default function TravelDetails() {
  const { width } = useWindowDimensions();
  const isMobile  = width <= 768;
  const headerOffset = isMobile ? HEADER_OFFSET_MOBILE : HEADER_OFFSET_DESKTOP;
  const insets    = useSafeAreaInsets();

  const { param } = useLocalSearchParams();
  const slug = Array.isArray(param) ? param[0] : param ?? '';
  const id   = Number(slug);
  const isId = !Number.isNaN(id);

  const { data: travel, isLoading, isError } = useQuery<Travel>({
    queryKey: ['travel', slug],
    queryFn : () => (isId ? fetchTravel(id) : fetchTravelBySlug(slug)),
    staleTime: 600_000,
    placeholderData: keepPreviousData,
  });

  const [isSuperuser, setIsSuperuser] = useState(false);
  const [userId,      setUserId]      = useState<string|null>(null);
  useEffect(() => {
    AsyncStorage.multiGet(['isSuperuser','userId']).then(([[,su],[,uid]])=>{
      setIsSuperuser(su==='true'); setUserId(uid);
    });
  }, []);

  const [menu, setMenu] = useState(!isMobile);
  useEffect(()=>{ setMenu(!isMobile); },[isMobile]);
  const toggleMenu = () => setMenu(v=>!v);
  const closeMenu  = () => setMenu(false);

  const scrollRef = useRef<ScrollView>(null);
  const anchor = {
    gallery       : useRef<View>(null),
    video         : useRef<View>(null),
    description   : useRef<View>(null),
    recommendation: useRef<View>(null),
    plus          : useRef<View>(null),
    minus         : useRef<View>(null),
    map           : useRef<View>(null),
    points        : useRef<View>(null),
    near          : useRef<View>(null),
    popular       : useRef<View>(null),
  } as const;

  const scrollTo = useCallback((k: keyof typeof anchor) => {
    const node = anchor[k]?.current;
    if (!node || !scrollRef.current) return;
    node.measureLayout(
        scrollRef.current.getInnerViewNode(),
        (_x, y) => {
          scrollRef.current!.scrollTo({ y: Math.max(0, y - headerOffset), animated: true });
        },
        () => {},
    );
    if (isMobile) closeMenu();
  }, [headerOffset,isMobile]);

  const [refMap,  inMap]      = useInView({ rootMargin:'200px', triggerOnce:true });
  const [refPts,  inPoints]   = useInView({ rootMargin:'200px', triggerOnce:true });
  const [refNear, inNear]     = useInView({ rootMargin:'200px', triggerOnce:true });
  const [refPop,  inPopular]  = useInView({ rootMargin:'200px', triggerOnce:true });

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#6B4F4F"/></View>;
  if (isError || !travel) return <View style={styles.center}><Text>Ошибка загрузки</Text></View>;

  const descTxt = travel.description?.replace(/<[^>]+>/g,'').slice(0,160) || '';
  const scrollStyle = [styles.scroll, { marginLeft: isMobile ? 0 : SIDE_DESKTOP, alignItems: 'center' }];
  const sidebarStyle = [
    styles.sidebarBase,
    isMobile ? styles.sidebarMobile : styles.sidebarDesktop,
    isMobile && (menu ? styles.sideInMobile : styles.sideOutMobile),
  ];

  return (
      <>
        <Head>
          <title>{travel.name} — metravel.by</title>
          <meta name="description" content={descTxt}/>
          <link rel="canonical" href={`https://metravel.by/travels/${slug}`}/>
        </Head>

        <SafeAreaView style={{ flex:1 }}>
          {isMobile && menu && <Pressable style={styles.overlay} onPress={closeMenu}/>}
          <View style={[styles.root, isMobile && styles.rootMobile]}>
            <View style={sidebarStyle}>
              <Suspense fallback={<Fallback/>}>
                <SideBarTravel
                    travel={travel}
                    isSuperuser={isSuperuser}
                    storedUserId={userId}
                    isMobile={isMobile}
                    refs={anchor}
                    closeMenu={closeMenu}
                    onNavigate={scrollTo}
                />
              </Suspense>
            </View>

            {isMobile && !menu && (
                <TouchableOpacity onPress={toggleMenu} style={[styles.fab,{ top: insets.top+8 }]} hitSlop={12}>
                  <MaterialIcons name="menu" size={20} color="#fff"/>
                </TouchableOpacity>
            )}

            <ScrollView
                ref={scrollRef}
                contentContainerStyle={scrollStyle}
                keyboardShouldPersistTaps="handled"
            >
              <View ref={anchor.gallery}/>
              {!!travel.gallery?.length && (
                  <Suspense fallback={<Fallback/>}>
                    <View style={styles.containerInner}>
                      <View style={styles.card}>
                        <Slider
                            images={travel.gallery}
                            showArrows={!isMobile}
                            showDots={isMobile}
                        />
                      </View>
                    </View>
                  </Suspense>
              )}

              <View ref={anchor.video}/>
              {travel.youtube_link && (
                  <View style={styles.containerInner}>
                    <View style={styles.video}>
                      <YouTubeLazy url={travel.youtube_link}/>
                    </View>
                  </View>
              )}

              {[{ ref: anchor.description, html: travel.description, title: travel.name },
                { ref: anchor.recommendation, html: travel.recommendation, title: 'Рекомендации' },
                { ref: anchor.plus, html: travel.plus, title: 'Плюсы' },
                { ref: anchor.minus, html: travel.minus, title: 'Минусы' },
              ].map(({ ref, html, title }) => html && (
                  <React.Fragment key={title}>
                    <View ref={ref}/>
                    <View style={styles.containerInner}>
                      <View style={styles.card}>
                        <Suspense fallback={<Fallback/>}>
                          <TravelDescription title={title} htmlContent={html} noBox/>
                        </Suspense>
                      </View>
                    </View>
                  </React.Fragment>
              ))}

              <View ref={refMap}/>
              {inMap && travel.coordsMeTravel?.length > 0 && (
                  <>
                    <View ref={anchor.map}/>
                    <View style={styles.containerInner}>
                      <View style={styles.card}>
                        <Suspense fallback={<Fallback/>}>
                          <ToggleableMap>
                            <MapClientSide travel={{ data: travel.travelAddress }}/>
                          </ToggleableMap>
                        </Suspense>
                      </View>
                    </View>
                  </>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </>
  );
}

function YouTubeLazy({ url }: { url: string }) {
  const [play,setPlay] = useState(false);
  const [error,setError] = useState(false);
  const ytUrl = ytEmbed(url);

  if (error) return <View style={styles.ytError}><Text style={styles.ytErrorText}>Не удалось загрузить видео</Text></View>;

  if (Platform.OS==='web') {
    return play ? (
        <iframe
            src={ytUrl}
            width="100%"
            height="100%"
            style={{ border:'none', display:'block' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onError={() => setError(true)}
        />
    ) : (
        <Pressable style={styles.ytStub} onPress={()=>setPlay(true)}>
          <MaterialIcons name="play-circle" size={64} color="#fff"/>
        </Pressable>
    );
  }

  return play ? (
      <Suspense fallback={<Fallback/>}>
        <WebView
            source={{ uri: ytUrl }}
            style={{ flex:1 }}
            onError={() => setError(true)}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
        />
      </Suspense>
  ) : (
      <Pressable style={styles.ytStub} onPress={()=>setPlay(true)}>
        <MaterialIcons name="play-circle" size={64} color="#fff"/>
      </Pressable>
  );
}

const styles = StyleSheet.create({
  root:{ flex:1, flexDirection:'row', backgroundColor:'#f9f8f2' },
  rootMobile:{ flexDirection:'column' },
  sidebarBase:{ backgroundColor:'#fff', paddingVertical:12,
    shadowColor:'#000', shadowOffset:{width:0,height:2},
    shadowOpacity:0.08, shadowRadius:4, elevation:3, zIndex:900 },
  sidebarDesktop:{ width:SIDE_DESKTOP, maxWidth:300 },
  sidebarMobile:{ position:'absolute', left:0, top:0, bottom:0, width:SIDE_DESKTOP, maxWidth:300 },
  sideOutMobile:{ transform:[{ translateX:-SIDE_DESKTOP-20 }] },
  sideInMobile :{ transform:[{ translateX:0 }] },
  overlay:{ ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.35)', zIndex:899 },
  fab:{ position:'absolute', right:14, width:32, height:32, borderRadius:16,
    backgroundColor:'rgba(47,51,46,0.65)', justifyContent:'center', alignItems:'center', zIndex:901 },
  scroll:{ flexGrow:1, paddingBottom:40, paddingHorizontal:16 },
  containerInner: { width: '100%', maxWidth: 1000, alignSelf: 'center' },
  card:{ width:'100%', marginBottom:32, backgroundColor:'#fff',
    borderRadius:16, shadowColor:'#000', shadowOffset:{width:0,height:2},
    shadowOpacity:0.05, shadowRadius:4, elevation:2 },
  video:{ width:'100%', aspectRatio:16/9, borderRadius:12,
    overflow:'hidden', backgroundColor:'#000', marginBottom:24 },
  ytStub:{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#000' },
  ytError: { padding: 24, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  ytErrorText: { color: '#fff', fontSize: 14, textAlign: 'center' },
  center:{ flex:1, justifyContent:'center', alignItems:'center' },
  fallback:{ paddingVertical:40, alignItems:'center' },
});