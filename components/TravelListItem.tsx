import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import * as Linking from 'expo-linking';
import { Card, Title, Paragraph } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { Travel } from '@/src/types/types';

type TravelListItemProps = {
  travel: Travel;
  currentUserId: string;
  onEditPress: (id: string) => void;
  onDeletePress: (id: string) => void;
};

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
        <TouchableOpacity onPress={() => Linking.openURL(Urltravel)} activeOpacity={0.9}>
          <Card style={styles.card}>
            <Card.Cover
                source={{ uri: travel_image_thumb_url }}
                style={styles.image}
            />
            <Card.Content style={styles.content}>
              <Title numberOfLines={2} style={styles.title}>{name}</Title>
              <Paragraph style={styles.countryText}>{countryName}</Paragraph>
              <Paragraph style={styles.authorText}>
                Автор - {userName}{' '}
                <Text style={styles.viewsText}>({countUnicIpView} 👀)</Text>
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

const { width } = Dimensions.get('window');
const cardWidth = width * 0.9 > 500 ? 500 : width * 0.9;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  card: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    backgroundColor: '#fff',
    width: cardWidth,
    height: 550, // Зафиксированная увеличенная высота карточки
  },
  image: {
    height: 350,
  },
  content: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  countryText: {
    fontSize: 16,
    color: '#6AAAAA',
    marginBottom: 5,
  },
  authorText: {
    fontSize: 14,
    color: '#777',
  },
  viewsText: {
    color: '#777',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  editButton: {
    backgroundColor: '#6AAAAA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default TravelListItem;
