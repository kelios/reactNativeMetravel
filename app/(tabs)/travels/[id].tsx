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
  Text,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Travel } from '@/src/types/types';
import { iframeModel } from '@native-html/iframe-plugin';
import RenderHTML from 'react-native-render-html';
import { WebView } from 'react-native-webview';
import { Card, Title, useTheme } from 'react-native-paper';
import Slider from '@/components/Slider';
import PointList from '@/components/PointList';
import { fetchTravel } from '@/src/api/travels';
import SideBarTravel from '@/components/SideBarTravel';
import NearTravelList from '@/components/NearTravelList';
import PopularTravelList from '@/components/PopularTravelList';
import MapClientSideComponent from '@/components/Map';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Импорт иконок

const TravelDetails: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [travel, setTravel] = useState<Travel | null>(null);
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;

  const [menuVisible, setMenuVisible] = useState(!isMobile);
  const scrollRef = useRef<ScrollView>(null);

  // Рефы для секций
  const galleryRef = useRef<View>(null);
  const descriptionRef = useRef<View>(null);
  const mapRef = useRef<View>(null);
  const pointsRef = useRef<View>(null);
  const nearRef = useRef<View>(null);
  const popularRef = useRef<View>(null);

  const theme = useTheme();

  useEffect(() => {
    console.log(`isMobile: ${isMobile}, menuVisible: ${menuVisible}`);
    setMenuVisible(!isMobile);
  }, [isMobile]);

  const toggleMenu = useCallback(() => {
    setMenuVisible((prev) => {
      console.log(`Toggle menu: ${!prev}`);
      return !prev;
    });
  }, []);

  const closeMenu = useCallback(() => {
    console.log('Close menu');
    setMenuVisible(false);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const travelData = await fetchTravel(Number(id));
        setTravel(travelData);
      } catch (error) {
        console.log('Failed to fetch travel data:', error);
      }
    };
    fetchData();
  }, [id]);

  const handlePress = useCallback(
      (ref: React.RefObject<View>) => () => {
        ref.current?.measureLayout(
            scrollRef.current?.getInnerViewNode(),
            (x, y) => {
              console.log(`Scrolling to y: ${y}`);
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

  const hasGallery = Array.isArray(gallery) && gallery.length > 0;

  const styleHtml = `
  <style>
    body {
      font-family: 'Georgia', serif;
      line-height: 1.6;
      font-size: 16px;
      color: #555555;
      text-align: justify;
    }

    h1, h2, h3 {
      color: #555555;
      font-weight: bold;
      margin-bottom: 1rem;
      text-align: left;
    }

    p {
      margin: 1.5rem 0;
      line-height: 1.7;
      font-size: 18px;
    }

    img {
      display: block;
      margin: 20px auto;
      padding: 8px;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.1);
      max-width: 100%;
      height: auto;
    }

    a {
      color: #007BFF;
      text-decoration: none;
      border-bottom: 2px solid #007BFF;
      transition: color 0.3s, border-bottom-color 0.3s;
    }

    a:hover {
      color: #0056b3;
      border-bottom-color: #0056b3;
    }

    p, a, h1, h2, h3 {
      text-align: justify;
    }

    iframe {
      width: 100%;
      height: 500px;
      border-radius: 12px;
      border: none;
      margin-top: 20px;
    }

    ul, ol {
      padding-left: 20px;
      margin: 1.5rem 0;
    }

    li {
      margin-bottom: 0.5rem;
    }
  </style>`;

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
                          descriptionRef,
                          mapRef,
                          pointsRef,
                          nearRef,
                          popularRef,
                        }}
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
                      descriptionRef,
                      mapRef,
                      pointsRef,
                      nearRef,
                      popularRef,
                    }}
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

                {/* Описание с рефом */}
                {travel.description ? (
                    <View ref={descriptionRef}>
                      <Card style={styles.card}>
                        <Card.Content>
                          <Title style={styles.cardTitle}>{travel.name}</Title>

                          <RenderHTML
                              source={{ html: styleHtml + travel.description }}
                              contentWidth={width - 40}
                              customHTMLElementModels={{ iframe: iframeModel }}
                              WebView={WebView}
                              baseStyle={{ fontFamily: 'Georgia', color: '#555555' }}
                              tagsStyles={{
                                p: { marginTop: 15, marginBottom: 0 },
                                iframe: { height: 500, width: '100%' },
                                h1: { fontFamily: 'Georgia', color: '#555555' },
                                h2: { fontFamily: 'Georgia', color: '#555555' },
                                h3: { fontFamily: 'Georgia', color: '#555555' },
                                a: { fontFamily: 'Georgia', color: '#007BFF' },
                              }}
                          />
                        </Card.Content>
                      </Card>
                    </View>
                ) : null}

                {/* Карта с рефом */}
                {travel.coordsMeTravel?.length > 0 && (
                    <View style={styles.mapBlock} ref={mapRef}>
                      <MapClientSideComponent travel={travel} />
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
    elevation: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    elevation: 5,
  },
  mobileSideMenu: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'white',
    zIndex: 999,
    elevation: 2,
    top: 0,
    left: 0,
    transform: [{ translateX: -1000 }],
  },
  visibleMobileSideMenu: {
    transform: [{ translateX: 0 }],
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
});

export default TravelDetails;
