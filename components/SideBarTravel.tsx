// SideBarTravel.tsx

import React, { memo, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Travel } from '@/src/types/types';

type SideBarTravelProps = {
    handlePress: (ref: React.RefObject<View>) => () => void;
    closeMenu: () => void;
    isMobile: boolean;
    travel: Travel;
    refs: {
        galleryRef: React.RefObject<View>;
        descriptionRef: React.RefObject<View>;
        mapRef: React.RefObject<View>;
        pointsRef: React.RefObject<View>;
        nearRef: React.RefObject<View>;
        popularRef: React.RefObject<View>;
    };
};

const SideBarTravel: React.FC<SideBarTravelProps> = memo(({ handlePress, closeMenu, isMobile, travel, refs }) => {
    const theme = useTheme();

    const handlePressUserTravel = useCallback(() => {
        const url = `/?user_id=${travel.userIds}`;
        Linking.openURL(url);
    }, [travel.userIds]);

    const gallery =
        process.env.EXPO_PUBLIC_IS_LOCAL_API === 'true'
            ? travel.gallery
            : (travel.gallery || []).map((item) => item?.url);

    return (
        <View style={styles.sideMenu}>
            {gallery?.length > 0 && (
                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => {
                        handlePress(refs.galleryRef)();
                        if (isMobile) closeMenu();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Перейти к галерее"
                >
                    <MaterialIcons name="photo-library" size={24} color="#6B4F4F" />
                    <Text style={styles.linkText}>Галерея</Text>
                </TouchableOpacity>
            )}

            {travel.description && (
                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => {
                        handlePress(refs.descriptionRef)();
                        if (isMobile) closeMenu();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Перейти к описанию"
                >
                    <MaterialIcons name="description" size={24} color="#6B4F4F" />
                    <Text style={styles.linkText}>Описание</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => {
                    handlePress(refs.mapRef)();
                    if (isMobile) closeMenu();
                }}
                accessibilityRole="button"
                accessibilityLabel="Перейти к карте"
            >
                <MaterialIcons name="map" size={24} color="#6B4F4F" />
                <Text style={styles.linkText}>Карта</Text>
            </TouchableOpacity>

            {travel.travelAddress && (
                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => {
                        handlePress(refs.pointsRef)();
                        if (isMobile) closeMenu();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Перейти к координатам мест"
                >
                    <MaterialIcons name="list" size={24} color="#6B4F4F" />
                    <Text style={styles.linkText}>Координаты мест</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => {
                    handlePress(refs.nearRef)();
                    if (isMobile) closeMenu();
                }}
                accessibilityRole="button"
                accessibilityLabel="Перейти к близким маршрутам"
            >
                <MaterialIcons name="location-on" size={24} color="#6B4F4F" />
                <Text style={styles.linkText}>Рядом (~60км) можно еще посмотреть...</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => {
                    handlePress(refs.popularRef)();
                    if (isMobile) closeMenu();
                }}
                accessibilityRole="button"
                accessibilityLabel="Перейти к популярным маршрутам"
            >
                <MaterialIcons name="star" size={24} color="#6B4F4F" />
                <Text style={styles.linkText}>Популярные маршруты</Text>
            </TouchableOpacity>

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
                <View style={styles.viewerCount}>
                    <MaterialIcons name="visibility" size={20} color="#6B4F4F" />
                    <Text style={[styles.viewerText, { color: theme.colors.text }]}>
                        {travel.countUnicIpView}
                    </Text>
                </View>
                <TouchableOpacity onPress={handlePressUserTravel} accessibilityRole="button" accessibilityLabel={`Все путешествия ${travel.userName}`}>
                    <Text style={[styles.userTravelText, { color: '#6B4F4F' }]}>
                        Все путешествия {travel.userName}
                    </Text>
                </TouchableOpacity>

                <View style={styles.textContainer}>
                    <Text style={[styles.infoText, { color: theme.colors.text }]}>
                        {travel.year} {travel.monthName}
                    </Text>
                    <Text style={[styles.infoText, { color: theme.colors.text }]}>{travel.countryName}</Text>
                    <Text style={[styles.infoText, { color: theme.colors.text }]}>{travel.cityName}</Text>
                    {travel.number_days && (
                        <Text style={[styles.infoText, { color: theme.colors.text }]}>
                            Количество дней - {travel.number_days}
                        </Text>
                    )}
                </View>
            </View>

            {isMobile && (
                <TouchableOpacity style={styles.closeButton} onPress={closeMenu} accessibilityRole="button" accessibilityLabel="Закрыть меню">
                    <Text style={styles.closeButtonText}>Закрыть</Text>
                </TouchableOpacity>
            )}
        </View>
    ); // Закрытие return

}); // Закрытие memo

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
    },
    linkText: {
        color: '#6B4F4F',
        fontSize: 16,
        marginLeft: 15,
        fontFamily: 'Georgia',
    },
    closeButton: {
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#6B4F4F',
        borderRadius: 8,
        marginTop: 30,
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
});

export default SideBarTravel;
