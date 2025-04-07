import React, { memo, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Linking,
    Image,
    useWindowDimensions,
    Pressable,
    ScrollView,
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
        const isSmallScreen = width < 768; // Определение мобильного устройства

        const handlePressUserTravel = useCallback(() => {
            const url = `/?user_id=${travel.userIds}`;
            Linking.openURL(url);
        }, [travel.userIds]);

        const handleEditPress = useCallback(() => {
            const url = `/travel/${travel.id}`;
            Linking.openURL(url);
        }, [travel.id]);

        const gallery = travel.gallery;

        const canEdit = isSuperuser || storedUserId === travel.userIds?.toString();

        return (
            <ScrollView style={[styles.sideMenu, { width: isSmallScreen ? '100%' : 300 }]}>
                {gallery?.length > 0 && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.linkButton,
                            pressed && styles.linkButtonPressed,
                        ]}
                        onPress={() => {
                            handlePress(refs.galleryRef)();
                            if (isMobile) closeMenu();
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Перейти к галерее"
                    >
                        <MaterialIcons name="photo-library" size={24} color="#6B4F4F" />
                        <Text style={styles.linkText}>Галерея</Text>
                    </Pressable>
                )}

                {travel.youtube_link && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.linkButton,
                            pressed && styles.linkButtonPressed,
                        ]}
                        onPress={() => {
                            handlePress(refs.videoRef)();
                            if (isMobile) closeMenu();
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Видео"
                    >
                        <MaterialIcons name="ondemand-video" size={24} color="#6B4F4F" />
                        <Text style={styles.linkText}>Видео</Text>
                    </Pressable>
                )}

                {travel.description && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.linkButton,
                            pressed && styles.linkButtonPressed,
                        ]}
                        onPress={() => {
                            handlePress(refs.descriptionRef)();
                            if (isMobile) closeMenu();
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Перейти к описанию"
                    >
                        <MaterialIcons name="description" size={24} color="#6B4F4F" />
                        <Text style={styles.linkText}>Описание</Text>
                    </Pressable>
                )}

                {travel.recommendation && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.linkButton,
                            pressed && styles.linkButtonPressed,
                        ]}
                        onPress={() => {
                            handlePress(refs.recommendationRef)();
                            if (isMobile) closeMenu();
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Перейти к рекомендациям"
                    >
                        <MaterialIcons name="recommend" size={24} color="#6B4F4F" />
                        <Text style={styles.linkText}>Рекомендации</Text>
                    </Pressable>
                )}

                {travel.plus && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.linkButton,
                            pressed && styles.linkButtonPressed,
                        ]}
                        onPress={() => {
                            handlePress(refs.plusRef)();
                            if (isMobile) closeMenu();
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Перейти к плюсам"
                    >
                        <MaterialIcons name="add" size={24} color="#6B4F4F" />
                        <Text style={styles.linkText}>Плюсы</Text>
                    </Pressable>
                )}

                {travel.minus && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.linkButton,
                            pressed && styles.linkButtonPressed,
                        ]}
                        onPress={() => {
                            handlePress(refs.minusRef)();
                            if (isMobile) closeMenu();
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Перейти к минусам"
                    >
                        <MaterialIcons name="remove" size={24} color="#6B4F4F" />
                        <Text style={styles.linkText}>Минусы</Text>
                    </Pressable>
                )}

                <Pressable
                    style={({ pressed }) => [
                        styles.linkButton,
                        pressed && styles.linkButtonPressed,
                    ]}
                    onPress={() => {
                        handlePress(refs.mapRef)();
                        if (isMobile) closeMenu();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Перейти к карте"
                >
                    <MaterialIcons name="map" size={24} color="#6B4F4F" />
                    <Text style={styles.linkText}>Карта</Text>
                </Pressable>

                {travel.travelAddress && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.linkButton,
                            pressed && styles.linkButtonPressed,
                        ]}
                        onPress={() => {
                            handlePress(refs.pointsRef)();
                            if (isMobile) closeMenu();
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Перейти к координатам мест"
                    >
                        <MaterialIcons name="list" size={24} color="#6B4F4F" />
                        <Text style={styles.linkText}>Координаты мест</Text>
                    </Pressable>
                )}

                <Pressable
                    style={({ pressed }) => [
                        styles.linkButton,
                        pressed && styles.linkButtonPressed,
                    ]}
                    onPress={() => {
                        handlePress(refs.nearRef)();
                        if (isMobile) closeMenu();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Перейти к близким маршрутам"
                >
                    <MaterialIcons name="location-on" size={24} color="#6B4F4F" />
                    <Text style={styles.linkText}>Рядом (~60км) можно еще посмотреть...</Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        styles.linkButton,
                        pressed && styles.linkButtonPressed,
                    ]}
                    onPress={() => {
                        handlePress(refs.popularRef)();
                        if (isMobile) closeMenu();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Перейти к популярным маршрутам"
                >
                    <MaterialIcons name="star" size={24} color="#6B4F4F" />
                    <Text style={styles.linkText}>Популярные маршруты</Text>
                </Pressable>

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
                            accessibilityRole="button"
                            accessibilityLabel="Редактировать статью"
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
                    <Pressable
                        onPress={handlePressUserTravel}
                        accessibilityRole="button"
                        accessibilityLabel={`Все путешествия ${travel.userName}`}
                    >
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

                {isMobile && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.closeButton,
                            pressed && styles.closeButtonPressed,
                        ]}
                        onPress={closeMenu}
                        accessibilityRole="button"
                        accessibilityLabel="Закрыть меню"
                    >
                        <Text style={styles.closeButtonText}>Закрыть</Text>
                    </Pressable>
                )}
            </ScrollView>
        );
    }
);

const styles = StyleSheet.create({
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