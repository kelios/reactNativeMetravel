import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Linking,
  Platform,
  useWindowDimensions,
  ScrollView,
  Pressable,
} from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { MapPinned, ChevronUp, ChevronDown } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

type Point = {
  id: string;
  travelImageThumbUrl?: string;
  address: string;
  coord: string;
  categoryName?: string;
};

type PointListProps = {
  points: Point[];
};

const PointList: React.FC<PointListProps> = ({ points }) => {
  const { width } = useWindowDimensions();
  const isMobile = width <= 480;
  const isLargeScreen = width >= 768;
  const isWideScreen = width >= 1024;

  const [showCoords, setShowCoords] = useState(false);

  const handleCopyCoords = useCallback((coordStr: string) => {
    Platform.OS === 'web'
        ? navigator.clipboard.writeText(coordStr)
        : Clipboard.setStringAsync(coordStr);
  }, []);

  const handleSendToTelegram = useCallback((coordStr: string) => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(coordStr)}&text=${encodeURIComponent(`Координаты: ${coordStr}`)}`;
    Linking.openURL(url).catch(console.error);
  }, []);

  const handleOpenMap = useCallback((coordStr: string) => {
    const [latStr, lonStr] = coordStr.split(',').map((s) => s.trim());
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    if (!isNaN(lat) && !isNaN(lon)) {
      const url = `https://maps.google.com/?q=${lat},${lon}`;
      Linking.openURL(url).catch(console.warn);
    }
  }, []);

  const renderCardContent = (point: Point) => (
      <>
        <View style={styles.iconButtons}>
          <View style={styles.iconButton}>
            <IconButton
                icon="content-copy"
                size={18}
                onPress={() => handleCopyCoords(point.coord)}
                iconColor="#fff"
            />
          </View>
          <View style={styles.iconButton}>
            <IconButton
                icon="send"
                size={18}
                onPress={() => handleSendToTelegram(point.coord)}
                iconColor="#fff"
            />
          </View>
          <View style={styles.iconButton}>
            <IconButton
                icon="map-marker"
                size={18}
                onPress={() => handleOpenMap(point.coord)}
                iconColor="#fff"
            />
          </View>
        </View>

        <View style={styles.overlay}>
          <Text style={styles.title} numberOfLines={1}>
            {point.address}
          </Text>
          <TouchableOpacity onPress={() => handleOpenMap(point.coord)}>
            <Text style={styles.coord}>{point.coord}</Text>
          </TouchableOpacity>

          {point.categoryName && (
              <View style={styles.categoryContainer}>
                {point.categoryName.split(',').map((cat, index) => (
                    <View key={index} style={styles.category}>
                      <Text style={styles.categoryText}>{cat.trim()}</Text>
                    </View>
                ))}
              </View>
          )}
        </View>
      </>
  );

  return (
      <View style={styles.wrapper}>
        <Pressable
            onPress={() => setShowCoords((prev) => !prev)}
            style={({ pressed }) => [
              styles.toggleButton,
              pressed && styles.toggleButtonPressed,
            ]}
        >
          <MapPinned size={18} color="#3B2C24" style={{ marginRight: 6 }} />
          <Text style={[styles.toggleText, isMobile && styles.toggleTextMobile]}>
            {showCoords ? 'Скрыть координаты мест' : 'Показать координаты мест'}
          </Text>
          {showCoords ? (
              <ChevronUp size={18} color="#3B2C24" />
          ) : (
              <ChevronDown size={18} color="#3B2C24" />
          )}
        </Pressable>

        <Animated.View
            style={{ overflow: 'hidden' }}
            entering={FadeIn.duration(150)}
        >
          {showCoords && (
              <ScrollView
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={[
                    styles.scrollContainer,
                    isLargeScreen && styles.scrollContainerLarge,
                    isWideScreen && styles.scrollContainerWide,
                  ]}
              >
                {points.map((point, index) => (
                    <Animated.View
                        key={point.id}
                        entering={FadeIn.delay(index * 40)}
                        style={[
                          styles.card,
                          isLargeScreen && styles.cardLarge,
                          isWideScreen && styles.cardWide,
                        ]}
                    >
                      <TouchableOpacity activeOpacity={0.85}>
                        {point.travelImageThumbUrl ? (
                            <ImageBackground
                                source={{ uri: point.travelImageThumbUrl }}
                                style={styles.image}
                                imageStyle={{ borderRadius: 12 }}
                            >
                              {renderCardContent(point)}
                            </ImageBackground>
                        ) : (
                            <View style={[styles.image, styles.noImage]}>
                              {renderCardContent(point)}
                            </View>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                ))}
              </ScrollView>
          )}
        </Animated.View>
      </View>
  );
};

export default PointList;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
    gap: 8,
    marginBottom: 8,
  },
  toggleButtonPressed: {
    backgroundColor: '#f0f0f0',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B2C24',
  },
  toggleTextMobile: {
    fontSize: 14,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  scrollContainerLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  scrollContainerWide: {
    gap: 20,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f3f3',
    elevation: 3,
    flexBasis: '100%',
    maxWidth: '100%',
  },
  cardLarge: {
    flexBasis: '48%',
    maxWidth: '48%',
  },
  cardWide: {
    flexBasis: '31%',
    maxWidth: '31%',
  },
  image: {
    minHeight: 280,
    justifyContent: 'flex-end',
  },
  noImage: {
    backgroundColor: '#ccc',
  },
  iconButtons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    zIndex: 2,
  },
  iconButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 6,
    marginLeft: 4,
  },
  overlay: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  title: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 4,
  },
  coord: {
    color: '#cceeff',
    textDecorationLine: 'underline',
    fontSize: 12,
    marginBottom: 6,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  category: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
