import { Travel } from '@/src/types/types'
import React from 'react'
import { View, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { Card, Text } from 'react-native-paper'
import { IS_LOCAL_API } from '@env'

const styles = StyleSheet.create({
  linkButton: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#935233', // Color for the link (iOS blue)
  },
  linkText: {
    color: '#935233', // Color for the link (iOS blue)
    fontSize: 16,
  },
  closeButton: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#935233', // Color for the link (iOS blue)
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  backgroundImage: {
    position: 'absolute', // This will position the image as the background
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  sideMenu: {
    flex: 1,
    padding: 20,
    color: '#935233',
    backgroundColor: 'white',
    position: 'relative', // This is required to position the child Image component
  },
  imageWrapper: {
    width: 200,
    height: 200,
    borderRadius: 200 / 2,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  menu: {
    alignItems: 'center',
  },
})

interface SideBarTravelProps {
  handlePress: (
    section: 'gallery' | 'description' | 'map' | 'near' | 'popular',
  ) => () => void
  closeMenu: () => void
  isMobile: boolean
  travel: Travel
}

const SideBarTravel: React.FC<SideBarTravelProps> = ({
  handlePress,
  closeMenu,
  isMobile,
  travel,
}) => {
  const handlePressUserTavel = () => {
    const url = `/?user_id=` + travel.userIds
    Linking.openURL(url)
  }
  const gallery =
    IS_LOCAL_API === 'true'
      ? travel.gallery
      : (travel.gallery || []).map((item) => item?.url)

  return (
    <View style={styles.sideMenu}>
      {gallery.length > 0 && (
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => {
            handlePress('gallery')()
            isMobile && closeMenu()
          }}
        >
          <Text style={styles.linkText}>Галерея</Text>
        </TouchableOpacity>
      )}

      {travel?.description && (
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => {
            handlePress('description')()
            isMobile && closeMenu()
          }}
        >
          <Text style={styles.linkText}>Описание</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => {
          handlePress('map')()
          isMobile && closeMenu()
        }}
      >
        <Text style={styles.linkText}>Координаты мест</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => {
          handlePress('near')()
          isMobile && closeMenu()
        }}
      >
        <Text style={styles.linkText}>
          Рядом (~60км) можно еще посмотреть...
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => {
          handlePress('popular')()
          isMobile && closeMenu()
        }}
      >
        <Text style={styles.linkText}>Популярные маршруты</Text>
      </TouchableOpacity>

      <View style={styles.menu}>
        <View style={styles.imageWrapper}>
          <Card.Cover
            source={{ uri: travel.travel_image_thumb_small_url }}
            style={styles.image}
          />
        </View>
        <Text>{travel.countUnicIpView} 👀</Text>
        <TouchableOpacity onPress={handlePressUserTavel}>
          <Text style={styles.linkText}>
            Все путешествия {travel?.userName}
          </Text>
        </TouchableOpacity>

        <Text>
          {travel?.year} {travel?.monthName}
        </Text>
        <Text>{travel?.countryName}</Text>
        <Text>{travel?.cityName}</Text>
        {travel?.number_days && (
          <Text> Количество дней - {travel?.number_days}</Text>
        )}
      </View>

      {isMobile && (
        <TouchableOpacity style={styles.closeButton} onPress={closeMenu}>
          <Text style={styles.closeButtonText}>Закрыть</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default SideBarTravel
