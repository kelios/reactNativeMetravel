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
    const isMobile = width < 480;

    // Адаптивные колонки
    const cityColumns = isMobile ? 2 : width >= 1200 ? 5 : width >= 900 ? 4 : 3;
    const questColumns = isMobile ? 1 : width >= 1100 ? 3 : 2;

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
                <View style={sx(s.wrap, isMobile && s.wrapMobile)}>
                    {/* Hero - компактный для мобильных */}
                    <View style={sx(s.hero, isMobile && s.heroMobile)}>
                        <View style={s.heroIconWrap}>
                            <Ionicons name="compass" size={isMobile ? 20 : 26} color={UI.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={sx(s.title, isMobile && s.titleMobile)}>Квесты</Text>
                            <Text style={sx(s.subtitle, isMobile && s.subtitleMobile)}>
                                Находи приключения в городах и парках
                            </Text>
                        </View>

                        <Link href="/quests/map" asChild>
                            <Pressable style={sx(s.mapBtn, isMobile && s.mapBtnMobile)}>
                                <Ionicons name="map" size={14} color="#fff" />
                                <Text style={s.mapBtnTxt}>Карта</Text>
                            </Pressable>
                        </Link>
                    </View>

                    {/* Городы - компактные карточки */}
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
                                            style={sx(s.cityCard, active && s.cityCardActive, isMobile && s.cityCardMobile)}
                                        >
                                            <Text style={sx(s.cityName, isMobile && s.cityNameMobile)}>
                                                {item.id === NEARBY_ID ? '🧭 Рядом' : item.name}
                                            </Text>
                                            <Text style={sx(s.cityCountry, isMobile && s.cityCountryMobile)}>
                                                {item.id === NEARBY_ID
                                                    ? userLoc
                                                        ? 'по геолокации'
                                                        : 'гео отключена'
                                                    : item.country === 'PL'
                                                        ? 'Польша'
                                                        : 'Беларусь'}
                                            </Text>
                                            <Text style={sx(s.questsCount, isMobile && s.questsCountMobile)}>
                                                {questsCount} кв.
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        ))}
                    </View>

                    {selectedCityId && <View style={s.divider} />}

                    {/* Фильтр радиуса для «Рядом» - компактный */}
                    {selectedCityId === NEARBY_ID && (
                        <View style={sx(s.filtersRow, isMobile && s.filtersRowMobile)}>
                            <Text style={sx(s.filtersLabel, isMobile && s.filtersLabelMobile)}>Радиус:</Text>
                            {[2, 5, 10, 15, 20].map((km) => (
                                <Pressable
                                    key={km}
                                    onPress={() => handleSetRadius(km)}
                                    style={sx(s.chip, nearbyRadiusKm === km && s.chipActive, isMobile && s.chipMobile)}
                                >
                                    <Text style={sx(s.chipText, nearbyRadiusKm === km && s.chipTextActive, isMobile && s.chipTextMobile)}>
                                        {km} км
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    {/* Квесты - компактные карточки */}
                    {selectedCityId && (
                        <View style={s.questsContainer}>
                            {questsAll.length === 0 && selectedCityId === NEARBY_ID ? (
                                <View style={s.emptyState}>
                                    <Ionicons name="alert-circle" size={16} color={UI.textMuted} />
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
                                            isMobile={isMobile}
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
                           isMobile,
                       }: {
    cityId: string;
    quest: QuestMeta & { _distanceKm?: number };
    nearby?: boolean;
    isMobile?: boolean;
}) {
    const durationText = quest.durationMin
        ? `${Math.round((quest.durationMin ?? 60) / 5) * 5} мин`
        : '1–2 часа';

    return (
        <Link href={`/quests/${cityId}/${quest.id}`} asChild>
            <Pressable style={sx(s.questCard, isMobile && s.questCardMobile)}>
                {quest.cover && (
                    <View style={sx(s.coverWrap, isMobile && s.coverWrapMobile)}>
                        <Image source={quest.cover} style={s.questCover} resizeMode="cover" />
                        <View style={sx(s.coverOverlay, isMobile && s.coverOverlayMobile)}>
                            <Text style={sx(s.questTitle, isMobile && s.questTitleMobile)} numberOfLines={2}>
                                {quest.title}
                            </Text>
                            <View style={sx(s.questMetaRow, isMobile && s.questMetaRowMobile)}>
                                <View style={s.metaItem}>
                                    <Ionicons name="navigate" size={12} color="#fff" />
                                    <Text style={sx(s.metaText, isMobile && s.metaTextMobile)}>{quest.points}</Text>
                                </View>
                                <View style={s.metaItem}>
                                    <Ionicons name="time" size={12} color="#fff" />
                                    <Text style={sx(s.metaText, isMobile && s.metaTextMobile)}>{durationText}</Text>
                                </View>
                                {nearby && typeof quest._distanceKm === 'number' && (
                                    <View style={s.metaItem}>
                                        <Ionicons name="walk" size={12} color="#fff" />
                                        <Text style={sx(s.metaText, isMobile && s.metaTextMobile)}>
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
    scrollContent: { flexGrow: 1, paddingBottom: 60 },

    wrap: {
        width: '100%',
        maxWidth: 1100,
        alignSelf: 'center',
        padding: 16
    },
    wrapMobile: {
        padding: 12
    },

    hero: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: UI.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: UI.border,
        marginBottom: 16,
    },
    heroMobile: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 12,
    },
    heroIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: UI.cardAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { color: UI.text, fontSize: 22, fontWeight: '800' },
    titleMobile: { fontSize: 18 },
    subtitle: { color: UI.textLight, fontSize: 14, marginTop: 2 },
    subtitleMobile: { fontSize: 12 },
    mapBtn: {
        flexDirection: 'row',
        gap: 6,
        backgroundColor: UI.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    mapBtnMobile: {
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    mapBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },

    citiesContainer: { gap: 8 },
    citiesRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    cityCard: {
        flex: 1,
        minWidth: 100,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: UI.border,
        backgroundColor: UI.surface,
    },
    cityCardMobile: {
        minWidth: 80,
        padding: 10,
        borderRadius: 10,
    },
    cityCardActive: { borderColor: UI.primary, backgroundColor: UI.cardAlt },
    cityName: { color: UI.text, fontSize: 15, fontWeight: '800' },
    cityNameMobile: { fontSize: 13 },
    cityCountry: { color: UI.textLight, fontSize: 12, marginBottom: 8 },
    cityCountryMobile: { fontSize: 11, marginBottom: 6 },
    questsCount: { color: UI.textLight, fontSize: 12, fontWeight: '700' },
    questsCountMobile: { fontSize: 11 },

    divider: { height: 1, backgroundColor: UI.divider, marginVertical: 16 },

    filtersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    filtersRowMobile: {
        gap: 4,
        marginBottom: 6,
    },
    filtersLabel: { color: UI.textLight, fontSize: 13 },
    filtersLabelMobile: { fontSize: 12 },
    chip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: UI.border,
        backgroundColor: UI.surface,
    },
    chipMobile: {
        paddingHorizontal: 6,
        paddingVertical: 3,
    },
    chipActive: { borderColor: UI.primary, backgroundColor: UI.cardAlt },
    chipText: { color: UI.textLight, fontSize: 12, fontWeight: '700' },
    chipTextMobile: { fontSize: 11 },
    chipTextActive: { color: UI.text },

    questsContainer: { gap: 12 },
    questsRow: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },

    emptyState: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: UI.border,
        marginBottom: 8,
    },
    emptyText: { color: UI.textMuted, fontSize: 12 },

    questCard: {
        flex: 1,
        minWidth: 280,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: UI.shadow,
        shadowOpacity: 1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        borderWidth: 1,
        borderColor: UI.border,
        ...Platform.select({ android: { elevation: 2 } }),
    },
    questCardMobile: {
        minWidth: '100%',
        borderRadius: 14,
    },

    coverWrap: {
        width: '100%',
        aspectRatio: 16/9,
        position: 'relative',
    },
    coverWrapMobile: {
        aspectRatio: 16/9,
    },

    questCover: { width: '100%', height: '100%' },
    coverOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    coverOverlayMobile: {
        padding: 10,
    },
    questTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 4 },
    questTitleMobile: { fontSize: 14, marginBottom: 3 },
    questMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    questMetaRowMobile: { gap: 8 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    metaTextMobile: { fontSize: 11 },
});