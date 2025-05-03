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
  Alert,
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
  description?: string;
};

type PointListProps = {
  points: Point[];
};

const PointCardContent = ({
                            point,
                            expanded,
                            handleCopyCoords,
                            handleSendToTelegram,
                            handleOpenMap,
                            responsive,
                          }: {
  point: Point;
  expanded: boolean;
  handleCopyCoords: (coordStr: string) => void;
  handleSendToTelegram: (coordStr: string) => void;
  handleOpenMap: (coordStr: string) => void;
  responsive: any;
}) => (
    <>
      <View style={styles.iconButtons}>
        <View style={styles.iconButton}>
          <IconButton icon="content-copy" size={18} onPress={() => handleCopyCoords(point.coord)} iconColor="#fff" />
        </View>
        <View style={styles.iconButton}>
          <IconButton icon="send" size={18} onPress={() => handleSendToTelegram(point.coord)} iconColor="#fff" />
        </View>
        <View style={styles.iconButton}>
          <IconButton icon="map-marker" size={18} onPress={() => handleOpenMap(point.coord)} iconColor="#fff" />
        </View>
      </View>

      <View style={styles.overlay}>
        <Text style={[styles.title, responsive.title]} numberOfLines={2}>
          {point.address}
        </Text>
        <TouchableOpacity onPress={() => handleOpenMap(point.coord)} activeOpacity={0.7}>
          <Text style={[styles.coord, responsive.coord]}>{point.coord}</Text>
        </TouchableOpacity>

        {point.description && expanded && (
            <Text style={styles.description}>{point.description}</Text>
        )}

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

const PointList: React.FC<PointListProps> = ({ points }) => {
  const { width } = useWindowDimensions();
  const isMobile = width <= 480;

  const [showCoords, setShowCoords] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleCopyCoords = useCallback(async (coordStr: string) => {
    try {
      await (Platform.OS === 'web'
          ? navigator.clipboard.writeText(coordStr)
          : Clipboard.setStringAsync(coordStr));
      Alert.alert('Скопировано', 'Координаты скопированы в буфер обмена');
    } catch (error) {
      console.error('Ошибка копирования:', error);
      Alert.alert('Ошибка', 'Не удалось скопировать координаты');
    }
  }, []);

  const handleSendToTelegram = useCallback((coordStr: string) => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(coordStr)}&text=${encodeURIComponent(`Координаты: ${coordStr}`)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Ошибка', 'Не удалось открыть Telegram');
    });
  }, []);

  const handleOpenMap = useCallback((coordStr: string) => {
    const [latStr, lonStr] = coordStr.split(',').map((s) => s.trim());
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      Alert.alert('Ошибка', 'Некорректные координаты');
      return;
    }

    const url = Platform.select({
      ios: `maps://?q=${lat},${lon}`,
      android: `geo:${lat},${lon}?q=${lat},${lon}`,
      default: `https://maps.google.com/?q=${lat},${lon}`,
    });

    Linking.openURL(url).catch(() => {
      Alert.alert('Ошибка', 'Не удалось открыть карты');
    });
  }, []);

  const toggleCardExpand = useCallback((id: string) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  }, []);

  const getCardStyle = (width: number) => {
    if (width >= 1024) {
      return { flexBasis: '31%', maxWidth: '31%' };
    } else if (width >= 600) {
      return { flexBasis: '48%', maxWidth: '48%' };
    } else {
      return { flexBasis: '100%', maxWidth: '100%' };
    }
  };

  const getResponsiveStyles = (width: number) => {
    let minHeight = 260; // увеличенная высота
    let titleSize = 15;
    let coordSize = 13;

    if (width >= 1024) {
      minHeight = 300;
      titleSize = 17;
      coordSize = 14;
    } else if (width >= 600) {
      minHeight = 280;
      titleSize = 16;
      coordSize = 13.5;
    }

    return {
      image: { minHeight, flex: 1 },
      title: { fontSize: titleSize },
      coord: { fontSize: coordSize },
    };
  };

  const responsive = getResponsiveStyles(width);

  return (
      <View style={styles.wrapper}>
        <Pressable
            onPress={() => setShowCoords((prev) => !prev)}
            style={({ pressed }) => [
              styles.toggleButton,
              pressed && styles.toggleButtonPressed,
            ]}
            accessibilityLabel={showCoords ? 'Скрыть координаты' : 'Показать координаты'}
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

        {showCoords && (
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.cardsContainer}
                showsVerticalScrollIndicator={false}
            >
              {points.map((point, index) => (
                  <Animated.View
                      key={point.id}
                      entering={FadeIn.delay(index * 30)}
                      style={[styles.card, getCardStyle(width)]}
                  >
                    <Pressable
                        onPress={() => toggleCardExpand(point.id)}
                        onLongPress={() => handleOpenMap(point.coord)}
                        delayLongPress={500}
                        style={{ flex: 1 }}
                    >
                      {point.travelImageThumbUrl ? (
                          <ImageBackground
                              source={{ uri: point.travelImageThumbUrl }}
                              style={[styles.image, responsive.image]}
                              imageStyle={{ borderRadius: 12 }}
                              resizeMode="cover"
                          >
                            <PointCardContent
                                point={point}
                                expanded={expandedCard === point.id}
                                handleCopyCoords={handleCopyCoords}
                                handleSendToTelegram={handleSendToTelegram}
                                handleOpenMap={handleOpenMap}
                                responsive={responsive}
                            />
                          </ImageBackground>
                      ) : (
                          <View style={[styles.image, styles.noImage, responsive.image]}>
                            <PointCardContent
                                point={point}
                                expanded={expandedCard === point.id}
                                handleCopyCoords={handleCopyCoords}
                                handleSendToTelegram={handleSendToTelegram}
                                handleOpenMap={handleOpenMap}
                                responsive={responsive}
                            />
                          </View>
                      )}
                    </Pressable>
                  </Animated.View>
              ))}
            </ScrollView>
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginTop: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toggleButtonPressed: {
    backgroundColor: '#f5f5f5',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B2C24',
    fontFamily: 'Roboto-Medium',
  },
  toggleTextMobile: {
    fontSize: 14,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 40,
    gap: 12,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f3f3',
    elevation: 3,
    flexGrow: 1,
    flexShrink: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    display: 'flex',
  },
  image: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  noImage: {
    backgroundColor: '#e0e0e0',
  },
  iconButtons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 4,
  },
  iconButton: {
    marginHorizontal: 2,
  },
  overlay: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  title: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 6,
    fontFamily: 'Roboto-Medium',
  },
  coord: {
    color: '#cceeff',
    textDecorationLine: 'underline',
    marginBottom: 8,
    fontFamily: 'Roboto-Regular',
  },
  description: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 8,
    fontFamily: 'Roboto-Regular',
    lineHeight: 18,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
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
    fontFamily: 'Roboto-Medium',
  },
});

export default PointList;
