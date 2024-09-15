import React, { useMemo } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
  Image,
  ScrollView,
} from 'react-native';
import { Card } from 'react-native-paper';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

type Point = {
  id: string;
  travelImageThumbUrl: string;
  address: string;
  coord: string;
  categoryName: string;
};

type PointListProps = {
  points: Point[];
  onLayout?: (event: any) => void;
};

const PointList: React.FC<PointListProps> = ({ points, onLayout }) => {
  const { width } = useWindowDimensions();
  const isLargeScreen = useMemo(() => width > 768, [width]);

  return (
      <ScrollView style={[styles.pointListContainer, isLargeScreen && styles.pointListLargeContainer]} onLayout={onLayout}>
        {points.map((point) => (
            <Card key={point.id} style={[styles.pointItem, isLargeScreen && styles.pointItemLarge]}>
              <View style={[styles.pointContent, isLargeScreen && styles.pointContentLarge]}>
                <Image
                    source={{ uri: point.travelImageThumbUrl }}
                    style={[styles.pointImage, isLargeScreen && styles.pointImageLarge]}
                    resizeMode="cover"
                />
                <View style={[
                  styles.description,
                  isLargeScreen ? styles.descriptionLarge : { marginTop: 10 }
                ]}>
                  <Text style={styles.label}>Координаты места:</Text>
                  <Text>{point.coord}</Text>
                  <Text style={styles.label}>Адрес места:</Text>
                  <Text>{point.address}</Text>
                  <Text style={styles.label}>Категория объекта:</Text>
                  <Text>{point.categoryName}</Text>
                </View>
              </View>
            </Card>
        ))}
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  pointListContainer: {
    flexShrink: 1,
  },
  pointListLargeContainer: {
    marginTop: 20,
    margin: 10,
    padding: 20,
  },
  pointItem: {
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: '#fff',
    padding: wp(2),
  },
  pointItemLarge: {
    flexDirection: 'row',
    padding: wp(3),
  },
  pointContent: {
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 800,
    flexShrink: 1,
  },
  pointContentLarge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ff9f5a',
    borderRadius: 4,
  },
  pointImage: {
    width: wp(25),
    height: wp(25),
    borderRadius: 10,
    marginBottom: 10,
  },
  pointImageLarge: {
    width: wp(20), // Ограничиваем ширину изображения на больших экранах
    height: wp(20),
    marginRight: 15, // Добавляем отступ справа
  },
  description: {
    flex: 1,
    marginLeft: 0,
  },
  descriptionLarge: {
    flex: 1, // Занимает оставшееся пространство
    marginLeft: 15, // Отступ между изображением и текстом
  },
});

export default PointList;
