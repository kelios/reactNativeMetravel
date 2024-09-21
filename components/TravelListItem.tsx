import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import * as Linking from 'expo-linking';
import { Card, Title, Paragraph, Text } from 'react-native-paper';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useRoute } from '@react-navigation/native';
import { Travel } from '@/src/types/types';

type TravelListItemProps = {
  travel: Travel;
  currentUserId: string;
  onEditPress: (id: string) => void;
  onDeletePress: (id: string) => void;
};

const { width } = Dimensions.get('window');

const TravelListItem = ({
                          travel,
                          currentUserId,
                          onEditPress,
                          onDeletePress,
                        }: TravelListItemProps) => {
  const {
    name,
    slug,
    travel_image_thumb_url,
    id,
    countryName,
    userName,
    countUnicIpView,
  } = travel;

  const route = useRoute();
  const isButtonVisible = route.name === 'metravel';

  const Urltravel = Linking.createURL(`travels/${slug}`, {
    queryParams: { id: id },
  });

  return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => Linking.openURL(Urltravel)} activeOpacity={0.8}>
          <Card style={styles.card}>
            <View style={styles.imageWrapper}>
              <Card.Cover
                  source={{ uri: travel_image_thumb_url }}
                  style={styles.image}
                  resizeMode="cover" // Чтобы изображение адаптировалось, сохраняя пропорции
              />
            </View>
            <Card.Content style={styles.content}>
              <Title numberOfLines={2} style={styles.title}>{name}</Title>
              <Paragraph style={styles.countryText}>{countryName}</Paragraph>
              <Paragraph style={styles.authorText}>
                <Text>Автор - {userName}</Text>
                <Text style={styles.paragraphLeft}>({countUnicIpView} 👀)</Text>
              </Paragraph>

              {isButtonVisible && (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => onEditPress(id)}
                    >
                      <Text style={styles.buttonText}>✎</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => onDeletePress(id)}
                    >
                      <Text style={styles.buttonText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
              )}
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  card: {
    borderRadius: 10,
    elevation: 2,
    width: wp('90%'), // Адаптивная ширина карточки
    maxWidth: 500, // Максимальная ширина
    height: 500,
    marginHorizontal: wp(1.5),
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: 350, // Адаптивная высота блока с изображением
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Чтобы изображение заполняло контейнер
  },
  content: {
    padding: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  countryText: {
    fontSize: 14,
    color: '#6AAAAA',
    marginBottom: 10,
  },
  authorText: {
    fontSize: 13,
    color: '#777',
  },
  paragraphLeft: {
    marginLeft: wp(1.5),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#6AAAAA',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default TravelListItem;
