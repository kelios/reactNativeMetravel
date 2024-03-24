import React, { useMemo } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
  Image,
} from 'react-native';
import { Card } from 'react-native-paper';

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
      <View style={[styles.pointListContainer, isLargeScreen && { marginTop: 20, margin: 10, padding: 20 }]} onLayout={onLayout}>
        {points.map((point) => (
            <Card key={point.id} style={[styles.pointItem, isLargeScreen && styles.pointItemLarge]}>
              <View style={[styles.pointContent, isLargeScreen && styles.pointContentLarge]}>
                <Image
                    source={{ uri: point.travelImageThumbUrl }}
                    style={styles.pointImage}
                />
                <View style={[styles.description, isLargeScreen && styles.descriptionLarge]}>
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
      </View>
  );
};

const styles = StyleSheet.create({
  pointListContainer: {
    flexShrink: 1,
  },
  pointItem: {
    marginBottom: 10,
  },
  pointItemLarge: {
    flexDirection: 'row',
  },
  pointContent: {
    alignItems: 'center',
    maxWidth: 800,
    flexShrink: 1,
  },
  pointContentLarge: {},
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ff9f5a',
    borderRadius: 4,
  },
  pointImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  description: {
    marginLeft: 5,
    flexShrink: 1,
  },
  descriptionLarge: {
    marginLeft: 10,
  },
});

export default PointList;