// app/quests/map.tsx
import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
    Platform,
    View,
    Text,
    StyleSheet,
    Pressable,
    Image as RNImage,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import { ALL_QUESTS_META, getQuestById, QuestMeta } from '@/components/quests/registry';

let MapPageComponent: React.ComponentType<any> | null = null;
if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // web-only компонент карты
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    MapPageComponent = require('@/components/MapPage/Map').default;
}

type Point = {
    id?: number;
    coord: string;               // "lat,lng"
    address: string;
    travelImageThumbUrl: string; // абсолютный URL картинки
    categoryName: string;
    articleUrl?: string;
    urlTravel?: string;
};

// надёжно получаем web-URL для Asset
function assetUri(mod: any): string {
    try {
        // expo-asset стабильно даёт корректный путь на web
        const a = Asset.fromModule(mod);
        const uri = a?.uri;
        if (!uri) return '';
        if (uri.startsWith('http') || uri.startsWith('data:') || uri.startsWith('/')) return uri;
        return `/${uri}`; // делаем абсолютным, если вдруг относительный
    } catch {
        // fallback через RNImage (на случай dev-сборки)
        try {
            const res = RNImage.resolveAssetSource?.(mod);
            const uri = res?.uri;
            if (!uri) return '';
            if (uri.startsWith('http') || uri.startsWith('data:') || uri.startsWith('/')) return uri;
            return `/${uri}`;
        } catch {
            return '';
        }
    }
}

export default function QuestsMapScreen() {
    const router = useRouter();

    const travel = useMemo(() => {
        const data: Point[] = ALL_QUESTS_META.map((m: QuestMeta) => {
            const bundle = getQuestById(m.id);
            const address = bundle?.city?.name || m.cityId;

            // 1) пробуем обложку из meta
            let coverUri = m.cover ? assetUri(m.cover) : '';

            // 2) если нет — берём первую картинку из шагов квеста
            if (!coverUri && bundle?.steps?.length) {
                const firstWithImg = bundle.steps.find((s: any) => s?.image);
                if (firstWithImg?.image) coverUri = assetUri(firstWithImg.image);
            }

            return {
                id: undefined,
                coord: `${m.lat},${m.lng}`,
                address,
                travelImageThumbUrl: coverUri,
                categoryName: 'Квест',
                urlTravel: `/quests/${m.cityId}/${m.id}`,
                articleUrl: undefined,
            };
        });
        return { data };
    }, []);

    const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
    const [distance, setDistance] = useState(0);
    const [fullRoute, setFullRoute] = useState<[number, number][]>([]);

    const handleBack = () => {
        router.replace('/quests'); // всегда уходим на страницу квестов
    };

    if (!MapPageComponent) {
        return (
            <View style={styles.fallback}>
                <Text style={styles.fallbackText}>Карта доступна в веб-версии</Text>
                <Pressable onPress={handleBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={16} color="#fff" />
                    <Text style={styles.backBtnTxt}>Назад</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <MapPageComponent
                travel={travel}
                coordinates={{ latitude: 53.9, longitude: 27.56 }}
                mode="radius"
                transportMode="foot"
                routePoints={routePoints}
                setRoutePoints={setRoutePoints}
                onMapClick={(lng: number, lat: number) => {}}
                setRouteDistance={setDistance}
                setFullRouteCoords={setFullRoute}
            />

            {/* Плавающая кнопка Назад поверх карты */}
            <Pressable
                onPress={handleBack}
                style={styles.fabBack}
                accessibilityRole="button"
                accessibilityLabel="Назад"
            >
                <Ionicons name="arrow-back" size={18} color="#111827" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    fabBack: {
        position: 'absolute',
        top: 12,
        left: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: 'rgba(0,0,0,0.08)',
        shadowOpacity: 1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        ...Platform.select({ android: { elevation: 3 } }),
    },
    fallback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
    },
    fallbackText: { color: '#374151', fontSize: 16 },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#111827',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },
    backBtnTxt: { color: '#fff', fontWeight: '700' },
});
