import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  Text,
  Platform,
  findNodeHandle,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Travel } from '@/src/types/types';
import { Card, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTravel, fetchTravelBySlug } from '@/src/api/travels';
import Slider from '@/components/travel/Slider';
import PointList from '@/components/travel/PointList';
import SideBarTravel from '@/components/travel/SideBarTravel';
import NearTravelList from '@/components/travel/NearTravelList';
import PopularTravelList from '@/components/travel/PopularTravelList';
import MapClientSideComponent from '@/components/Map';
import TravelDescription from '@/components/travel/TravelDescription';
import ToggleableMapSection from '@/components/travel/ToggleableMapSection';

const TravelDetails: React.FC = () => {
  const searchParams = useLocalSearchParams();
  const param = searchParams.param;
  const paramValue = typeof param === 'string' ? param : Array.isArray(param) ? param[0] : '';
  const numericId = Number(paramValue);
  const isNumeric = !isNaN(numericId);

  const [travel, setTravel] = useState<Travel | null>(null);
  const { width, height } = useWindowDimensions();
  const isMobile = width <= 768;
  const pageHeight = useMemo(() => height * 0.7, [height]);
  const scrollRef = useRef<ScrollView>(null);

  const [menuVisible, setMenuVisible] = useState(!isMobile);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [storedUserId, setStoredUserId] = useState<string | null>(null);

  const refs = {
    galleryRef: useRef<View>(null),
    videoRef: useRef<View>(null),
    descriptionRef: useRef<View>(null),
    mapRef: useRef<View>(null),
    pointsRef: useRef<View>(null),
    nearRef: useRef<View>(null),
    popularRef: useRef<View>(null),
    recommendationRef: useRef<View>(null),
    plusRef: useRef<View>(null),
    minusRef: useRef<View>(null),
  };

  useEffect(() => {
    const checkSuperuser = async () => {
      const flag = await AsyncStorage.getItem('isSuperuser');
      const uid = await AsyncStorage.getItem('userId');
      setStoredUserId(uid);
      setIsSuperuser(flag === 'true');
    };
    checkSuperuser();
  }, []);

  useEffect(() => {
    setMenuVisible(!isMobile);
  }, [isMobile]);

  const toggleMenu = useCallback(() => setMenuVisible(prev => !prev), []);
  const closeMenu = useCallback(() => setMenuVisible(false), []);

  const scrollToRef = (ref: React.RefObject<View>) => {
    if (Platform.OS === 'web' && ref.current) {
      const el = findNodeHandle(ref.current) as HTMLElement;
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePress = useCallback(
      (ref: React.RefObject<View>) => () => {
        scrollToRef(ref);
        ref.current?.measureLayout(
            scrollRef.current?.getInnerViewNode(),
            (x, y) => scrollRef.current?.scrollTo({ y, animated: true }),
            error => console.warn('Failed to measure layout:', error)
        );
      },
      []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const travelData = isNumeric
            ? await fetchTravel(numericId)
            : await fetchTravelBySlug(paramValue);
        setTravel(travelData);
      } catch (error) {
        console.log('Failed to fetch travel data:', error);
      }
    };
    if (paramValue) fetchData();
  }, [paramValue]);

  const gallery = travel?.gallery;
  const hasGallery = Array.isArray(gallery) && gallery.length > 0;

  if (!travel) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B4F4F" />
          <Text style={styles.loadingText}>Загрузка данных...</Text>
        </View>
    );
  }

  return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.mainContainer}>
          {isMobile && menuVisible && <Pressable onPress={closeMenu} style={styles.overlay} />}

          <View
              style={[
                styles.sideMenu,
                isMobile ? styles.mobileSideMenu : styles.desktopSideMenu,
                isMobile && menuVisible && styles.visibleMobileSideMenu,
              ]}
          >
            <SideBarTravel
                handlePress={handlePress}
                closeMenu={closeMenu}
                isMobile={isMobile}
                travel={travel}
                refs={refs}
                isSuperuser={isSuperuser}
                storedUserId={storedUserId}
            />
          </View>

          <View style={styles.content}>
            {isMobile && !menuVisible && (
                <TouchableOpacity style={styles.menuButtonContainer} onPress={toggleMenu}>
                  <Text style={styles.menuButtonText}>Меню</Text>
                </TouchableOpacity>
            )}

            <ScrollView
                key={paramValue}
                style={styles.scrollView}
                ref={scrollRef}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
            >
              <View
                  style={[
                    styles.contentWrapper,
                    isMobile && styles.contentWrapperMobile,
                  ]}
              >
                {hasGallery && (
                    <View ref={refs.galleryRef} style={styles.card}>
                      <Slider images={gallery} />
                    </View>
                )}

                {travel.youtube_link && (
                    <View ref={refs.videoRef} style={styles.card}>
                      <View style={[styles.videoContainer, { height: pageHeight }]} />
                    </View>
                )}

                {travel.description && (
                    <View ref={refs.descriptionRef} style={styles.card}>
                      <TravelDescription
                        htmlContent={travel.description}
                        title={travel.name}
                        noBox
                        />
                    </View>
                )}

                {travel.recommendation && (
                    <View ref={refs.recommendationRef} style={styles.card}>
                      <TravelDescription htmlContent={travel.recommendation} title="Рекомендации" noBox/>
                    </View>
                )}

                {travel.plus && (
                    <View ref={refs.plusRef} style={styles.card}>
                      <TravelDescription htmlContent={travel.plus} title="Плюсы" noBox/>
                    </View>
                )}

                {travel.minus && (
                    <View ref={refs.minusRef} style={styles.card}>
                      <TravelDescription htmlContent={travel.minus} title="Минусы" noBox/>
                    </View>
                )}

                {travel.coordsMeTravel?.length > 0 && (
                    <View ref={refs.mapRef} style={styles.card}>
                      <ToggleableMapSection>
                        <MapClientSideComponent travel={{ data: travel.travelAddress ?? [] }} />
                      </ToggleableMapSection>
                    </View>
                )}

                {travel.travelAddress && (
                    <View ref={refs.pointsRef} style={styles.card}>
                      <PointList points={travel.travelAddress} />
                    </View>
                )}

                {travel.travelAddress && (
                    <View ref={refs.nearRef} style={styles.card}>
                      <NearTravelList travel={travel} />
                    </View>
                )}

                <View ref={refs.popularRef} style={styles.card}>
                  <PopularTravelList />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f9f8f2',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#f9f8f2',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  contentWrapperMobile: {
    paddingHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333333',
  },
  card: {
    width: '100%',
    marginBottom: 32,
    backgroundColor: 'white',
    borderRadius: 16,
   // padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  sideMenu: {
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  mobileSideMenu: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'white',
    zIndex: 1002,
    top: 0,
    left: 0,
    transform: [{ translateX: -1000 }],
    maxHeight: '85vh',
    overflowY: 'auto',
  },
  visibleMobileSideMenu: {
    transform: [{ translateX: 0 }],
  },
  desktopSideMenu: {
    width: 280,
    maxWidth: 320,
    alignSelf: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  menuButtonContainer: {
    width: '100%',
    backgroundColor: '#2F332E',
    paddingVertical: 10,
    marginBottom: 10,
    alignItems: 'center',
    zIndex: 10000,
    elevation: 5,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1001,
  },
});

export default TravelDetails;
