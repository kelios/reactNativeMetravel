import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ImageBackground,
  Pressable,
  Linking,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Card, Button } from "react-native-paper";
import { ChevronDown, ChevronUp, MapPinned } from "lucide-react-native";

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
  const [showCoords, setShowCoords] = useState(false);

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
            {showCoords ? "Скрыть координаты мест" : "Показать координаты мест"}
          </Text>
          {showCoords ? (
              <ChevronUp size={18} color="#3B2C24" />
          ) : (
              <ChevronDown size={18} color="#3B2C24" />
          )}
        </Pressable>

        {showCoords && (
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
                              style={styles.cardImage}
                              resizeMode="cover"
                          />
                      ) : (
                          <View style={[styles.cardImage, styles.noPhoto]}>
                            <Text style={styles.noPhotoText}>Нет фото</Text>
                          </View>
                      )}
                      <View style={styles.content}>
                        <Text style={styles.coordText}>{point.coord}</Text>
                        <Text style={styles.label}>Адрес:</Text>
                        <Text style={styles.value}>{point.address}</Text>
                        <Text style={styles.label}>Категория:</Text>
                        <Text style={styles.value}>{point.categoryName || "Не указано"}</Text>
                        <View style={styles.actions}>
                          <Button
                              icon="map-marker"
                              mode="contained"
                              textColor="#fff"
                              buttonColor="#ff8c49"
                              style={styles.actionBtn}
                              onPress={() => handleOpenGoogle(point.coord)}
                          >
                            В Google
                          </Button>
                          <Button
                              icon="send"
                              mode="outlined"
                              textColor="#ff8c49"
                              style={styles.actionBtn}
                              onPress={() => handleSendToTelegram(point.coord)}
                          >
                            Telegram
                          </Button>
                        </View>
                      </View>
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
  wrapper: {
    width: "100%",
    paddingHorizontal: 0,
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
  },
  toggleButtonPressed: {
    backgroundColor: "#f0f0f0",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B2C24",
  },
  toggleTextMobile: {
    fontSize: 14,
  },
  scrollArea: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  scrollAreaLarge: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  cardContainer: {
    width: "100%",
    marginBottom: 24,
  },
  cardContainerLarge: {
    width: "48%",
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  noPhoto: {
    backgroundColor: "#f2f2f2",
  },
  noPhotoText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  coordText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "700",
    marginBottom: 8,
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#3B2C24",
  },
  value: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  actions: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionBtn: {
    borderRadius: 24,
    paddingHorizontal: 12,
  },
});
