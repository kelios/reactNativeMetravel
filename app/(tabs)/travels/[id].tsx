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

const MapClientSideComponent = React.lazy(() => import('@/components/Map'));

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
    p {
        margin-top: 0;
        margin-bottom: 1rem;
    }
    p img {
          vertical-align: middle;
          padding: .25rem;
          border: 1px solid #dee2e6;
          border-radius: .25rem;
          max-width: 100%;
          height: auto;
          max-height: 800px;
          margin: 10px auto 20px;
          display: block;
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
                    {travel?.description && (
                        <Card
                            style={styles.card}
                            onLayout={handleLayout('description')}
                        >
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
                                      renderers={{
                                        iframe: IframeRenderer,
                                      }}
                                      customHTMLElementModels={{
                                        iframe: iframeModel,
                                      }}
                                      WebView={WebView}
                                      defaultWebViewProps={{}}
                                      renderersProps={{
                                        iframe: {
                                          scalesPageToFit: true,
                                          webViewProps: {
                                            allowsFullScreen: true,
                                          },
                                        },
                                      }}
                                      tagsStyles={{
                                        p: { marginTop: 15, marginBottom: 0 },
                                        iframe: {
                                          height: 1500,
                                          width: '100%',
                                          overflow: 'hidden',
                                          marginTop: 15,
                                          borderRadius: 5,
                                          marginHorizontal: 0,
                                        },
                                      }}
                                  />
                              ),
                            })}
                          </Card.Content>
                        </Card>
                    )}
                    <View style={styles.mapBlock}>
                      <Suspense fallback={<Text>Загрузка карты...</Text>}>
                        <MapClientSideComponent travel={travel} />
                      </Suspense>
                    </View>

                    {travel?.travelAddress && (
                        <PointList points={travel.travelAddress} onLayout={handleLayout('map')} />
                    )}

                    {travel?.travelAddress && (
                        <NearTravelList
                            travel={travel}
                            onLayout={handleLayout('near')}
                        />
                    )}

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
    maxWidth: 800,
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
    backgroundColor: 'white',
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
    backgroundColor: '#6aaaaa',
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
