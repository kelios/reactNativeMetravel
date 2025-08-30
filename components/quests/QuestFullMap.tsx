// components/quests/QuestFullMap.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Platform,
    Pressable,
    Text,
    Dimensions,
    TouchableOpacity,
    Modal,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

type StepPoint = { lat: number; lng: number; title?: string };

type Mods = {
    L: typeof import('leaflet');
    MapContainer: any;
    TileLayer: any;
    Marker: any;
    Polyline: any;
    Popup: any;
    FeatureGroup: any;
    useMap: () => any;
};

// n теперь может быть числом или строкой "1,2"
function numberIcon(L: any, n: number | string, active = false) {
    const bg = active ? '#0ea5e9' : '#f59e0b';
    const stroke = active ? '#0369a1' : '#b45309';
    const html = `
    <div style="
      width:28px;height:28px;border-radius:9999px;
      background:${bg};border:2px solid ${stroke};
      color:#fff;display:flex;align-items:center;justify-content:center;
      font-weight:800;font-size:12px;line-height:1;box-shadow:0 2px 6px rgba(0,0,0,.25);
      padding:0 4px
    ">${String(n)}</div>`;
    return L.divIcon({ className: 'qmark', html, iconSize: [28, 28], iconAnchor: [14, 14] });
}

function buildGPX(pts: StepPoint[]) {
    const trkpts = pts
        .map(p => `<trkpt lat="${p.lat.toFixed(6)}" lon="${p.lng.toFixed(6)}"></trkpt>`)
        .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="MeTravel" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
<trk><name>Quest route</name><trkseg>
${trkpts}
</trkseg></trk>
</gpx>`;
}

function buildGeoJSON(pts: StepPoint[]) {
    return JSON.stringify(
        {
            type: 'FeatureCollection',
            features: [
                ...pts.map((p, i) => ({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
                    properties: { order: i + 1, title: p.title || `Точка ${i + 1}` },
                })),
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: pts.map(p => [p.lng, p.lat]),
                    },
                    properties: { name: 'Quest route' },
                },
            ],
        },
        null,
        2
    );
}

function downloadText(filename: string, text: string, type = 'text/plain') {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

export default function QuestFullMap({
                                         steps,
                                         height = 520,
                                         title = 'Карта квеста',
                                     }: {
    steps: StepPoint[];
    height?: number;
    title?: string;
}) {
    const [mods, setMods] = useState<Mods | null>(null);
    const [exportMenuVisible, setExportMenuVisible] = useState(false);
    const mapDivRef = useRef<HTMLDivElement | null>(null);
    const insets = useSafeAreaInsets();
    const { width: screenWidth } = Dimensions.get('window');

    useEffect(() => {
        (async () => {
            try {
                const L = await import('leaflet');
                const RL = await import('react-leaflet');

                // default marker images (not used for numberIcon, but keep leaflet happy)
                // @ts-ignore
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
                    iconUrl: require('leaflet/dist/images/marker-icon.png'),
                    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
                });

                if (Platform.OS === 'web') {
                    await import('leaflet/dist/leaflet.css');
                }

                setMods({
                    L,
                    MapContainer: (RL as any).MapContainer,
                    TileLayer: (RL as any).TileLayer,
                    Marker: (RL as any).Marker,
                    Polyline: (RL as any).Polyline,
                    Popup: (RL as any).Popup,
                    FeatureGroup: (RL as any).FeatureGroup,
                    useMap: (RL as any).useMap,
                });
            } catch (error) {
                console.error('Error loading map modules:', error);
            }
        })();
    }, []);

    const points = useMemo(
        () => steps.filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lng)),
        [steps]
    );

    // Группировка совпадающих координат
    const groupedPoints = useMemo(() => {
        type GP = { lat: number; lng: number; indexes: number[]; titles: string[] };
        const map = new Map<string, GP>();
        points.forEach((p, i) => {
            const key = `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
            if (!map.has(key)) {
                map.set(key, {
                    lat: p.lat,
                    lng: p.lng,
                    indexes: [i + 1],
                    titles: [p.title || `Точка ${i + 1}`],
                });
            } else {
                const gp = map.get(key)!;
                gp.indexes.push(i + 1);
                gp.titles.push(p.title || `Точка ${i + 1}`);
            }
        });
        // стабильный порядок для консистентности
        return Array.from(map.values()).sort(
            (a, b) => Math.min(...a.indexes) - Math.min(...b.indexes)
        );
    }, [points]);

    // Mobile-specific export functions
    const shareAsPNG = async () => {
        try {
            if (Platform.OS === 'web') {
                exportPNG();
                return;
            }

            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Требуется разрешение', 'Разрешите доступ к галерее для сохранения изображения');
                return;
            }

            Alert.alert('Экспорт', 'Функция экспорта PNG на мобильных устройствах в разработке');
        } catch (error) {
            console.error('Error sharing PNG:', error);
        }
    };

    const shareAsGPX = async () => {
        try {
            if (Platform.OS === 'web') {
                exportGPX();
                return;
            }

            const gpxContent = buildGPX(points);
            const fileUri = `${FileSystem.cacheDirectory}${title.replace(/\s+/g, '_')}.gpx`;

            await FileSystem.writeAsStringAsync(fileUri, gpxContent);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/gpx+xml',
                    dialogTitle: 'Поделиться маршрутом',
                });
            }
        } catch (error) {
            console.error('Error sharing GPX:', error);
        }
    };

    const shareAsGeoJSON = async () => {
        try {
            if (Platform.OS === 'web') {
                exportGeoJSON();
                return;
            }

            const geoJsonContent = buildGeoJSON(points);
            const fileUri = `${FileSystem.cacheDirectory}${title.replace(/\s+/g, '_')}.geojson`;

            await FileSystem.writeAsStringAsync(fileUri, geoJsonContent);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/geo+json',
                    dialogTitle: 'Поделиться маршрутом',
                });
            }
        } catch (error) {
            console.error('Error sharing GeoJSON:', error);
        }
    };

    const exportPNG = async () => {
        try {
            const domtoimage = await import('dom-to-image');
            const node = mapDivRef.current;
            if (!node) return;
            const dataUrl = await (domtoimage as any).toPng(node, { quality: 1 });
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${title.replace(/\s+/g, '_')}.png`;
            a.click();
        } catch {
            window.print();
        }
    };

    const exportGPX = () =>
        downloadText(`${title.replace(/\s+/g, '_')}.gpx`, buildGPX(points), 'application/gpx+xml');
    const exportGeoJSON = () =>
        downloadText(`${title.replace(/\s+/g, '_')}.geojson`, buildGeoJSON(points), 'application/geo+json');

    if (!mods || points.length === 0) {
        return (
            <View style={[styles.wrap, { height }]}>
                <Text style={styles.loadingText}>Загрузка карты...</Text>
            </View>
        );
    }

    const { L, MapContainer, TileLayer, Marker, Polyline, Popup, FeatureGroup, useMap } = mods;
    const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng] as [number, number])).pad(0.15);

    // Безопасное подгоняние границ
    const FitBounds: React.FC = () => {
        const map = useMap();

        useEffect(() => {
            if (!map) return;

            map.whenReady(() => {
                const container: HTMLElement | undefined = map.getContainer?.();
                if (!container) return;

                const { clientWidth, clientHeight } = container;
                if (!clientWidth || !clientHeight) return;

                const current = map.getBounds?.();
                const already = current && current.contains(bounds) && bounds.contains(current);

                if (!already) {
                    map.fitBounds(bounds, { animate: false });
                }

                requestAnimationFrame(() => map.invalidateSize());
            });
        }, [map, bounds]);

        return null;
    };

    return (
        <View style={[styles.wrap, { height }]}>
            {/* Mobile-friendly toolbar */}
            <View style={[styles.toolbar, { paddingTop: insets.top + 8 }]}>
                <Text style={styles.toolbarTitle} numberOfLines={1}>
                    {title}
                </Text>

                {Platform.OS === 'web' ? (
                    <View style={styles.webButtons}>
                        <Pressable style={styles.btn} onPress={exportPNG}>
                            <Text style={styles.btnTxt}>PNG</Text>
                        </Pressable>
                        <Pressable style={styles.btn} onPress={exportGPX}>
                            <Text style={styles.btnTxt}>GPX</Text>
                        </Pressable>
                        <Pressable style={styles.btn} onPress={exportGeoJSON}>
                            <Text style={styles.btnTxt}>GeoJSON</Text>
                        </Pressable>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.mobileMenuButton}
                        onPress={() => setExportMenuVisible(true)}
                    >
                        <Text style={styles.mobileMenuText}>⋮</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Mobile export menu modal */}
            <Modal
                visible={exportMenuVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setExportMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setExportMenuVisible(false)}
                >
                    <View style={[styles.modalContent, { bottom: insets.bottom }]}>
                        <Text style={styles.modalTitle}>Экспорт маршрута</Text>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => {
                                setExportMenuVisible(false);
                                shareAsPNG();
                            }}
                        >
                            <Text style={styles.modalOptionText}>Сохранить как PNG</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => {
                                setExportMenuVisible(false);
                                shareAsGPX();
                            }}
                        >
                            <Text style={styles.modalOptionText}>Поделиться GPX</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => {
                                setExportMenuVisible(false);
                                shareAsGeoJSON();
                            }}
                        >
                            <Text style={styles.modalOptionText}>Поделиться GeoJSON</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalOption, styles.cancelOption]}
                            onPress={() => setExportMenuVisible(false)}
                        >
                            <Text style={styles.cancelOptionText}>Отмена</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <View ref={mapDivRef as any} style={styles.mapBox}>
                <MapContainer
                    bounds={bounds}
                    style={styles.map}
                    scrollWheelZoom={false}
                    zoomControl={Platform.OS === 'web'}
                    dragging={Platform.OS === 'web'}
                    touchZoom={true}
                    doubleClickZoom={false}
                >
                    <FitBounds />
                    <TileLayer
                        attribution="&copy; OpenStreetMap"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Линия по исходным точкам, чтобы сохранить порядок маршрута */}
                    <Polyline
                        positions={points.map(p => [p.lat, p.lng])}
                        pathOptions={{ color: '#2563eb', weight: 4 }}
                    />

                    {/* Маркеры по сгруппированным координатам */}
                    <FeatureGroup>
                        {groupedPoints.map((gp, idx) => (
                            <Marker
                                key={`${gp.lat}-${gp.lng}-${idx}`}
                                position={[gp.lat, gp.lng]}
                                icon={numberIcon(L, gp.indexes.join(','), gp.indexes.includes(1))}
                            >
                                <Popup>
                                    <View style={{ minWidth: 180 }}>
                                        <Text style={styles.popupTitle}>
                                            {gp.indexes.join(', ')}.
                                        </Text>
                                        <Text style={styles.popupCoords}>
                                            {gp.lat.toFixed(6)}, {gp.lng.toFixed(6)}
                                        </Text>
                                        <Text style={[styles.popupCoords, { marginTop: 6 }]}>
                                            {gp.titles.join(', ')}
                                        </Text>
                                    </View>
                                </Popup>
                            </Marker>
                        ))}
                    </FeatureGroup>
                </MapContainer>
            </View>

            {/* Mobile touch hints */}
            {Platform.OS !== 'web' && (
                <View style={styles.touchHints}>
                    <Text style={styles.hintText}>↕️ Двумя пальцами для масштабирования</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#fff',
    },
    toolbar: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        minHeight: 60,
    },
    toolbarTitle: {
        fontWeight: '800',
        color: '#0f172a',
        fontSize: 18,
        flex: 1,
        marginRight: 12,
    },
    webButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    btn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#0ea5e9',
    },
    btnTxt: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    mobileMenuButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#0ea5e9',
    },
    mobileMenuText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    mapBox: {
        flex: 1,
        minHeight: 300,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    loadingText: {
        textAlign: 'center',
        padding: 20,
        color: '#64748b',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 30,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#0f172a',
    },
    modalOption: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#0f172a',
        textAlign: 'center',
    },
    cancelOption: {
        marginTop: 10,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        borderBottomWidth: 0,
    },
    cancelOptionText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
        textAlign: 'center',
    },
    popupTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
        color: '#0f172a',
    },
    popupCoords: {
        fontSize: 12,
        color: '#64748b',
    },
    touchHints: {
        padding: 12,
        backgroundColor: '#f8fafc',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    hintText: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
    },
});
