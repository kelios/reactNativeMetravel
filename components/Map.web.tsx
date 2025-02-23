import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Linking,
  Platform,
  Alert,
} from 'react-native';

// Для копирования в буфер (Expo). Если не Expo, используйте @react-native-clipboard/clipboard.
import * as Clipboard from 'expo-clipboard';

// Проверяем, есть ли 'window', чтобы избежать ошибки при SSR или в нативных средах
const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

let MapContainer, TileLayer, Marker, Popup, useMap, L, Icon;
if (isWeb) {
  // Подгружаем только в браузерной среде
  MapContainer = require('react-leaflet').MapContainer;
  TileLayer = require('react-leaflet').TileLayer;
  Marker = require('react-leaflet').Marker;
  Popup = require('react-leaflet').Popup;
  useMap = require('react-leaflet').useMap;
  L = require('leaflet');
  Icon = require('leaflet').Icon;
  require('leaflet/dist/leaflet.css'); // Подключаем стили Leaflet
}

// Ваш компонент для вывода текстовых полей (не меняется)
import LabelText from './LabelText';

type Point = {
  id: number;
  coord: string;               // Строка вида "53.9, 27.5"
  address: string;
  travelImageThumbUrl: string;
  categoryName: string;
  articleUrl?: string;
  urlTravel?: string;
};

type TravelPropsType = {
  data?: Point[];
};

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface TravelProps {
  travel: TravelPropsType;        // объект с data: Point[]
  coordinates: Coordinates | null; // начальные координаты
}

const getLatLng = (latlng: string): [number, number] | null => {
  const [lat, lng] = latlng.split(',').map((coord) => parseFloat(coord.trim()));
  if (!isNaN(lat) && !isNaN(lng)) {
    return [lat, lng];
  }
  return null;
};

/**
 * Компонент FitBoundsOnData:
 *  - Автоматически подгоняет зум (map.fitBounds) под все валидные координаты
 */
function FitBoundsOnData({ data }: { data: Point[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !data || !data.length) return;

    // Получаем массив координат [ [lat, lng], [lat, lng], ... ]
    const coords = data
        .map((point) => getLatLng(point.coord))
        .filter((coord): coord is [number, number] => Boolean(coord));

    if (!coords.length) return;

    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, data]);

  return null;
}

const Map: React.FC<TravelProps> = ({ travel, coordinates: propCoordinates }) => {
  // Если среда не веб, показываем fallback
  if (!isWeb) {
    return <Text>Карта доступна только в веб-версии</Text>;
  }

  // Создаём иконку Leaflet (через useMemo)
  const meTravelIcon = useMemo(
      () =>
          new Icon({
            iconUrl: require('@/assets/icons/logo_yellow.ico'),
            iconSize: [27, 30],
            iconAnchor: [13, 30],
            popupAnchor: [0, -30],
          }),
      []
  );

  const travelData = travel?.data || [];
  // Начальные координаты, если не переданы — ставим дефолт
  const initialCenter: [number, number] = propCoordinates
      ? [propCoordinates.latitude, propCoordinates.longitude]
      : [53.8828449, 27.7273595];

  // ==========================
  //  ЛОГИКА КОПИРОВАНИЯ / ШАРИНГА
  // ==========================
  const copyCoords = (coord: string) => {
    if (!coord) return;
    Clipboard.setString(coord);

  };

  const shareCoordsTelegram = (coord: string) => {
    if (!coord) return;
    const telegramShareUrl =
        'https://t.me/share/url?url=' + encodeURIComponent(coord) +
        '&text=' + encodeURIComponent(`Координаты места: ${coord}`);
    Linking.openURL(telegramShareUrl).catch((err) => {
      console.error('Failed to open Telegram URL:', err);
    });
  };

  // ==========================
  //  ОБРАБОТКА НАЖАТИЯ ПО СТАТЬЕ
  // ==========================
  const handlePressArticle = (point: Point) => {
    const url = point.articleUrl || point.urlTravel;
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
      <MapContainer
          center={initialCenter}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Подгоняем зум под все точки */}
        <FitBoundsOnData data={travelData} />

        {travelData.map((point, index) => {
          const latLng = getLatLng(point.coord);
          if (!latLng) return null; // пропускаем невалидные координаты

          return (
              <Marker
                  key={String(point.id) + index}
                  position={latLng}
                  icon={meTravelIcon}
              >
                <Popup>
                  {/* СТИЛИЗОВАННАЯ "КАРТОЧКА" ВНУТРИ POPUP */}
                  <View style={styles.popupCard}>
                    {/* Блок картинки или fallback */}
                    {point.travelImageThumbUrl ? (
                        <Image
                            source={{ uri: point.travelImageThumbUrl }}
                            style={styles.pointImage}
                        />
                    ) : (
                        <Text style={styles.fallbackText}>
                          Нет фото. Нажмите, чтобы открыть статью.
                        </Text>
                    )}

                    {/* При нажатии на блок открываем статью (если есть url) */}
                    <Pressable
                        onPress={() => handlePressArticle(point)}
                        style={({ pressed }) => [
                          styles.textContainer,
                          { opacity: pressed ? 0.8 : 1 },
                        ]}
                    >
                      {point.address && (
                          <LabelText label="Адрес:" text={point.address} />
                      )}
                      {point.coord && (
                          <LabelText label="Координаты:" text={point.coord} />
                      )}
                      {point.categoryName && (
                          <LabelText label="Категория:" text={point.categoryName} />
                      )}
                    </Pressable>

                    {/* Ряд кнопок (копировать и отправить) */}
                    <View style={styles.actionsRow}>
                      <Pressable
                          onPress={() => copyCoords(point.coord)}
                          style={styles.actionButton}
                      >
                        <Text style={styles.actionButtonText}>Копировать</Text>
                      </Pressable>

                      <Pressable
                          onPress={() => shareCoordsTelegram(point.coord)}
                          style={[
                            styles.actionButton,
                            { backgroundColor: '#6AAAAA' },
                          ]}
                      >
                        <Text style={styles.actionButtonText}>Telegram</Text>
                      </Pressable>
                    </View>
                  </View>
                </Popup>
              </Marker>
          );
        })}
      </MapContainer>
  );
};

const styles = StyleSheet.create({
  popupCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    width: 220, // фиксированная ширина "карточки"
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  pointImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  fallbackText: {
    marginBottom: 8,
    color: '#555',
    fontStyle: 'italic',
  },
  textContainer: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#ff9f5a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default Map;
