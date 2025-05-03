// Исправленная версия CompactSideBarTravel с корректным отображением кнопки закрытия на мобильных устройствах

import React, { memo, useCallback, useState } from 'react';
import {
    View,
    StyleSheet,
    Linking,
    Image,
    useWindowDimensions,
    Pressable,
    ScrollView,
    Platform,
    findNodeHandle
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Travel } from '@/src/types/types';

const sectionKeys = ['content', 'info', 'rating', 'map'];

const scrollToRef = (ref: React.RefObject<View>) => {
    if (Platform.OS === 'web' && ref.current) {
        const el = findNodeHandle(ref.current) as HTMLElement;
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

type SideBarTravelProps = {
    handlePress: (ref: React.RefObject<View>) => () => void;
    closeMenu: () => void;
    isMobile: boolean;
    travel: Travel;
    refs: any;
    isSuperuser: boolean;
    storedUserId?: string;
};

const CompactSideBarTravel: React.FC<SideBarTravelProps> = memo(
    ({ handlePress, closeMenu, isMobile, travel, refs, isSuperuser, storedUserId }) => {
        const theme = useTheme();
        const { width } = useWindowDimensions();
        const isSmallScreen = width < 768;
        const isTablet = width >= 768 && width < 1024;

        const [activeRefKey, setActiveRefKey] = useState<string | null>(null);

        const handleLinkPress = (refKey: string, ref: React.RefObject<View>) => {
            setActiveRefKey(refKey);
            scrollToRef(ref);
            handlePress(ref)();
            if (isMobile) closeMenu();
        };

        const handlePressUserTravel = useCallback(() => {
            const url = `/?user_id=${travel.userIds}`;
            Platform.OS === 'web' ? (window.location.href = url) : Linking.openURL(url);
        }, [travel.userIds]);

        const handleEditPress = useCallback(() => {
            const url = `/travel/${travel.id}`;
            Platform.OS === 'web' ? (window.location.href = url) : Linking.openURL(url);
        }, [travel.id]);

        const canEdit = isSuperuser || storedUserId === travel.userIds?.toString();

        const renderLink = (
            key: string,
            icon: keyof typeof MaterialIcons.glyphMap,
            label: string,
            ref: React.RefObject<View>
        ) => (
            <Pressable
                key={key}
                style={({ pressed }) => [
                    styles.linkButton,
                    activeRefKey === key && styles.linkButtonActive,
                    pressed && styles.linkButtonPressed,
                ]}
                onPress={() => handleLinkPress(key, ref)}
            >
                <MaterialIcons name={icon} size={isTablet ? 22 : 20} color="#2F332E" />
                <Text style={[styles.linkText, isTablet && { fontSize: 15 }]}>{label}</Text>
            </Pressable>
        );

        return (
            <View style={styles.container}>
                <ScrollView
                    style={[styles.sideMenu, {
                        width: isSmallScreen ? '100%' : isTablet ? 240 : 280,
                        paddingHorizontal: isSmallScreen ? 12 : 16,
                        maxWidth: 320,
                        alignSelf: 'center',
                        marginBottom: isMobile ? 60 : 0, // Добавлен отступ для кнопки закрытия
                    }]}
                    contentContainerStyle={{ paddingBottom: isMobile ? 80 : 40 }} // Увеличен paddingBottom
                >
                    <View style={styles.userCard}>
                        <View style={styles.userHeader}>
                            <View style={styles.avatarContainer}>
                                {travel.travel_image_thumb_small_url ? (
                                    <Image
                                        source={{ uri: travel.travel_image_thumb_small_url }}
                                        style={styles.avatar}
                                        accessibilityLabel="Фото путешествия"
                                    />
                                ) : (
                                    <MaterialIcons name="image" size={60} color="#ccc" />
                                )}
                            </View>
                            <View style={styles.userInfoBlock}>
                                <View style={styles.userInfoRow}>
                                    <Text style={styles.compactUser}>
                                        {travel.userName} | {travel.countryName}
                                    </Text>
                                    {canEdit && (
                                        <Pressable style={styles.editIcon} onPress={handleEditPress}>
                                            <MaterialIcons name="edit" size={18} color="#2F332E" />
                                        </Pressable>
                                    )}
                                </View>
                                <Text style={styles.compactUserYear}>{travel.monthName} {travel.year}</Text>
                                <Text style={styles.secondaryText}>
                                    {travel.cityName} • {travel.number_days} дн.
                                </Text>
                            </View>
                        </View>
                    </View>

                    {travel.gallery?.length > 0 && renderLink('gallery', 'photo-library', 'Галерея', refs.galleryRef)}
                    {travel.youtube_link && renderLink('video', 'ondemand-video', 'Видео', refs.videoRef)}
                    {travel.description && renderLink('description', 'description', 'Описание', refs.descriptionRef)}
                    {travel.recommendation && renderLink('recommend', 'recommend', 'Рекомендации', refs.recommendationRef)}
                    {travel.plus && renderLink('plus', 'add', 'Плюсы', refs.plusRef)}
                    {travel.minus && renderLink('minus', 'remove', 'Минусы', refs.minusRef)}
                    {renderLink('map', 'map', 'Карта', refs.mapRef)}
                    {travel.travelAddress && renderLink('points', 'list', 'Координаты мест', refs.pointsRef)}
                    {renderLink('near', 'location-on', 'Рядом (~60км)...', refs.nearRef)}
                    {renderLink('popular', 'star', 'Популярные маршруты', refs.popularRef)}

                    <Pressable onPress={handlePressUserTravel}>
                        <Text style={styles.allTravelsLink}>Путешествия {travel.userName}</Text>
                    </Pressable>
                </ScrollView>

                {isMobile && (
                    <View style={styles.fixedCloseButton}>
                        <Pressable
                            onPress={closeMenu}
                            style={({ pressed }) => [
                                styles.closeButton,
                                pressed && styles.closeButtonPressed
                            ]}
                        >
                            <MaterialIcons name="close" size={20} color="#fff" />
                            <Text style={styles.closeButtonText}>Закрыть</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    sideMenu: {
        paddingTop: 16,
    },
    userCard: {
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
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        backgroundColor: '#D9D9D6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    userInfoBlock: {
        flex: 1,
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    compactUser: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2F332E',
        fontFamily: 'Georgia',
        flexShrink: 1,
    },
    compactUserYear: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2F332E',
        fontFamily: 'Georgia',
        marginTop: 2,
    },
    secondaryText: {
        fontSize: 13,
        color: '#677069',
        marginTop: 4,
        fontFamily: 'Georgia',
    },
    editIcon: {
        paddingLeft: 6,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 8,
        marginBottom: 6,
    },
    linkButtonPressed: {
        backgroundColor: '#F4E1C7',
    },
    linkButtonActive: {
        backgroundColor: '#F4E1C7',
    },
    linkText: {
        marginLeft: 10,
        fontSize: 14,
        fontFamily: 'Georgia',
        color: '#2F332E',
    },
    allTravelsLink: {
        marginTop: 20,
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
        color: '#B87034',
        fontFamily: 'Georgia',
    },
    fixedCloseButton: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#2F332E',
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    closeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    closeButtonPressed: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Georgia',
        marginLeft: 8,
    },
});

export default CompactSideBarTravel;