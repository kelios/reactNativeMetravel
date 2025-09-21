// components/travel/PointList.tsx
import React, { useState, useCallback, useMemo } from 'react';
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
  Text,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { MapPinned, ChevronUp, ChevronDown } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

type Point = {
  id: string;
  travelImageThumbUrl?: string;
  updated_at?: string;
  address: string;
  coord: string; // "lat,lon"
  categoryName?: string; // "cat1, cat2"
  description?: string;
};

type PointListProps = {
  points: Point[];
};

type Responsive = {
  image: { minHeight: number; flex: number };
  title: { fontSize: number };
  coord: { fontSize: number };
};

const getImageWithVersion = (url?: string, updatedAt?: string) => {
  if (!url) return undefined;
  if (!updatedAt) return url;
  const ts = Date.parse(updatedAt);
  return Number.isFinite(ts) ? `${url}?v=${ts}` : url;
};

const parseCoord = (coordStr: string): { lat: number; lon: number } | null => {
  if (!coordStr) return null;
  // поддержим варианты: "lat,lon", "lat ; lon", "lat lon"
  const cleaned = coordStr.replace(/;/g, ',').replace(/\s+/g, '');
  const [latStr, lonStr] = cleaned.split(',').map((s) => s.trim());
  const lat = Number(latStr);
  const lon = Number(lonStr);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
};

const openExternal = async (url: string) => {
  try {
    const can = await Linking.canOpenURL(url);
    if (can) await Linking.openURL(url);
    else throw new Error('cannot open');
  } catch {
    Alert.alert('Ошибка', 'Не удалось открыть ссылку');
  }
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
  responsive: Responsive;
}) => (
    <>
      <View style={styles.iconButtons}>
        <View style={styles.iconButton}>
          <IconButton
              icon="content-copy"
              size={18}
              onPress={() => handleCopyCoords(point.coord)}
              iconColor="#fff"
              accessibilityLabel="Скопировать координаты"
          />
        </View>
        <View style={styles.iconButton}>
          <IconButton
              icon="send"
              size={18}
              onPress={() => handleSendToTelegram(point.coord)}
              iconColor="#fff"
              accessibilityLabel="Отправить координаты в Telegram"
          />
        </View>
        <View style={styles.iconButton}>
          <IconButton
              icon="map-marker"
              size={18}
              onPress={() => handleOpenMap(point.coord)}
              iconColor="#fff"
              accessibilityLabel="Открыть на карте"
          />
        </View>
      </View>

      <View style={styles.overlay} pointerEvents="box-none">
        <Text style={[styles.title, responsive.title]} numberOfLines={2}>
          {point.address}
        </Text>

        <TouchableOpacity onPress={() => handleOpenMap(point.coord)} activeOpacity={0.7}>
          <Text style={[styles.coord, responsive.coord]} selectable accessibilityHint="Открыть место на карте">
            {point.coord}
          </Text>
        </TouchableOpacity>

        {point.description && expanded ? (
            <Text style={styles.description}>{point.description}</Text>
        ) : null}

        {point.categoryName ? (
            <View style={styles.categoryContainer}>
              {point.categoryName.split(',').map((cat, index) => (
                  <View key={`${point.id}-cat-${index}`} style={styles.category}>
                    <Text style={styles.categoryText}>{cat.trim()}</Text>
                  </View>
              ))}
            </View>
        ) : null}
      </View>
    </>
);

const PointList: React.FC<PointListProps> = ({ points }) => {
  const safePoints = Array.isArray(points) ? points : [];
  const { width } = useWindowDimensions();
  const isMobile = width <= 480;

  const [showCoords, setShowCoords] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleCopyCoords = useCallback(async (coordStr: string) => {
    try {
      if (Platform.OS === 'web' && 'clipboard' in navigator) {
        await (navigator as any).clipboard.writeText(coordStr);
      } else {
        await Clipboard.setStringAsync(coordStr);
      }
      Alert.alert('Скопировано', 'Координаты скопированы в буфер обмена');
    } catch {
      Alert.alert('Ошибка', 'Не удалось скопировать координаты');
    }
  }, []);

  const handleSendToTelegram = useCallback((coordStr: string) => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(coordStr)}&text=${encodeURIComponent(
        `Координаты: ${coordStr}`
    )}`;
    openExternal(url);
  }, []);

  const handleOpenMap = useCallback((coordStr: string) => {
    const parsed = parseCoord(coordStr);
    if (!parsed) {
      Alert.alert('Ошибка', 'Некорректные координаты');
      return;
    }
    const { lat, lon } = parsed;
    const url = Platform.select({
      ios: `maps://?q=${lat},${lon}`,
      android: `geo:${lat},${lon}?q=${lat},${lon}`,
      default: `https://maps.google.com/?q=${lat},${lon}`,
    }) as string;
    openExternal(url);
  }, []);

  const toggleCardExpand = useCallback((id: string) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  }, []);

  const cardLayoutStyle = useMemo(() => {
    if (width >= 1024) return { flexBasis: '31%', maxWidth: '31%' } as const;
    if (width >= 600) return { flexBasis: '48%', maxWidth: '48%' } as const;
    return { flexBasis: '100%', maxWidth: '100%' } as const;
  }, [width]);

  const responsive: Responsive = useMemo(() => {
    let minHeight = 260;
    let titleSize = 15;
    let coordSize = 13;
    if (width >= 1024) {
      minHeight = 300;
      titleSize = 17;
      coordSize = 14;
    } else if (width >= 600) {
      minHeight = 280;
      titleSize = 16;
      coordSize = 13.5 as any;
    }
    return {
      image: { minHeight, flex: 1 },
      title: { fontSize: titleSize },
      coord: { fontSize: coordSize },
    };
  }, [width]);

  return (
      <View style={styles.wrapper}>
        <Pressable
            onPress={() => setShowCoords((prev) => !prev)}
            style={({ pressed }) => [styles.toggleButton, pressed && styles.toggleButtonPressed, Platform.OS === 'web' && styles.cursorPointer]}
            accessibilityRole="button"
            accessibilityLabel={showCoords ? 'Скрыть координаты мест' : 'Показать координаты мест'}
        >
          <MapPinned size={18} color="#3B2C24" style={{ marginRight: 6 }} />
          <Text style={[styles.toggleText, isMobile && styles.toggleTextMobile]}>
            {showCoords ? 'Скрыть координаты мест' : 'Показать координаты мест'}
          </Text>
          {showCoords ? <ChevronUp size={18} color="#3B2C24" /> : <ChevronDown size={18} color="#3B2C24" />}
        </Pressable>

        {showCoords && (
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.cardsContainer}
                showsVerticalScrollIndicator={false}
            >
              {safePoints.map((point, index) => {
                const imgUri = getImageWithVersion(point.travelImageThumbUrl, point.updated_at);
                const expanded = expandedCard === point.id;

                return (
                    <Animated.View
                        key={point.id}
                        entering={FadeIn.delay(index * 30)}
                        style={[styles.card, cardLayoutStyle]}
                    >
                      <Pressable
                          onPress={() => toggleCardExpand(point.id)}
                          onLongPress={() => handleOpenMap(point.coord)}
                          delayLongPress={500}
                          style={{ flex: 1 }}
                          android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
                          accessibilityRole="button"
                          accessibilityLabel={`Точка: ${point.address}`}
                      >
                        {imgUri ? (
                            <ImageBackground
                                source={{ uri: imgUri }}
                                style={[styles.image, responsive.image]}
                                imageStyle={{ borderRadius: 12 }}
                                resizeMode="cover"
                            >
                              <PointCardContent
                                  point={point}
                                  expanded={expanded}
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
                                  expanded={expanded}
                                  handleCopyCoords={handleCopyCoords}
                                  handleSendToTelegram={handleSendToTelegram}
                                  handleOpenMap={handleOpenMap}
                                  responsive={responsive}
                              />
                            </View>
                        )}
                      </Pressable>
                    </Animated.View>
                );
              })}
            </ScrollView>
        )}
      </View>
  );
};

export default PointList;

const styles = StyleSheet.create({
  wrapper: { width: '100%', marginTop: 8 },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toggleButtonPressed: { backgroundColor: '#f5f5f5' },
  toggleText: { fontSize: 16, fontWeight: '600', color: '#3B2C24' },
  toggleTextMobile: { fontSize: 14 },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 40,
    gap: 12 as any, // RN Web поддерживает gap; на native игнорируется
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
  image: { justifyContent: 'flex-end', flex: 1 },
  noImage: { backgroundColor: '#e0e0e0' },

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
  iconButton: { marginHorizontal: 2 },

  overlay: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  title: { color: '#fff', fontWeight: '600', marginBottom: 6 },
  coord: { color: '#cceeff', textDecorationLine: 'underline', marginBottom: 8 },
  description: { color: '#fff', fontSize: 13, marginBottom: 8, lineHeight: 18 },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  category: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  categoryText: { color: '#fff', fontSize: 12, fontWeight: '500' },

  // web-only nicety
  cursorPointer: Platform.select({ web: { cursor: 'pointer' }, default: {} }) as any,
});
