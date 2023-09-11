import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
  Platform,
  SafeAreaView,
  Dimensions,
  Pressable,
  TouchableOpacity,
  Text,
} from 'react-native'
import { Button } from 'react-native-elements'
import { Stack, useLocalSearchParams, useGlobalSearchParams } from 'expo-router'
import { Travel } from '@/src/types/types'
import RenderHtml from 'react-native-render-html'
import { Card, Title } from 'react-native-paper'
import Slider from '@/components/Slider'
import Map from '@/components/Map'
import PointList from '@/components/PointList'
import { IS_LOCAL_API } from '@env'
import { fetchTravel } from '@/src/api/travels'
import SideBarTravel from '@/components/SideBarTravel'

interface TravelDetailsProps {
  id: number
}

const TravelDetails: React.FC<TravelDetailsProps> = () => {
  const { id } = useLocalSearchParams()
  const [travel, setTravel] = useState<Travel | null>(null)
  const { width } = useWindowDimensions()
  const isWeb = Platform.OS === 'web'
  const windowWidth = Dimensions.get('window').width
  const isMobile = windowWidth <= 768
  const initMenuVisible = !isMobile

  const scrollRef = useRef<ScrollView>(null)

  const [menuVisible, setMenuVisible] = useState(initMenuVisible) // Состояние видимости меню
  const [anchors, setAnchors] = useState<{ [key: string]: number }>({})

  const toggleMenu = () => {
    setMenuVisible(!menuVisible)
  }

  const closeMenu = () => {
    setMenuVisible(false)
  }

  useEffect(() => {
    fetchTravel(Number(id))
      .then((travelData) => {
        setTravel(travelData)
      })
      .catch((error) => {
        console.error('Failed to fetch travel data:', error)
      })
  }, [id])

  const handleLayout = (key: string) => (event: any) => {
    const layout = event.nativeEvent.layout
    setAnchors((prev) => ({
      ...prev,
      [key]: layout.y,
    }))
  }

  const handlePress = (key: keyof typeof anchors) => () => {
    console.log(anchors[key])
    console.log(scrollRef.current)
    if (scrollRef.current && anchors[key] !== undefined) {
      scrollRef.current.scrollTo({ y: anchors[key], animated: true })
    }
  }

  if (!travel) {
    return <ActivityIndicator />
  }

  const rendersideBar = () => {
    if (menuVisible) {
      return (
        <SideBarTravel
          handlePress={handlePress}
          closeMenu={closeMenu}
          isMobile={isMobile}
        ></SideBarTravel>
      )
    }
    return null
  }

  const gallery =
    IS_LOCAL_API === 'true'
      ? travel.gallery
      : travel.gallery.map((item) => item?.url)

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
              title="Меню"
              style={styles.menuButtonContainer}
              onPress={toggleMenu}
            >
              <Text style={styles.linkText}>Меню</Text>
            </TouchableOpacity>
            //  containerStyle={styles.menuButtonContainer} // Стили контейнера
            // buttonStyle={styles.menuButton} // Стили кнопки
            //  titleStyle={styles.menuButtonText} // Стили текста на кнопке
          )}

          <ScrollView
            style={styles.container}
            ref={scrollRef}
            contentContainerStyle={styles.contentContainer}
          >
            <Stack.Screen options={{ headerTitle: travel.name }} />
            <View style={styles.centeredContainer}>
              <Slider images={gallery} onLayout={handleLayout('gallery')} />
              <Card style={styles.card} onLayout={handleLayout('description')}>
                <Card.Content>
                  <Title>{travel.name}</Title>
                  {travel?.description && (
                    <RenderHtml
                      source={{ html: travel.description }}
                      contentWidth={width - 50}
                    />
                  )}
                </Card.Content>
              </Card>
              <Map travel={travel} />
              <PointList
                points={travel?.travelAddress}
                onLayout={handleLayout('map')}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
    width: '80%',
    backgroundColor: 'white',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 800,
    marginHorizontal: 'auto', // Horizontally center the content
  },
  card: {
    margin: 20,
    elevation: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    maxWidth: 800,
  },

  //боковое меню
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
    // backgroundImage:'/assets/images/media/slider/8.jpg'
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

  applyButton: {
    backgroundColor: '#6aaaaa',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: 'gray',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  menuButtonContainer: {
    width: '100%',
    backgroundColor: '#6aaaaa',
  },
  menuButton: {
    backgroundColor: '#6aaaaa',
  },
  linkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
  },
  menuButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})

export default TravelDetails
