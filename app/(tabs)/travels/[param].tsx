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
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Travel } from '@/src/types/types';
import RenderHTML from 'react-native-render-html';
import { WebView } from 'react-native-webview';
import { Card, useTheme } from 'react-native-paper';
import Slider from '@/components/Slider';
import PointList from '@/components/PointList';
import { fetchTravel, fetchTravelBySlug } from '@/src/api/travels';
import SideBarTravel from '@/components/SideBarTravel';
import NearTravelList from '@/components/NearTravelList';
import PopularTravelList from '@/components/PopularTravelList';
import MapClientSideComponent from '@/components/Map';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TravelDescription from '@/components/travel/TravelDescription';

const TravelDetails: React.FC = () => {
  const searchParams = useLocalSearchParams();
  const paramValue = useMemo(() => {
    const p = searchParams.param;
    if (typeof p === 'string') return p;
    if (Array.isArray(p)) return p[0];
    return '';
  }, [searchParams]);

  const numericId = Number(paramValue);
  const isNumeric = !isNaN(numericId);

  const [travel, setTravel] = useState<Travel | null>(null);
  const { width, height } = useWindowDimensions();
  const isMobile = width <= 768;
  const pageHeight = useMemo(() => height * 0.7, [height]);

  const [menuVisible, setMenuVisible] = useState(!isMobile);
  const scrollRef = useRef<ScrollView>(null);

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

  const theme = useTheme();
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [storedUserId, setStoredUserId] = useState<string | null>(null);

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

  const toggleMenu = useCallback(() => setMenuVisible((prev) => !prev), []);
  const closeMenu = useCallback(() => setMenuVisible(false), []);

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

  const handlePress = useCallback(
      (ref: React.RefObject<View>) => () => {
        ref.current?.measureLayout(
            scrollRef.current?.getInnerViewNode(),
            (x, y) => scrollRef.current?.scrollTo({ y, animated: true }),
            (error) => console.warn('Failed to measure layout:', error)
        );
      },
      []
  );

  if (!travel) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B4F4F" />
          <Text style={styles.loadingText}>Загрузка данных...</Text>
        </View>
    );
  }

  const gallery = travel.gallery;
  const hasGallery = Array.isArray(gallery) && gallery.length > 0;

  const convertYouTubeLink = (url: string): string | null => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*v%3D))([^?&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.mainContainer}>
          {isMobile && menuVisible && <Pressable onPress={closeMenu} style={styles.overlay} />}

          {isMobile ? (
              <View
                  style={[
                    styles.sideMenu,
                    styles.mobileSideMenu,
                    menuVisible && styles.visibleMobileSideMenu,
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
          ) : (
              <View style={[styles.sideMenu, styles.desktopSideMenu]}>
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
          )}

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
              <View style={styles.centeredContainer}>
                {hasGallery && (
                    <View ref={refs.galleryRef}>
                      <Slider images={gallery} />
                    </View>
                )}

                {travel.youtube_link && (
                    <Card style={styles.card}>
                      <View ref={refs.videoRef} style={[styles.videoContainer, { height: pageHeight }]}>
                        {Platform.OS === 'web' ? (
                            <iframe
                                src={convertYouTubeLink(travel.youtube_link)}
                                width="100%"
                                height="100%"
                                style={{ border: 'none' }}
                            />
                        ) : (
                            <WebView source={{ uri: convertYouTubeLink(travel.youtube_link) }} style={{ flex: 1 }} />
                        )}
                      </View>
                    </Card>
                )}

                {travel.description && (
                    <View ref={refs.descriptionRef} style={styles.descriptionContainer}>
                      <TravelDescription htmlContent={travel.description} title={travel.name} />
                    </View>
                )}

                {travel.recommendation && (
                    <View ref={refs.recommendationRef} style={styles.descriptionContainer}>
                      <TravelDescription htmlContent={travel.recommendation} title="Рекомендации" />
                    </View>
                )}

                {travel.plus && (
                    <View ref={refs.plusRef} style={styles.descriptionContainer}>
                      <TravelDescription htmlContent={travel.plus} title="Плюсы" />
                    </View>
                )}

                {travel.minus && (
                    <View ref={refs.minusRef} style={styles.descriptionContainer}>
                      <TravelDescription htmlContent={travel.minus} title="Минусы" />
                    </View>
                )}

                {travel.coordsMeTravel?.length > 0 && (
                    <View ref={refs.mapRef} style={styles.mapBlock}>
                      <MapClientSideComponent travel={{ data: travel.travelAddress ?? [] }} />
                    </View>
                )}

                {travel.travelAddress && (
                    <View ref={refs.pointsRef} style={styles.pointListContainer}>
                      <PointList points={travel.travelAddress} />
                    </View>
                )}

                {travel.travelAddress && (
                    <View ref={refs.nearRef} style={styles.pointListContainer}>
                      <NearTravelList travel={travel} />
                    </View>
                )}

                <View ref={refs.popularRef} style={styles.pointListContainer}>
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
    backgroundColor: '#f4f4f4',
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
  mapBlock: {
    width: '100%',
    height: 500,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  centeredContainer: {
    padding: 20,
  },
  card: {
    width: '100%',
    marginVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Полупрозрачный фон
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    shadowColor: 'rgba(255, 255, 255, 0.6)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6B4F4F',
    marginBottom: 10,
    fontFamily: 'Georgia',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  sideMenu: {
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Поднимаем выше других элементов
  },
  mobileSideMenu: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'white',
    zIndex: 1002, // Должно быть выше остального контента
    elevation: 5, // Тень на Android
    top: 0,
    left: 0,
    transform: [{ translateX: -1000 }], // По умолчанию скрыто

    width: '100%', // Используется для мобильной версии
    maxHeight: '85vh', // Ограничиваем высоту
    overflowY: 'auto',  // Добавляем прокрутку
    zIndex: 1001, // Поднимаем выше других элементов
  },
  visibleMobileSideMenu: {
    transform: [{ translateX: 0 }], // Показываем при нажатии
  },
  desktopSideMenu: {
    width: 300,
    backgroundColor: '#fff',
  },
  menuButtonContainer: {
    width: '100%',
    backgroundColor: '#6B4F4F', // Цвет фона кнопки
    paddingVertical: 10,
    marginBottom: 10,
    alignItems: 'center',
    zIndex: 10000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    marginLeft: 10, // Отступ между иконкой и текстом
  },
  linkText: {
    color: '#007BFF',
    fontSize: 16,
    marginLeft: 15,
    fontFamily: 'Georgia',
  },
  pointListContainer: {
    width: '100%',
    marginTop: 20,
  },
  imageContainer: {
    width: '50%',
    padding: 10,
    alignSelf: 'flex-start',
  },
    videoContainer: {
            width: '100%',
            maxWidth: '60vw', // Адаптивность, ограничение ширины на больших экранах
            height: 'auto', // Позволяет сохранять пропорции
            aspectRatio: 16 / 9, // Поддержка 16:9
            alignSelf: 'center', // Центрирование
            marginVertical: 20, // Отступы сверху и снизу
            borderRadius: 10, // Закругленные углы
            overflow: 'hidden',
            backgroundColor: '#000', // Фон, если видео не загрузилось
        },
  descriptionContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  }
});

export default TravelDetails;
