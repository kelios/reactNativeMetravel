import React, { useEffect, useState, useRef, Suspense } from 'react';
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
import { Stack, useLocalSearchParams } from 'expo-router';
import { Travel } from '@/src/types/types';
import IframeRenderer, { iframeModel } from '@native-html/iframe-plugin';
import RenderHTML from 'react-native-render-html';
import { WebView } from 'react-native-webview';
import { Card, Title } from 'react-native-paper';
import Slider from '@/components/Slider';
import PointList from '@/components/PointList';
import { IS_LOCAL_API } from '@env';
import { fetchTravel } from '@/src/api/travels';
import SideBarTravel from '@/components/SideBarTravel';
import NearTravelList from '@/components/NearTravelList';
import PopularTravelList from '@/components/PopularTravelList';

// Убираем асинхронную загрузку карты для улучшенной стабильности
import MapClientSideComponent from '@/components/Map';

const TravelDetails: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { id } = useLocalSearchParams();
  const [travel, setTravel] = useState<Travel | null>(null);
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;

  useEffect(() => {
    setMenuVisible(!isMobile);
  }, [isMobile]);

  const scrollRef = useRef<ScrollView>(null);
  const [menuVisible, setMenuVisible] = useState(!isMobile);
  const [anchors, setAnchors] = useState<{ [key: string]: number }>({});

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetchTravel(Number(id))
        .then((travelData) => {
          setTravel(travelData);
        })
        .catch((error) => {
          console.log('Failed to fetch travel data:', error);
        });
  }, [id]);

  const handleLayout = (key: string) => (event: any) => {
    const layout = event.nativeEvent.layout;
    setAnchors((prev) => ({
      ...prev,
      [key]: layout.y,
    }));
  };

  const handlePress = (key: keyof typeof anchors) => () => {
    if (scrollRef.current && anchors[key] !== undefined) {
      scrollRef.current.scrollTo({ y: anchors[key], animated: true });
    }
  };

  if (!travel) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#935233" />
          <Text style={styles.loadingText}>Загрузка данных...</Text>
        </View>
    );
  }

  const rendersideBar = () => {
    if (menuVisible) {
      return (
          <SideBarTravel
              handlePress={handlePress}
              closeMenu={closeMenu}
              isMobile={isMobile}
              travel={travel}
          />
      );
    }
    return null;
  };

  const isWeb = Platform.OS === 'web';
  const gallery =
      IS_LOCAL_API === 'true'
          ? travel.gallery
          : (travel.gallery || []).map((item) => item?.url);

  const hasGallery = Array.isArray(gallery) && gallery.length > 0;

  const styleHtml = `
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      font-size: 16px;
      color: #333;
      text-align: justify;
    }

    h1, h2, h3 {
      color: #444;
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
      color: #0066cc;
      text-decoration: none;
      border-bottom: 2px solid #0066cc;
      transition: color 0.3s, border-bottom-color 0.3s;
    }

    a:hover {
      color: #004499;
      border-bottom-color: #004499;
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
        {isMounted && (
            <View style={styles.mainContainer}>
              {isMobile && menuVisible && (
                  <Pressable onPress={closeMenu} style={styles.overlay} />
              )}
              {isMobile ? (
                  <View
                      style={[
                        styles.sideMenu,
                        styles.mobileSideMenu,
                        menuVisible && styles.visibleMobileSideMenu,
                      ]}
                  >
                    {rendersideBar()}
                  </View>
              ) : (
                  <View style={[styles.sideMenu, styles.desktopSideMenu]}>
                    {rendersideBar()}
                  </View>
              )}
              <View style={styles.content}>
                {isMobile && !menuVisible && (
                    <TouchableOpacity
                        style={styles.menuButtonContainer}
                        onPress={toggleMenu}
                    >
                      <Text style={styles.linkText}>Меню</Text>
                    </TouchableOpacity>
                )}

                <ScrollView
                    style={styles.container}
                    ref={scrollRef}
                    contentContainerStyle={styles.contentContainer}
                >
                  <Stack.Screen options={{ headerTitle: travel.name }} />
                  <View style={styles.centeredContainer}>
                    {hasGallery && (
                        <Slider images={gallery} onLayout={handleLayout('gallery')} />
                    )}

                    {/* Только если есть описание, оно будет отображаться */}
                    {travel?.description && (
                        <Card style={styles.card}>
                          <Card.Content>
                            <Title>{travel.name}</Title>

                            {Platform.select({
                              web: (
                                  <div
                                      dangerouslySetInnerHTML={{
                                        __html: styleHtml + travel.description,
                                      }}
                                  />
                              ),
                              default: (
                                  <RenderHTML
                                      source={{ html: travel.description }}
                                      contentWidth={width - 50}
                                      customHTMLElementModels={{ iframe: iframeModel }}
                                      WebView={WebView}
                                      tagsStyles={{
                                        p: { marginTop: 15, marginBottom: 0 },
                                        iframe: { height: 500, width: '100%' },
                                      }}
                                  />
                              ),
                            })}
                          </Card.Content>
                        </Card>
                    )}

                    {/* Карта */}
                    {travel?.coordsMeTravel?.length > 0 && (
                        <View style={styles.mapBlock}>
                          <MapClientSideComponent travel={travel} />
                        </View>
                    )}

                    {/* Отображаем список точек если они есть */}
                    {travel?.travelAddress && (
                        <PointList
                            points={travel.travelAddress}
                            onLayout={handleLayout('map')}
                        />
                    )}

                    {/* Отображаем похожие путешествия только если они есть */}
                    {travel?.travelAddress && (
                        <NearTravelList
                            travel={travel}
                            onLayout={handleLayout('near')}
                        />
                    )}

                    {/* Популярные маршруты */}
                    <PopularTravelList onLayout={handleLayout('popular')} />
                  </View>
                </ScrollView>
              </View>
            </View>
        )}
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  mapBlock: {
    width: '100%',
    height: 500,
    marginBottom: 20,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'white',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 900, // Увеличим максимальную ширину
    marginHorizontal: 'auto',
    padding: 20,
  },
  card: {
    width: '100%',
    marginVertical: 20,
    elevation: 5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  sideMenu: {
    padding: 20,
    backgroundColor: '#f4f4f4', // Изменим цвет на более современный
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  mobileSideMenu: {
    width: '100%',
    position: 'absolute',
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
    backgroundColor: 'white',
  },
  menuButtonContainer: {
    width: '100%',
    backgroundColor: '#4CAF50', // Улучшаем стиль кнопки
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  linkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointListContainer: {
    width: '100%',
    marginTop: 20,
  },
});

export default TravelDetails;
