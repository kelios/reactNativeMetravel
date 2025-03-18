// TravelDetails.tsx

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  Text, Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Travel } from '@/src/types/types';
import { iframeModel } from '@native-html/iframe-plugin';
import RenderHTML from 'react-native-render-html';
import { WebView } from 'react-native-webview';
import { Card, Title, useTheme } from 'react-native-paper';
import Slider from '@/components/Slider';
import PointList from '@/components/PointList';
import {fetchTravel, fetchTravelBySlug} from '@/src/api/travels';
import SideBarTravel from '@/components/SideBarTravel';
import NearTravelList from '@/components/NearTravelList';
import PopularTravelList from '@/components/PopularTravelList';
import MapClientSideComponent from '@/components/Map';
import AsyncStorage from "@react-native-async-storage/async-storage";
import TravelDescription from "@/components/travel/TravelDescription";

const TravelDetails: React.FC = () => {
  const { param } = useLocalSearchParams();
  const numericId = Number(param);
  const isNumeric = !isNaN(numericId);

  const [travel, setTravel] = useState<Travel | null>(null);
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;

  const [menuVisible, setMenuVisible] = useState(!isMobile);
  const scrollRef = useRef<ScrollView>(null);

  // Рефы для секций
  const galleryRef = useRef<View>(null);
  const videoRef = useRef<View>(null);
  const descriptionRef = useRef<View>(null);
  const mapRef = useRef<View>(null);
  const pointsRef = useRef<View>(null);
  const nearRef = useRef<View>(null);
  const popularRef = useRef<View>(null);

  const theme = useTheme();
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [storedUserId, setStoredUserId] = useState(null);

  useEffect(() => {
    const checkSuperuser = async () => {
      const flag = await AsyncStorage.getItem('isSuperuser');
      const storedUserId = await AsyncStorage.getItem('userId');
      setStoredUserId(storedUserId);
      setIsSuperuser(flag === 'true');
    };
    checkSuperuser();
  }, []);


  useEffect(() => {
    setMenuVisible(!isMobile);
  }, [isMobile]);

  const toggleMenu = useCallback(() => {
    setMenuVisible((prev) => {
      return !prev;
    });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let travelData: Travel;
        if (isNumeric) {
          // Если param — число, грузим по ID
          travelData = await fetchTravel(numericId);
        } else {
          // Иначе грузим по slug
          travelData = await fetchTravelBySlug(param as string);
        }

        setTravel(travelData);
      } catch (error) {
        console.log('Failed to fetch travel data:', error);
      }
    };
    fetchData();
  }, [param]);

  const handlePress = useCallback(
      (ref: React.RefObject<View>) => () => {
        ref.current?.measureLayout(
            scrollRef.current?.getInnerViewNode(),
            (x, y) => {
                scrollRef.current?.scrollTo({ y: y, animated: true });
            },
            (error) => {
              console.warn('Failed to measure layout:', error);
            }
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

  const gallery =
      process.env.EXPO_PUBLIC_IS_LOCAL_API === 'true'
          ? travel.gallery
          : (travel.gallery || []).map((item) => item?.url);

  const hasGallery = Array.isArray(gallery) && gallery?.length > 0;

  const convertYouTubeLink = (url: string): string | null => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*v%3D))([^?&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.mainContainer}>
          {isMobile && menuVisible && (
              <Pressable
                  onPress={closeMenu}
                  style={styles.overlay}
                  accessibilityRole="button"
                  accessibilityLabel="Закрыть меню"
              />
          )}
          {isMobile ? (
              <View
                  style={[
                    styles.sideMenu,
                    styles.mobileSideMenu,
                    menuVisible && styles.visibleMobileSideMenu,
                  ]}
              >
                {menuVisible && (
                    <SideBarTravel
                        handlePress={handlePress}
                        closeMenu={closeMenu}
                        isMobile={isMobile}
                        travel={travel}
                        refs={{
                          galleryRef,
                          videoRef,
                          descriptionRef,
                          mapRef,
                          pointsRef,
                          nearRef,
                          popularRef,
                        }}
                        isSuperuser={isSuperuser}
                        storedUserId = {storedUserId}
                    />
                )}
              </View>
          ) : (
              <View style={[styles.sideMenu, styles.desktopSideMenu]}>
                <SideBarTravel
                    handlePress={handlePress}
                    closeMenu={closeMenu}
                    isMobile={isMobile}
                    travel={travel}
                    refs={{
                      galleryRef,
                      videoRef,
                      descriptionRef,
                      mapRef,
                      pointsRef,
                      nearRef,
                      popularRef,
                    }}
                    isSuperuser={isSuperuser}
                    storedUserId = {storedUserId}
                />
              </View>
          )}
          <View style={styles.content}>
            {isMobile && !menuVisible && (
                <TouchableOpacity
                    style={styles.menuButtonContainer}
                    onPress={toggleMenu}
                    accessibilityRole="button"
                    accessibilityLabel="Открыть меню"
                >
                  <Text style={styles.menuButtonText}>Меню</Text>
                </TouchableOpacity>
            )}

            <ScrollView
                key={param}
                style={styles.scrollView}
                ref={scrollRef}
                contentContainerStyle={styles.contentContainer}
                accessibilityLabel="Основной контент"
                keyboardShouldPersistTaps="handled"
            >
              <View style={styles.centeredContainer}>
                {hasGallery && (
                    <View ref={galleryRef}>
                      <Slider images={gallery} />
                    </View>
                )}

                {/* youtube_link с рефом */}
                  {travel.youtube_link && (
                      <Card style={styles.card}>
                      <View ref={videoRef} style={[styles.videoContainer, { height: width * 0.3 }]}>
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

                {/* Описание */}
                {travel.description ? (
                    <View ref={descriptionRef}>
                      <Card style={styles.card}>
                      <TravelDescription htmlContent={travel.description} title = {travel.name} />
                      </Card>
                    </View>
                ) : null}

                {/* Карта с рефом */}
                {travel.coordsMeTravel?.length > 0 && (
                    <View style={styles.mapBlock} ref={mapRef}>
                      <MapClientSideComponent     travel={{ data: travel?.travelAddress || [] }}/>
                    </View>
                )}

                {/* Список точек */}
                {travel.travelAddress && (
                    <View ref={pointsRef} style={styles.pointListContainer}>
                      <PointList points={travel.travelAddress} />
                    </View>
                )}

                {/* Близкие путешествия */}
                {travel.travelAddress && (
                    <View ref={nearRef} style={styles.pointListContainer}>
                      <NearTravelList travel={travel} />
                    </View>
                )}

                {/* Популярные маршруты */}
                <View ref={popularRef} style={styles.pointListContainer}>
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
});

export default TravelDetails;
