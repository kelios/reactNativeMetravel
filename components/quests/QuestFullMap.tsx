// components/quests/QuestFullMap.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Pressable, Text } from 'react-native';

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

function numberIcon(L: any, n: number, active = false) {
    const bg = active ? '#0ea5e9' : '#f59e0b';
    const stroke = active ? '#0369a1' : '#b45309';
    const html = `
    <div style="
      width:28px;height:28px;border-radius:9999px;
      background:${bg};border:2px solid ${stroke};
      color:#fff;display:flex;align-items:center;justify-content:center;
      font-weight:800;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,.25)
    ">${n}</div>`;
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
    const mapDivRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        (async () => {
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
        })();
    }, []);

    const points = useMemo(
        () => steps.filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lng)),
        [steps]
    );

    if (!mods || points.length === 0) return null;

    const { L, MapContainer, TileLayer, Marker, Polyline, Popup, FeatureGroup, useMap } = mods;
    const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng] as [number, number])).pad(0.15);

    // Inner control: fit bounds on mount/update
    const FitBounds: React.FC = () => {
        const map = useMap();
        useEffect(() => {
            map.fitBounds(bounds, { animate: false });
            // small timeout fixes occasional tiles not loaded before fitBounds
            setTimeout(() => map.invalidateSize(), 100);
        }, [map]);
        return null;
    };

    // Export PNG using leaflet-easyPrint-like approach (HTML2Canvas-free, simple)
    const exportPNG = async () => {
        try {
            // dynamic import to keep bundle small
            const domtoimage = await import('dom-to-image');
            const node = mapDivRef.current;
            if (!node) return;
            const dataUrl = await (domtoimage as any).toPng(node, { quality: 1 });
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${title.replace(/\s+/g, '_')}.png`;
            a.click();
        } catch {
            // fallback: print
            window.print();
        }
    };

    const exportGPX = () => downloadText(`${title.replace(/\s+/g, '_')}.gpx`, buildGPX(points), 'application/gpx+xml');
    const exportGeoJSON = () => downloadText(`${title.replace(/\s+/g, '_')}.geojson`, buildGeoJSON(points), 'application/geo+json');

    return (
        <View style={[styles.wrap, { height }]}>
            {Platform.OS === 'web' && (
                <View style={styles.toolbar}>
                    <Text style={styles.toolbarTitle}>{title}</Text>
                    <View style={{ flex: 1 }} />
                    <Pressable style={styles.btn} onPress={exportPNG}><Text style={styles.btnTxt}>PNG</Text></Pressable>
                    <Pressable style={styles.btn} onPress={exportGPX}><Text style={styles.btnTxt}>GPX</Text></Pressable>
                    <Pressable style={styles.btn} onPress={exportGeoJSON}><Text style={styles.btnTxt}>GeoJSON</Text></Pressable>
                    <Pressable style={styles.btn} onPress={() => window.print()}><Text style={styles.btnTxt}>Печать</Text></Pressable>
                </View>
            )}

            <View ref={mapDivRef as any} style={styles.mapBox}>
                <MapContainer bounds={bounds} style={styles.map} scrollWheelZoom>
                    <FitBounds />
                    <TileLayer
                        attribution="&copy; OpenStreetMap"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Polyline positions={points.map(p => [p.lat, p.lng])} pathOptions={{ color: '#2563eb', weight: 3 }} />
                    <FeatureGroup>
                        {points.map((p, i) => (
                            <Marker
                                key={`${p.lat}-${p.lng}-${i}`}
                                position={[p.lat, p.lng]}
                                icon={numberIcon(L, i + 1, i === 0)}
                            >
                                <Popup>
                                    <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: 13 }}>
                                        <strong>{i + 1}. {p.title || 'Точка'}</strong>
                                        <div>{p.lat.toFixed(6)}, {p.lng.toFixed(6)}</div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </FeatureGroup>
                </MapContainer>
            </View>
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
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#f8fafc',
    },
    toolbarTitle: { fontWeight: '800', color: '#0f172a' },
    btn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: '#0ea5e9',
        marginLeft: 6,
    },
    btnTxt: { color: '#fff', fontWeight: '800' },
    mapBox: { flex: 1 },
    map: { width: '100%', height: '100%' },
});
