import React, { useMemo } from 'react'
import {
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
  Image,
} from 'react-native'
import { Card, Title } from 'react-native-paper'

type Point = {
  id: string
  travelImageThumbUrl: string
  address: string
  coord: string
  categoryName: string
}

type PointListProps = {
  points: Point[]
  onLayout?: (event: any) => void
}

const PointList: React.FC<PointListProps> = ({ points, onLayout }) => {
  const windowDimensions = useWindowDimensions()
  const isLargeScreen = useMemo(
    () => windowDimensions.width > 768,
    [windowDimensions],
  )

  const containerStyle = isLargeScreen
    ? styles.pointListContainerLarge
    : styles.pointListContainer
  const itemStyle = isLargeScreen ? styles.pointItemLarge : styles.pointItem

  const pointImageStyle = isLargeScreen
    ? styles.pointImageLarge
    : styles.pointImage

  const pointContentStyle = isLargeScreen
    ? styles.pointContentLarge
    : styles.pointContent

  const descriptionStyle = isLargeScreen
    ? styles.descriptionLarge
    : styles.description

  return (
    <View style={containerStyle} onLayout={onLayout}>
      {points.map((point) => (
        <Card key={point.id} style={itemStyle}>
          <View style={pointContentStyle}>
            <Image
              source={{ uri: point.travelImageThumbUrl }}
              style={pointImageStyle}
            />
            <View style={descriptionStyle}>
              <Text style={styles.label}>Координаты места :</Text>
              <Text>{point.coord}</Text>
              <Text style={styles.label}>Адрес места :</Text>
              <Text>{point.address}</Text>
              <Text style={styles.label}>Категория объекта :</Text>
              <Text>{point.categoryName}</Text>
            </View>
          </View>
        </Card>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  pointListContainer: {
    marginTop: 20,
    flexShrink: 1,
  },
  pointListContainerLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 800,
    flexShrink: 1,
  },
  pointItem: {
    marginBottom: 10,
  },
  pointItemLarge: {
    margin: 10,
    padding: 20,
  },
  pointContent: {
    // flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 800,
    flexShrink: 1,
  },
  pointContentLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 800,
    flexShrink: 1,
  },
  descriptionContainer: {
    marginLeft: 10,
    flexShrink: 1,
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
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  pointImageLarge: {
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
    flexShrink: 1,
  },
})

export default PointList
