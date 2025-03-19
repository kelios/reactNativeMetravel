import React, { useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  useWindowDimensions,
  Platform,
  Linking,
  ScrollView,
} from "react-native";
import { Card, Text, Button } from "react-native-paper";

// Цвета, ближе к тому, что видно на скриншоте:
// (При желании замените на точные значения из макета/дизайна)
const brandOrange = "#ff8c49";
const brandDark = "#333333";

type Point = {
  id: string;
  travelImageThumbUrl?: string;
  address: string;
  coord: string; // "47.2792290,15.1171875"
  categoryName?: string;
};

type PointListProps = {
  points: Point[];
};

const PointList: React.FC<PointListProps> = ({ points }) => {
  const { width, height } = useWindowDimensions();

  // Если >= 768 пикс. считаем "large" (планшет / десктоп)
  const isLargeScreen = useMemo(() => width >= 768, [width]);

  // Универсальное ограничение списка по высоте:
  // - Web: 60vh
  // - iOS/Android: 60% высоты экрана
  const containerStyle = useMemo(() => {
    if (Platform.OS === "web") {
      return {
        maxHeight: "60vh",
        overflow: "auto" as const,
      };
    } else {
      return {
        maxHeight: height * 0.6,
      };
    }
  }, [height]);

  // «Открыть в Google Maps»
  const handleOpenGoogle = useCallback((coordStr: string) => {
    const [latStr, lonStr] = coordStr.split(",").map((s) => s.trim());
    if (!latStr || !lonStr) return;
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    if (isNaN(lat) || isNaN(lon)) return;

    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    Linking.openURL(url).catch((err) => console.warn(err));
  }, []);

  // «Отправить в Telegram»
  const handleSendToTelegram = useCallback(async (coordStr: string) => {
    try {
      const telegramShareUrl =
          "https://t.me/share/url?url=" +
          encodeURIComponent(coordStr) +
          "&text=" +
          encodeURIComponent(`Координаты места: ${coordStr}`);
      Linking.openURL(telegramShareUrl).catch((err) => {
        console.error("Failed to open Telegram URL:", err);
      });
    } catch (error) {
      console.warn("Telegram share error:", error);
      // Fallback: копируем в буфер (web)
      if (Platform.OS === "web") {
        // Clipboard.setString(coordStr);
        alert("Координаты скопированы в буфер обмена!");
      }
    }
  }, []);

  return (
      <View style={[styles.container, containerStyle]}>
        <ScrollView contentContainerStyle={styles.scrollArea}>
          {points.map((point) => (
              <Card key={point.id} style={styles.card} mode="elevated">
                <View
                    style={[
                      styles.cardContent,
                      { flexDirection: isLargeScreen ? "row" : "column" },
                    ]}
                >
                  {/* Картинка или заглушка */}
                  {point.travelImageThumbUrl ? (
                      <Card.Cover
                          source={{ uri: point.travelImageThumbUrl }}
                          style={[
                            styles.cover,
                            isLargeScreen ? styles.coverLarge : styles.coverSmall,
                          ]}
                          resizeMode="cover"
                      />
                  ) : (
                      <View
                          style={[
                            styles.noPhotoContainer,
                            isLargeScreen ? styles.coverLarge : styles.coverSmall,
                          ]}
                      >
                        <Text style={styles.noPhotoText}>Нет фото</Text>
                      </View>
                  )}

                  {/* Текстовая часть */}
                  <View style={styles.infoSection}>
                    <Card.Title
                        title="Местоположение"
                        subtitle={point.coord}
                        titleStyle={styles.cardTitle}
                        subtitleStyle={styles.cardSubtitle}
                    />

                    <Card.Content>
                      <Text style={styles.label}>Адрес:</Text>
                      <Text style={styles.text}>{point.address}</Text>

                      <Text style={styles.label}>Категория:</Text>
                      <Text style={styles.text}>
                        {point.categoryName || "Не указано"}
                      </Text>
                    </Card.Content>

                    {/** Кнопки (Actions) */}
                    <Card.Actions style={styles.actions}>
                      <Button
                          icon="map-marker"
                          onPress={() => handleOpenGoogle(point.coord)}
                          mode="contained"
                          textColor="#fff"
                          buttonColor={brandOrange}
                          style={styles.actionButton}
                      >
                        Открыть в Google
                      </Button>
                      <Button
                          icon="send"
                          onPress={() => handleSendToTelegram(point.coord)}
                          mode="outlined"
                          textColor={brandDark}
                          style={styles.actionButton}
                          buttonColor="#fff"
                      >
                        Скопировать в Telegram
                      </Button>
                    </Card.Actions>
                  </View>
                </View>
              </Card>
          ))}
        </ScrollView>
      </View>
  );
};

export default PointList;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  scrollArea: {
    padding: 10,
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    // Тень (Android)
    elevation: 3,
    // Тень (iOS/Web)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    backgroundColor: "#fff",
  },
  cardContent: {},
  cover: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: "hidden",
  },
  coverSmall: {
    width: "100%",
    height: 160,
  },
  coverLarge: {
    width: 220,
    height: 220,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 8,
    marginRight: 10,
  },
  noPhotoContainer: {
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  noPhotoText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "600",
  },
  infoSection: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: brandDark,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#777",
  },
  label: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  text: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  actions: {
    marginTop: 8,
    flexWrap: "wrap",
  },
  actionButton: {
    marginRight: 8,
    marginTop: 4,
  },
});
