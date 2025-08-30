// app/quests/index.tsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
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
const STORAGE_NEARBY_RADIUS = 'quests_nearby_radius_km';
const DEFAULT_NEARBY_RADIUS_KM = 15;

const NEARBY_ID = '__nearby__';

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

// helper: безопасно комбинировать стили (без массивов/false/undefined)
const sx = (...args: Array<object | false | null | undefined>) =>
    StyleSheet.flatten(args.filter(Boolean));

type NearbyCity = { id: string; name: string; country: 'PL' | 'BY'; isNearby: true };

export default function QuestsScreen() {
    const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
    const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
    const [nearbyRadiusKm, setNearbyRadiusKm] = useState<number>(DEFAULT_NEARBY_RADIUS_KM);

    const { width } = useWindowDimensions();
    const isSmall = width < 600;

    // Узкие экраны — 2 колонки городов
    const cityColumns = width >= 1200 ? 5 : width >= 900 ? 4 : width >= 600 ? 3 : 2;
    const questColumns = width >= 1100 ? 3 : width >= 740 ? 2 : 1;

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
                const saved = await AsyncStorage.getItem(STORAGE_NEARBY_RADIUS);
                if (saved) setNearbyRadiusKm(Number(saved));
            } catch {}
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
                setUserLoc({ lat: pos.coords.latitude, lng: pos.longitude ?? pos.coords.longitude });
            } catch {}
        })();
    }, []);

    const handleSelectCity = useCallback(async (id: string) => {
        setSelectedCityId(id);
        try {
            await AsyncStorage.setItem(STORAGE_SELECTED_CITY, id);
        } catch {}
    }, []);

    const handleSetRadius = useCallback(async (km: number) => {
        setNearbyRadiusKm(km);
        try {
            await AsyncStorage.setItem(STORAGE_NEARBY_RADIUS, String(km));
        } catch {}
    }, []);

    const citiesWithNearby: (City | NearbyCity)[] = useMemo(
        () => [{ id: NEARBY_ID, name: 'Рядом', country: 'BY', isNearby: true } as NearbyCity, ...CITIES],
        []
    );

    const nearbyCount = useMemo(() => {
        if (!userLoc) return 0;
        return ALL_QUESTS.reduce((acc, q) => {
            const d = haversineKm(userLoc.lat, userLoc.lng, q.lat, q.lng);
            return acc + (d <= nearbyRadiusKm ? 1 : 0);
        }, 0);
    }, [userLoc, nearbyRadiusKm]);

    const questsAll: (QuestMeta & { _distanceKm?: number })[] = useMemo(() => {
        if (!selectedCityId) return [];

        if (selectedCityId === NEARBY_ID) {
            if (!userLoc) return [];
            return ALL_QUESTS
                .map((q) => ({
                    ...q,
                    _distanceKm: haversineKm(userLoc.lat, userLoc.lng, q.lat, q.lng),
                }))
                .filter((q) => (q._distanceKm ?? Infinity) <= nearbyRadiusKm)
                .sort((a, b) => a._distanceKm! - b._distanceKm!);
        }

        return (CITY_QUESTS[selectedCityId] || []).map((q) => ({ ...q }));
    }, [selectedCityId, userLoc, nearbyRadiusKm]);

    function chunkArray<T>(array: T[], columns: number): T[][] {
        const result: T[][] = [];
        for (let i = 0; i < array.length; i += columns) result.push(array.slice(i, i + columns));
        return result;
    }

    const chunkedCities = chunkArray(citiesWithNearby, cityColumns);
    const chunkedQuests = chunkArray(questsAll, questColumns);

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

            <ScrollView
                style={s.page}
                contentContainerStyle={s.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={s.wrap}>
                    {/* Hero */}
                    <View style={sx(s.hero, isSmall && s.heroSmall)}>
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
                            <Pressable style={sx(s.mapBtn, isSmall && s.mapBtnSmall)}>
                                <Ionicons name="map" size={16} color="#fff" />
                                <Text style={s.mapBtnTxt}>Карта</Text>
                            </Pressable>
                        </Link>
                    </View>

                    {/* Города */}
                    <View style={s.citiesContainer}>
                        {chunkedCities.map((row, rowIndex) => (
                            <View key={`row-${rowIndex}`} style={s.citiesRow}>
                                {row.map((item) => {
                                    const active = selectedCityId === item.id;
                                    const questsCount =
                                        item.id === NEARBY_ID
                                            ? (userLoc ? nearbyCount : 0)
                                            : CITY_QUESTS[item.id]?.length || 0;

                                    return (
                                        <Pressable
                                            key={item.id}
                                            onPress={() => handleSelectCity(item.id)}
                                            style={sx(s.cityCard, active && s.cityCardActive)}
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
                                })}
                            </View>
                        ))}
                    </View>

                    {selectedCityId && <View style={s.divider} />}

                    {/* Фильтр радиуса для «Рядом» */}
                    {selectedCityId === NEARBY_ID && (
                        <View style={s.filtersRow}>
                            <Text style={s.filtersLabel}>Радиус:</Text>
                            {[2, 5, 10, 15, 20, 50].map((km) => (
                                <Pressable
                                    key={km}
                                    onPress={() => handleSetRadius(km)}
                                    style={sx(s.chip, nearbyRadiusKm === km && s.chipActive)}
                                >
                                    <Text style={sx(s.chipText, nearbyRadiusKm === km && s.chipTextActive)}>
                                        {km} км
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    {/* Квесты */}
                    {selectedCityId && (
                        <View style={s.questsContainer}>
                            {questsAll.length === 0 && selectedCityId === NEARBY_ID ? (
                                <View style={s.emptyState}>
                                    <Ionicons name="alert-circle" size={18} color={UI.textMuted} />
                                    <Text style={s.emptyText}>
                                        Рядом ничего не найдено. Попробуйте увеличить радиус.
                                    </Text>
                                </View>
                            ) : null}

                            {chunkedQuests.map((row, rowIndex) => (
                                <View key={`quest-row-${rowIndex}`} style={s.questsRow}>
                                    {row.map((quest) => (
                                        <QuestCardLink
                                            key={quest.id}
                                            cityId={
                                                selectedCityId === NEARBY_ID
                                                    ? (quest.cityId as string)
                                                    : (selectedCityId as string)
                                            }
                                            quest={quest}
                                            nearby={selectedCityId === NEARBY_ID}
                                            isCompact={width < 740}
                                        />
                                    ))}
                                </View>
                            ))}
                        </View>
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
                           isCompact,
                       }: {
    cityId: string;
    quest: QuestMeta & { _distanceKm?: number };
    nearby?: boolean;
    isCompact?: boolean;
}) {
    const durationText = quest.durationMin
        ? `${Math.round((quest.durationMin ?? 60) / 5) * 5} мин`
        : '1–2 часа';

    return (
        <Link href={`/quests/${cityId}/${quest.id}`} asChild>
            <Pressable style={sx(s.questCard, isCompact && s.questCardCompact)}>
                {quest.cover && (
                    <View style={sx(s.coverWrap, isCompact && s.coverWrapCompact)}>
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
    heroSmall: {
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 8,
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
    mapBtnSmall: {
        alignSelf: 'stretch',
        justifyContent: 'center',
        marginTop: 8,
    },
    mapBtnTxt: { color: '#fff', fontWeight: '800' },

    citiesContainer: { gap: 12 },
    citiesRow: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    cityCard: {
        flex: 1,
        minWidth: 120,
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

    filtersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    filtersLabel: { color: UI.textLight, fontSize: 13 },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: UI.border,
        backgroundColor: UI.surface,
    },
    chipActive: { borderColor: UI.primary, backgroundColor: UI.cardAlt },
    chipText: { color: UI.textLight, fontSize: 13, fontWeight: '700' },
    chipTextActive: { color: UI.text },

    questsContainer: { gap: 20 },
    questsRow: {
        flexDirection: 'row',
        gap: 20,
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },

    emptyState: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: UI.border,
        marginBottom: 10,
    },
    emptyText: { color: UI.textMuted, fontSize: 13 },

    questCard: {
        flex: 1,
        minWidth: 300,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: UI.shadow,
        shadowOpacity: 1,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        borderWidth: 1,
        borderColor: UI.border,
        ...Platform.select({ android: { elevation: 3 } }),
    },
    // Компактная карточка на узких экранах
    questCardCompact: { minWidth: '100%' },

    coverWrap: {
        width: '100%',
        ...Platform.select({
            web: { height: 540 },       // фиксированная высота на web по умолчанию
            default: { aspectRatio: 3 / 4 },
        }),
        position: 'relative',
    },
    // Компактная обложка: убираем фикс. высоту на web и используем 16:9
    coverWrapCompact: {
        aspectRatio: 16 / 9,
        ...Platform.select({ web: { height: 'auto' } }),
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
