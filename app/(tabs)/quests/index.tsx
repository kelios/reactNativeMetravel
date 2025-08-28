// app/quests/index.tsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    Platform,
    useWindowDimensions,
    Image,
    ScrollView,
} from 'react-native';
import Head from 'expo-router/head';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

import {
    CITIES,
    CITY_QUESTS,
    City,
    QuestMeta,
    ALL_QUESTS,
} from '@/components/quests/cityQuests';
import { haversineKm } from '@/utils/geo';

const STORAGE_SELECTED_CITY = 'quests_selected_city';
const NEARBY_ID = '__nearby__';
const NEARBY_RADIUS_KM = 60;

const UI = {
    primary: '#f59e0b',
    primaryDark: '#d97706',
    bg: '#f7fafc',
    surface: '#ffffff',
    cardAlt: '#f8fafc',
    text: '#0f172a',
    textLight: '#64748b',
    textMuted: '#94a3b8',
    border: '#e5e7eb',
    divider: '#e5e7eb',
    shadow: 'rgba(15, 23, 42, 0.06)',
};

export default function QuestsScreen() {
    const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
    const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
    const { width } = useWindowDimensions();

    const cityColumns = width >= 1200 ? 5 : width >= 900 ? 4 : 3;
    const questColumns = width >= 1100 ? 3 : width >= 740 ? 2 : 1;

    // ключи для форс-ремонта FlatList при смене numColumns
    const citiesListKey = useMemo(() => `cities-${cityColumns}`, [cityColumns]);
    const questsListKey = useMemo(() => `quests-${questColumns}`, [questColumns]);

    useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_SELECTED_CITY);
                setSelectedCityId(saved || 'krakow');
            } catch {
                setSelectedCityId('krakow');
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;
                const pos = await Location.getCurrentPositionAsync({
                    accuracy: Location.LocationAccuracy.Balanced,
                });
                setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            } catch {}
        })();
    }, []);

    const handleSelectCity = useCallback(async (id: string) => {
        setSelectedCityId(id);
        try {
            await AsyncStorage.setItem(STORAGE_SELECTED_CITY, id);
        } catch {}
    }, []);

    const citiesWithNearby: (City | { id: string; name: string; country: 'PL' | 'BY'; isNearby: true })[] =
        useMemo(
            () => [{ id: NEARBY_ID, name: 'Рядом', country: 'BY', isNearby: true } as any, ...CITIES],
            []
        );

    const selectedCity: City | null = useMemo(
        () =>
            selectedCityId && selectedCityId !== NEARBY_ID
                ? CITIES.find((c) => c.id === selectedCityId) || null
                : null,
        [selectedCityId]
    );

    const questsAll: (QuestMeta & { _distanceKm?: number })[] = useMemo(() => {
        if (!selectedCityId) return [];

        if (selectedCityId === NEARBY_ID) {
            if (!userLoc) return [];
            return ALL_QUESTS
                .map((q) => ({
                    ...q,
                    _distanceKm: haversineKm(userLoc.lat, userLoc.lng, q.lat, q.lng),
                }))
                .filter((q) => (q._distanceKm ?? Infinity) <= NEARBY_RADIUS_KM)
                .sort((a, b) => a._distanceKm! - b._distanceKm!);
        }

        return (CITY_QUESTS[selectedCityId] || []).map((q) => ({ ...q }));
    }, [selectedCityId, userLoc]);

    return (
        <>
            <Head>
                <title key="title">Квесты | MeTravel</title>
                <meta
                    key="description"
                    name="description"
                    content="Исследуйте города и парки с офлайн-квестами — приключения на карте рядом с вами"
                />
            </Head>

            {/* ВНЕШНИЙ СКРОЛЛЕР — работает и на web, и на нативе */}
            <ScrollView
                style={s.page}
                contentContainerStyle={s.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={s.wrap}>
                    {/* Hero */}
                    <View style={s.hero}>
                        <View style={s.heroIconWrap}>
                            <Ionicons name="compass" size={26} color={UI.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.title}>Квесты</Text>
                            <Text style={s.subtitle}>
                                Находи приключения в городах и парках. Смотри на карте — что рядом.
                            </Text>
                        </View>

                        <Link href="/quests/map" asChild>
                            <Pressable style={s.mapBtn}>
                                <Ionicons name="map" size={16} color="#fff" />
                                <Text style={s.mapBtnTxt}>Карта</Text>
                            </Pressable>
                        </Link>
                    </View>

                    {/* Города (без собственного скролла) */}
                    <FlatList
                        key={citiesListKey}
                        data={citiesWithNearby}
                        keyExtractor={(it) => it.id}
                        contentContainerStyle={s.citiesGrid}
                        numColumns={cityColumns}
                        scrollEnabled={false}
                        {...(cityColumns > 1 ? { columnWrapperStyle: { gap: 12 } } : {})}
                        renderItem={({ item }: any) => {
                            const active = selectedCityId === item.id;
                            const questsCount =
                                item.id === NEARBY_ID ? ALL_QUESTS.length : CITY_QUESTS[item.id]?.length || 0;

                            return (
                                <Pressable
                                    onPress={() => handleSelectCity(item.id)}
                                    style={[s.cityCard, active && s.cityCardActive]}
                                >
                                    <Text style={s.cityName}>
                                        {item.id === NEARBY_ID ? '🧭 Рядом' : item.name}
                                    </Text>
                                    <Text style={s.cityCountry}>
                                        {item.id === NEARBY_ID
                                            ? userLoc
                                                ? 'по вашей геолокации'
                                                : 'геолокация отключена'
                                            : item.country === 'PL'
                                                ? 'Польша'
                                                : 'Беларусь'}
                                    </Text>
                                    <Text style={s.questsCount}>
                                        {questsCount} квест{getPluralForm(questsCount)}
                                    </Text>
                                </Pressable>
                            );
                        }}
                    />

                    {selectedCityId && <View style={s.divider} />}

                    {/* Секция квестов (тоже отрисовываем без скролла) */}
                    {selectedCityId && (
                        <FlatList
                            key={questsListKey}
                            data={questsAll}
                            keyExtractor={(q) => q.id}
                            contentContainerStyle={s.questsGrid}
                            numColumns={questColumns}
                            scrollEnabled={false}
                            {...(questColumns > 1 ? { columnWrapperStyle: { gap: 20 } } : {})}
                            renderItem={({ item }) => (
                                <QuestCardLink
                                    cityId={
                                        selectedCityId === NEARBY_ID ? (item.cityId as string) : (selectedCityId as string)
                                    }
                                    quest={item}
                                    nearby={selectedCityId === NEARBY_ID}
                                />
                            )}
                        />
                    )}
                </View>
            </ScrollView>
        </>
    );
}

function QuestCardLink({
                           cityId,
                           quest,
                           nearby,
                       }: {
    cityId: string;
    quest: QuestMeta & { _distanceKm?: number };
    nearby?: boolean;
}) {
    const durationText = quest.durationMin
        ? `${Math.round((quest.durationMin ?? 60) / 5) * 5} мин`
        : '1–2 часа';

    return (
        <Link href={`/quests/${cityId}/${quest.id}`} asChild>
            <Pressable style={s.questCard}>
                {quest.cover && (
                    <View style={s.coverWrap}>
                        <Image source={quest.cover} style={s.questCover} resizeMode="cover" />
                        <View style={s.coverOverlay}>
                            <Text style={s.questTitle} numberOfLines={2}>
                                {quest.title}
                            </Text>
                            <View style={s.questMetaRow}>
                                <View style={s.metaItem}>
                                    <Ionicons name="navigate" size={14} color="#fff" />
                                    <Text style={s.metaText}>{quest.points} точек</Text>
                                </View>
                                <View style={s.metaItem}>
                                    <Ionicons name="time" size={14} color="#fff" />
                                    <Text style={s.metaText}>{durationText}</Text>
                                </View>
                                {nearby && typeof quest._distanceKm === 'number' && (
                                    <View style={s.metaItem}>
                                        <Ionicons name="walk" size={14} color="#fff" />
                                        <Text style={s.metaText}>
                                            {quest._distanceKm < 1
                                                ? `${Math.round(quest._distanceKm * 1000)} м`
                                                : `${quest._distanceKm.toFixed(1)} км`}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                )}
            </Pressable>
        </Link>
    );
}

function getPluralForm(count: number): string {
    if (count % 10 === 1 && count % 100 !== 11) return '';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'а';
    return 'ов';
}

const s = StyleSheet.create({
    page: { flex: 1, backgroundColor: UI.bg },
    // важно: flexGrow и нижний отступ, чтобы «прилипший» футер не перекрывал контент
    scrollContent: { flexGrow: 1, paddingBottom: 96 },

    wrap: { width: '100%', maxWidth: 1100, alignSelf: 'center', padding: 16 },

    hero: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: UI.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: UI.border,
        marginBottom: 18,
    },
    heroIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: UI.cardAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { color: UI.text, fontSize: 26, fontWeight: '800' },
    subtitle: { color: UI.textLight, fontSize: 14, marginTop: 2 },
    mapBtn: {
        flexDirection: 'row',
        gap: 6,
        backgroundColor: UI.primary,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
    },
    mapBtnTxt: { color: '#fff', fontWeight: '800' },

    citiesGrid: { gap: 12 },
    cityCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: UI.border,
        backgroundColor: UI.surface,
    },
    cityCardActive: { borderColor: UI.primary, backgroundColor: UI.cardAlt },
    cityName: { color: UI.text, fontSize: 17, fontWeight: '800' },
    cityCountry: { color: UI.textLight, fontSize: 13, marginBottom: 10 },
    questsCount: { color: UI.textLight, fontSize: 13, fontWeight: '700' },

    divider: { height: 1, backgroundColor: UI.divider, marginVertical: 18 },

    questsGrid: { gap: 20 },

    questCard: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: UI.shadow,
        shadowOpacity: 1,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        borderWidth: 1,
        borderColor: UI.border,
    },
    coverWrap: {
        width: '100%',
        ...Platform.select({
            web: { height: 540 },
            default: { aspectRatio: 3 / 4 },
        }),
        position: 'relative',
    },
    questCover: { width: '100%', height: '100%' },
    coverOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    questTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 6 },
    questMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
