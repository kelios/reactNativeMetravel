import { Travel } from '@/src/types/types';
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { IS_LOCAL_API } from '@env';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#935233',
  },
  linkText: {
    color: '#935233',
    fontSize: 16,
    marginLeft: 10,
  },
  closeButton: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#935233',
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  sideMenu: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  imageWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  menu: {
    alignItems: 'center',
  },
  textContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  viewerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
});

interface SideBarTravelProps {
  handlePress: (
      section: 'gallery' | 'description' | 'map' | 'near' | 'popular',
  ) => () => void;
  closeMenu: () => void;
  isMobile: boolean;
  travel: Travel;
}

const SideBarTravel: React.FC<SideBarTravelProps> = ({
                                                       handlePress,
                                                       closeMenu,
                                                       isMobile,
                                                       travel,
                                                     }) => {
  const handlePressUserTravel = () => {
    const url = `/?user_id=` + travel.userIds;
    Linking.openURL(url);
  };
  const gallery =
      IS_LOCAL_API === 'true'
          ? travel.gallery
          : (travel.gallery || []).map((item) => item?.url);

  return (
      <View style={styles.sideMenu}>
        {gallery.length > 0 && (
            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => {
                  handlePress('gallery')();
                  isMobile && closeMenu();
                }}
            >
              <MaterialIcons name="photo-library" size={20} color="#935233" />
              <Text style={styles.linkText}>Галерея</Text>
            </TouchableOpacity>
        )}

        {travel?.description && (
            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => {
                  handlePress('description')();
                  isMobile && closeMenu();
                }}
            >
              <MaterialIcons name="description" size={20} color="#935233" />
              <Text style={styles.linkText}>Описание</Text>
            </TouchableOpacity>
        )}

        <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              handlePress('map')();
              isMobile && closeMenu();
            }}
        >
          <MaterialIcons name="map" size={20} color="#935233" />
          <Text style={styles.linkText}>Координаты мест</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              handlePress('near')();
              isMobile && closeMenu();
            }}
        >
          <MaterialIcons name="location-on" size={20} color="#935233" />
          <Text style={styles.linkText}>Рядом (~60км) можно еще посмотреть...</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              handlePress('popular')();
              isMobile && closeMenu();
            }}
        >
          <MaterialIcons name="star" size={20} color="#935233" />
          <Text style={styles.linkText}>Популярные маршруты</Text>
        </TouchableOpacity>

        <View style={styles.menu}>
          <View style={styles.imageWrapper}>
            {travel.travel_image_thumb_small_url ? (
                <Image
                    source={{ uri: travel.travel_image_thumb_small_url }}
                    style={styles.image}
                />
            ) : (
                <MaterialIcons name="image" size={100} color="#ccc" />
            )}
          </View>
          <View style={styles.viewerCount}>
            <MaterialIcons name="visibility" size={20} color="#935233" />
            <Text style={{ marginLeft: 5 }}>{travel.countUnicIpView}</Text>
          </View>
          <TouchableOpacity onPress={handlePressUserTravel}>
            <Text style={styles.linkText}>
              Все путешествия {travel?.userName}
            </Text>
          </TouchableOpacity>

          <View style={styles.textContainer}>
            <Text>
              {travel?.year} {travel?.monthName}
            </Text>
            <Text>{travel?.countryName}</Text>
            <Text>{travel?.cityName}</Text>
            {travel?.number_days && (
                <Text> Количество дней - {travel?.number_days}</Text>
            )}
          </View>
        </View>

        {isMobile && (
            <TouchableOpacity style={styles.closeButton} onPress={closeMenu}>
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
        )}
      </View>
  );
};

export default SideBarTravel;
