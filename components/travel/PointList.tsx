import React, { useMemo, useCallback, useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  useWindowDimensions,
  Platform,
  Linking,
  ScrollView,
  Animated,
  LayoutAnimation,
  UIManager,
  Pressable,
  ImageBackground,
} from "react-native";
import { Card, Text, Button, IconButton } from "react-native-paper";
import { ChevronDown, ChevronUp, Map } from "lucide-react-native";

if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const brandOrange = "#ff8c49";
const brandDark = "#333333";
const background = "#f8f9fa";
const textPrimary = "#333333";
const textSecondary = "#666666";

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
  const { width, height } = useWindowDimensions();
  const isLargeScreen = useMemo(() => width >= 768, [width]);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const containerHeight = useRef(new Animated.Value(0)).current;

  const toggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCollapsed((prev) => !prev);
  };

  const containerStyle = useMemo(() => {
    return Platform.OS === "web"
        ? { maxWidth: 1200, alignSelf: "center" }
        : { maxHeight: height * 0.6 };
  }, [height]);

  const handleOpenGoogle = useCallback((coordStr: string) => {
    const [latStr, lonStr] = coordStr.split(",").map((s) => s.trim());
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    if (!isNaN(lat) && !isNaN(lon)) {
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      Linking.openURL(url).catch((err) => console.warn(err));
    }
  }, []);

  const handleSendToTelegram = useCallback((coordStr: string) => {
    try {
      const telegramUrl =
          "https://t.me/share/url?url=" +
          encodeURIComponent(coordStr) +
          "&text=" +
          encodeURIComponent(`Координаты места: ${coordStr}`);
      Linking.openURL(telegramUrl).catch((err) => {
        console.error("Failed to open Telegram URL:", err);
      });
    } catch (error) {
      console.warn("Telegram share error:", error);
      if (Platform.OS === "web") {
        navigator.clipboard.writeText(coordStr);
        alert("Координаты скопированы в буфер обмена!");
      }
    }
  }, []);

  return (
      <View style={[styles.container, containerStyle]}>
        <Pressable
            onPress={toggleCollapse}
            style={({ pressed }) => [
              styles.toggleButton,
              styles.toggleButtonFullWidth,
              pressed && styles.toggleButtonPressed,
            ]}
        >
          <Map size={18} color="#6B4F4F" style={{ marginRight: 6 }} />
          <Text style={styles.toggleText}>
            {isCollapsed ? "Показать координаты мест" : "Скрыть координаты мест"}
          </Text>
          {isCollapsed ? <ChevronDown size={18} color="#6B4F4F" /> : <ChevronUp size={18} color="#6B4F4F" />}
        </Pressable>

        {!isCollapsed && (
            <ScrollView
                contentContainerStyle={[
                  styles.scrollArea,
                  isLargeScreen && styles.scrollAreaLarge,
                ]}
            >
              {points.map((point) => (
                  <View
                      key={point.id}
                      style={[styles.cardContainer, isLargeScreen && styles.cardContainerLarge]}
                  >
                    <Card style={styles.card} mode="elevated">
                      {point.travelImageThumbUrl ? (
                          <ImageBackground
                              source={{ uri: point.travelImageThumbUrl }}
                              style={styles.cardImageBackground}
                              resizeMode="contain"
                          />
                      ) : (
                          <View style={[styles.cardImageBackground, styles.noPhotoContainer]}>
                            <Text style={styles.noPhotoText}>Нет фото</Text>
                          </View>
                      )}

                      <Card.Content style={styles.infoContent}>
                        <Text style={styles.cardSubtitle}>{point.coord}</Text>

                        <Text style={styles.label}>Адрес:</Text>
                        <Text style={styles.text}>{point.address}</Text>

                        <Text style={styles.label}>Категория:</Text>
                        <Text style={styles.text}>{point.categoryName || "Не указано"}</Text>

                        <View style={styles.actions}>
                          <Button
                              icon="map-marker"
                              onPress={() => handleOpenGoogle(point.coord)}
                              mode="contained"
                              textColor="#fff"
                              buttonColor={brandOrange}
                              style={styles.actionButton}
                          >
                            В Google
                          </Button>
                          <Button
                              icon="send"
                              onPress={() => handleSendToTelegram(point.coord)}
                              mode="outlined"
                              textColor={brandOrange}
                              style={styles.actionButton}
                          >
                            Telegram
                          </Button>
                        </View>
                      </Card.Content>
                    </Card>
                  </View>
              ))}
            </ScrollView>
        )}
      </View>
  );
};

export default PointList;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#f9f8f2',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
    marginBottom: 16,
  },
  toggleButtonFullWidth: {
    width: '100%',
  },
  toggleButtonPressed: {
    backgroundColor: '#f0f0f0',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B2C24',
  },
  scrollArea: {
    paddingBottom: 10,
  },
  scrollAreaLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardContainer: {
    width: '100%',
    marginBottom: 24,
  },
  cardContainerLarge: {
    width: '48%',
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 2,
  },
  cardImageBackground: {
    width: '100%',
    height: 200,
    backgroundColor: '#f4f4f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotoContainer: {
    backgroundColor: '#eee',
  },
  noPhotoText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  infoContent: {
    padding: 16,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#555',
    fontWeight: '700',
    marginBottom: 8,
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#3B2C24',
  },
  text: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    borderRadius: 24,
    paddingHorizontal: 12,
  },
});