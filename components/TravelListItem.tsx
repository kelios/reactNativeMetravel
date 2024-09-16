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
              />
            </View>
            <Card.Content>
              <Title>{name}</Title>
              <Paragraph>{countryName}</Paragraph>
              <Paragraph>
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
    alignItems: 'center', // Центрирование по горизонтали
    justifyContent: 'center', // Центрирование по вертикали
    paddingVertical: 20,
  },
  card: {
    borderRadius: 10,
    elevation: 2,
    padding: wp(1.5),
    marginHorizontal: wp(1.5),
    maxWidth: 600,
    overflow: 'hidden', // Чтобы углы обрезались
  },
  imageWrapper: {
    flex: width < 600 ? 0 : 1,
    overflow: 'hidden',
    alignItems: 'center',
  },
  image: {
    aspectRatio: 1,
    width: '100%',
    height: width < 600 ? wp(80) : 600, // Адаптивная высота
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
