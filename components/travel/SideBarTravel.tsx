import React, { memo, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Linking,
    Image,
    useWindowDimensions,
    Pressable,
    ScrollView,
    Platform
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Travel } from '@/src/types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SideBarTravelProps = {
    handlePress: (ref: React.RefObject<View>) => () => void;
    closeMenu: () => void;
    isMobile: boolean;
    travel: Travel;
    refs: {
        galleryRef: React.RefObject<View>;
        videoRef: React.RefObject<View>;
        descriptionRef: React.RefObject<View>;
        mapRef: React.RefObject<View>;
        pointsRef: React.RefObject<View>;
        nearRef: React.RefObject<View>;
        popularRef: React.RefObject<View>;
        recommendationRef: React.RefObject<View>;
        plusRef: React.RefObject<View>;
        minusRef: React.RefObject<View>;
    };
    isSuperuser: boolean;
    storedUserId?: string;
};

const SideBarTravel: React.FC<SideBarTravelProps> = memo(
    ({ handlePress, closeMenu, isMobile, travel, refs, isSuperuser, storedUserId }) => {
        const theme = useTheme();
        const { width } = useWindowDimensions();
        const isSmallScreen = width < 768;

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
            icon: keyof typeof MaterialIcons.glyphMap,
            label: string,
            ref: React.RefObject<View>
        ) => (
            <Pressable
                style={({ pressed }) => [
                    styles.linkButton,
                    pressed && styles.linkButtonPressed,
                ]}
                onPress={() => {
                    handlePress(ref)();
                    if (isMobile) closeMenu();
                }}
                accessibilityRole="button"
                accessibilityLabel={label}
            >
                <MaterialIcons name={icon} size={24} color="#6B4F4F" />
                <Text style={styles.linkText}>{label}</Text>
            </Pressable>
        );

        return (
            <View style={styles.container}>
                <ScrollView style={[styles.sideMenu, { width: isSmallScreen ? '100%' : 300 }]}>
                    {travel.gallery?.length > 0 && renderLink('photo-library', 'Галерея', refs.galleryRef)}
                    {travel.youtube_link && renderLink('ondemand-video', 'Видео', refs.videoRef)}
                    {travel.description && renderLink('description', 'Описание', refs.descriptionRef)}
                    {travel.recommendation && renderLink('recommend', 'Рекомендации', refs.recommendationRef)}
                    {travel.plus && renderLink('add', 'Плюсы', refs.plusRef)}
                    {travel.minus && renderLink('remove', 'Минусы', refs.minusRef)}
                    {renderLink('map', 'Карта', refs.mapRef)}
                    {travel.travelAddress && renderLink('list', 'Координаты мест', refs.pointsRef)}
                    {renderLink('location-on', 'Рядом (~60км)...', refs.nearRef)}
                    {renderLink('star', 'Популярные маршруты', refs.popularRef)}

                    <View style={styles.userInfo}>
                        <View style={styles.imageWrapper}>
                            {travel.travel_image_thumb_small_url ? (
                                <Image
                                    source={{ uri: travel.travel_image_thumb_small_url }}
                                    style={styles.image}
                                    accessibilityLabel="Изображение путешественника"
                                />
                            ) : (
                                <MaterialIcons name="image" size={100} color="#ccc" />
                            )}
                        </View>

                        {canEdit && (
                            <Pressable
                                style={({ pressed }) => [
                                    styles.editButton,
                                    pressed && styles.editButtonPressed,
                                ]}
                                onPress={handleEditPress}
                            >
                                <MaterialIcons name="edit" size={20} color="#ffffff" />
                                <Text style={styles.editButtonText}>Редактировать</Text>
                            </Pressable>
                        )}

                        <View style={styles.viewerCount}>
                            <MaterialIcons name="visibility" size={20} color="#6B4F4F" />
                            <Text style={[styles.viewerText, { color: theme.colors.text }]}>
                                {travel.countUnicIpView}
                            </Text>
                        </View>

                        <Pressable onPress={handlePressUserTravel}>
                            <Text style={[styles.userTravelText, { color: '#6B4F4F' }]}>
                                Все путешествия {travel.userName}
                            </Text>
                        </Pressable>

                        <View style={styles.textContainer}>
                            <Text style={[styles.infoText, { color: theme.colors.text }]}>
                                {travel?.year} {travel?.monthName}
                            </Text>
                            <Text style={[styles.infoText, { color: theme.colors.text }]}>
                                {travel.countryName}
                            </Text>
                            <Text style={[styles.infoText, { color: theme.colors.text }]}>
                                {travel.cityName}
                            </Text>
                            {travel.number_days && (
                                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                                    Количество дней - {travel.number_days}
                                </Text>
                            )}
                        </View>
                    </View>
                </ScrollView>

                {isMobile && (
                    <View style={styles.fixedCloseButton}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.closeButton,
                                pressed && styles.closeButtonPressed,
                            ]}
                            onPress={closeMenu}
                        >
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
        position: 'relative',
    },
    fixedCloseButton: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderColor: '#ddd',
        zIndex: 10000,
    },
    sideMenu: {
        padding: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#f8f8f8',
    },
    linkButtonPressed: {
        backgroundColor: '#e0e0e0',
    },
    linkText: {
        color: '#6B4F4F',
        fontSize: 16,
        marginLeft: 15,
        fontFamily: 'Georgia',
        flexShrink: 1, // Текст будет сжиматься, если не хватает места
    },
    closeButton: {
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#6B4F4F',
        borderRadius: 8,
        marginTop: 30,
    },
    closeButtonPressed: {
        backgroundColor: '#5a3f3f',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Georgia',
    },
    imageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        marginTop: 20,
        marginBottom: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    viewerCount: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    viewerText: {
        marginLeft: 5,
    },
    userTravelText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Georgia',
    },
    textContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    infoText: {
        fontSize: 14,
        fontFamily: 'Georgia',
    },
    userInfo: {
        marginTop: 20,
        alignItems: 'center',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        marginVertical: 10,
        backgroundColor: '#6B4F4F',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        elevation: 3,
    },
    editButtonPressed: {
        backgroundColor: '#5a3f3f',
    },
    editButtonText: {
        color: '#ffffff',
        fontSize: 15,
        marginLeft: 8,
        fontFamily: 'Georgia',
        fontWeight: '500',
    },
});

export default SideBarTravel;