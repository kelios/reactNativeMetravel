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
      <ScrollView
          style={[styles.pointListContainer, isLargeScreen && styles.pointListLargeContainer]}
          onLayout={onLayout}
      >
        {points.map((point) => (
            <Card key={point.id} style={[styles.pointItem, isLargeScreen && styles.pointItemLarge]}>
              <View style={[styles.pointContent, isLargeScreen && styles.pointContentLarge]}>
                {point.travelImageThumbUrl && (
                    <Image
                        source={{ uri: point.travelImageThumbUrl }}
                        style={[styles.pointImage, isLargeScreen && styles.pointImageLarge]}
                        resizeMode="cover"
                    />
                )}
                <View style={styles.description}>
                  <Text style={styles.label}>Координаты места:</Text>
                  <Text style={styles.text}>{point.coord}</Text>
                  <Text style={styles.label}>Адрес места:</Text>
                  <Text style={styles.text}>{point.address}</Text>
                  <Text style={styles.label}>Категория объекта:</Text>
                  <Text style={styles.text}>{point.categoryName}</Text>
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
    paddingHorizontal: wp(2),
  },
  pointListLargeContainer: {
    marginTop: 20,
    paddingHorizontal: wp(4),
  },
  pointItem: {
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: '#fff',
    padding: wp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pointItemLarge: {
    flexDirection: 'row',
    padding: wp(3),
  },
  pointContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexShrink: 1,
  },
  pointContentLarge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#00796b',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  pointImage: {
    width: wp(25),
    height: wp(25),
    borderRadius: 10,
    marginBottom: 10,
  },
  pointImageLarge: {
    width: wp(20),
    height: wp(20),
    marginRight: 15,
  },
  description: {
    flex: 1,
    marginTop: 10,
  },
});

export default PointList;
