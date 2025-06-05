import React, {memo, Suspense, useCallback, useMemo, useState} from 'react';
import {
    View,
    StyleSheet,
    Linking,
    Pressable,
    ScrollView,
    Image,
    Platform,
    useWindowDimensions, ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import type { Travel } from '@/src/types/types';
import WeatherWidget from "@/components/WeatherWidget";

const Fallback = () => (
    <View style={styles.fallback}>
        <ActivityIndicator size="small" color="#6B4F4F" />
    </View>
);

/* -------------------------------- helpers -------------------------------- */
const openUrl = (url: string) =>
    Platform.OS === 'web' ? (window.location.href = url) : Linking.openURL(url);

/* -------------------------------- types ---------------------------------- */
type SideBarProps = {
    refs: Record<string, React.RefObject<View>>;
    travel: Travel;
    isMobile: boolean;
    onNavigate: (key: keyof SideBarProps['refs']) => void;
    closeMenu: () => void;
    isSuperuser: boolean;
    storedUserId?: string | null;
};

/* ------------------------------- component ------------------------------- */
function CompactSideBarTravel({
                                  refs,
                                  travel,
                                  isMobile,
                                  onNavigate,
                                  closeMenu,
                                  isSuperuser,
                                  storedUserId,
                              }: SideBarProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768 && width < 1024;

    /* active link highlight */
    const [active, setActive] = useState<string>('');
    const setActiveAndNavigate = useCallback(
        (key: keyof typeof refs) => {
            setActive(key);
            onNavigate(key);
        },
        [onNavigate],
    );

    /* edit rights */
    const canEdit = isSuperuser || storedUserId === String(travel.userIds);

    /* links config */
    const links = useMemo(() => [
        travel.gallery?.length ? { k: 'gallery', icon: 'photo-library', label: 'Галерея' } : null,
        travel.youtube_link ? { k: 'video', icon: 'ondemand-video', label: 'Видео' } : null,
        travel.description ? { k: 'description', icon: 'description', label: 'Описание' } : null,
        travel.recommendation ? { k: 'recommendation', icon: 'recommend', label: 'Рекомендации' } : null,
        travel.plus ? { k: 'plus', icon: 'add', label: 'Плюсы' } : null,
        travel.minus ? { k: 'minus', icon: 'remove', label: 'Минусы' } : null,
        { k: 'map', icon: 'map', label: 'Карта' },
        travel.travelAddress ? { k: 'points', icon: 'list', label: 'Координаты' } : null,
        { k: 'near', icon: 'location-on', label: 'Рядом (~60км)' },
        { k: 'popular', icon: 'star', label: 'Популярное' },
    ].filter(Boolean), [travel]);

    /* open profile route */
    const handleUserTravels = () => openUrl(`/?user_id=${travel.userIds}`);
    const handleEdit = () => canEdit && openUrl(`/travel/${travel.id}`);

    return (
        <View style={styles.root}>
            <ScrollView
                style={[styles.menu, { width: isMobile ? '100%' : isTablet ? 240 : 280 }]}
                contentContainerStyle={{ paddingBottom: isMobile ? 80 : 40 }}
            >
                {/* card */}
                <View style={styles.card}>
                    <View style={styles.cardRow}>
                        <View style={styles.avatarWrap}>
                            {travel.travel_image_thumb_small_url ? (
                                <Image source={{ uri: travel.travel_image_thumb_small_url }} style={styles.avatar} />
                            ) : (
                                <MaterialIcons name="image" size={60} color="#ccc" />
                            )}
                            <View style={styles.viewsRow}>
                                <Feather name="eye" size={14} color="#2F332E" />
                                <Text style={styles.viewsTxt}>{travel.countUnicIpView}</Text>
                            </View>
                        </View>

                        <View style={{ flex: 1 }}>
                            <View style={styles.userRow}>
                                <Text style={styles.userName} numberOfLines={1}>{`${travel.userName} | ${travel.countryName}`}</Text>
                                {canEdit && (
                                    <Pressable onPress={handleEdit} hitSlop={6}><MaterialIcons name="edit" size={18} color="#2F332E" /></Pressable>
                                )}
                            </View>
                            <Text style={styles.userYear}>{`${travel.monthName} ${travel.year}`}</Text>
                            <Text style={styles.userDays}>{`• ${travel.number_days} дн.`}</Text>
                        </View>
                    </View>
                </View>

                {/* nav links */}
                {links.map(({ k, icon, label }) => (
                    <Pressable
                        key={k}
                        style={({ pressed }) => [styles.link, (active === k) && styles.linkActive, pressed && styles.linkPressed]}
                        onPress={() => setActiveAndNavigate(k as keyof typeof refs)}
                    >
                        <MaterialIcons name={icon as any} size={isTablet ? 22 : 20} color="#2F332E" />
                        <Text style={[styles.linkTxt, isTablet && { fontSize: 15 }]}>{label}</Text>
                    </Pressable>
                ))}

                {/* all travels */}
                <Pressable onPress={handleUserTravels}><Text style={styles.allTravels}>Путешествия {travel.userName}</Text></Pressable>
                <Suspense fallback={<Fallback />}>
                    <WeatherWidget points={travel.travelAddress} />
                </Suspense>
            </ScrollView>

            {/* close btn mobile */}
            {isMobile && (
                <View style={styles.closeBar}>
                    <Pressable onPress={closeMenu} style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}>
                        <MaterialIcons name="close" size={20} color="#fff" />
                        <Text style={styles.closeTxt}>Закрыть</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

export default memo(CompactSideBarTravel);

/* ---------------------------- styles ---------------------------- */
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#fff' },
    menu: { paddingTop: 16, alignSelf: 'center', paddingHorizontal: 16, maxWidth: 320 },
    card: {
        backgroundColor: '#c9d0bc',
        borderRadius: 16,
        padding: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    cardRow: { flexDirection: 'row', alignItems: 'center' },
    avatarWrap: { marginRight: 12, alignItems: 'center' },
    avatar: { width: 60, height: 60, borderRadius: 30 },
    viewsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    viewsTxt: { marginLeft: 4, fontSize: 12, color: '#2F332E', fontFamily: 'Georgia' },
    userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    userName: { fontSize: 15, fontWeight: 'bold', color: '#2F332E', fontFamily: 'Georgia', flexShrink: 1 },
    userYear: { fontSize: 15, fontWeight: 'bold', color: '#2F332E', fontFamily: 'Georgia', marginTop: 2 },
    userDays: { fontSize: 13, color: '#677069', marginTop: 4, fontFamily: 'Georgia' },
    link: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 6, borderRadius: 8, marginBottom: 6 },
    linkPressed: { backgroundColor: '#F4E1C7' },
    linkActive: { backgroundColor: '#F4E1C7' },
    linkTxt: { marginLeft: 10, fontSize: 14, fontFamily: 'Georgia', color: '#2F332E' },
    allTravels: { marginTop: 20, fontSize: 14, textAlign: 'center', fontWeight: '500', color: '#B87034', fontFamily: 'Georgia' },
    closeBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#2F332E', paddingVertical: 16, alignItems: 'center' },
    closeBtn: { flexDirection: 'row', alignItems: 'center' },
    closeBtnPressed: { opacity: 0.7 },
    closeTxt: { color: '#fff', fontSize: 16, fontFamily: 'Georgia', marginLeft: 8 },
    fallback: {
        paddingVertical: 40,
        alignItems: 'center',
    },
});