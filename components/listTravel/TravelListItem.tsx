import React, { memo, useState } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Image,
    Platform,
} from 'react-native';
import { Card } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Flag from 'react-world-flags';

const placeholderImage = require('@/assets/placeholder.png');

const TravelListItem = ({
                            travel,
                            currentUserId,
                            isSuperuser,
                            isMetravel,
                            onEditPress,
                            onDeletePress,
                            isMobile,
                            index = 0, // 👈 чтобы мы могли не lazy-грузить первые карточки
                        }) => {
    const {
        id,
        slug,
        travel_image_thumb_url,
        name,
        countryName = '',
        userName,
        countUnicIpView = 0,
    } = travel;

    const countries = countryName ? countryName.split(',').map((c) => c.trim()) : [];
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const canEdit = isMetravel || isSuperuser;

    const CARD_HEIGHT = isMobile ? 320 : 460;
    const IMAGE_HEIGHT = isMobile ? 200 : 340;

    const handlePress = () => {
        router.push(`/travels/${slug}`);
    };

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
                styles.pressableContainer,
                { opacity: pressed ? 0.9 : 1 },
            ]}
        >
            <Card style={[styles.card, { height: CARD_HEIGHT }]}>
                <View style={[styles.imageContainer, { height: IMAGE_HEIGHT }]}>
                    {!imageError && travel_image_thumb_url ? (
                        Platform.OS === 'web' ? (
                            <img
                                src={travel_image_thumb_url}
                                alt={name}
                                loading={index === 0 ? 'eager' : 'lazy'}
                                decoding="async"
                                width="100%"
                                height={IMAGE_HEIGHT}
                                onError={() => setImageError(true)}
                                onLoad={() => setImageLoaded(true)}
                                style={styles.webImage}
                            />
                        ) : (
                            <Image
                                source={{ uri: travel_image_thumb_url }}
                                style={styles.image}
                                resizeMode="cover"
                                onLoad={() => setImageLoaded(true)}
                                onError={() => setImageError(true)}
                            />
                        )
                    ) : (
                        <View style={styles.noImage}>
                            <Image source={placeholderImage} style={styles.noImageIcon} resizeMode="contain" />
                            <Text style={styles.noImageText}>Нет изображения</Text>
                        </View>
                    )}

                    {canEdit && (
                        <View style={styles.actions}>
                            <Pressable onPress={() => onEditPress(id)} style={styles.iconButton}>
                                <Feather name="edit" size={18} color="#333" />
                            </Pressable>
                            <Pressable onPress={() => onDeletePress(id)} style={styles.iconButton}>
                                <Feather name="trash-2" size={18} color="#333" />
                            </Pressable>
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    {countries.length > 0 && (
                        <View style={styles.countryContainer}>
                            {countries.map((country, index) => (
                                <View style={styles.countryItem} key={index}>
                                    <Flag code={country.toUpperCase()} style={styles.flagIcon} />
                                    <Text style={styles.countryText}>{country}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                    <Text style={styles.title} numberOfLines={1}>{name}</Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaText}>👤 {userName || 'Неизвестно'}</Text>
                        <Text style={styles.metaText}>👁 {countUnicIpView ?? 0}</Text>
                    </View>
                </View>
            </Card>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    pressableContainer: {
        padding: 8,
        width: '100%',
    },
    card: {
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 0,
        backgroundColor: '#fff',
        width: '100%',
        alignSelf: 'center',
        elevation: 5,
        ...Platform.select({
            web: {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            },
            android: { elevation: 3 },
        }),
    },
    imageContainer: {
        width: '100%',
        position: 'relative',
        backgroundColor: '#f6f6f6',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    webImage: {
        objectFit: 'cover',
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: 8,
    },
    noImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageIcon: {
        width: 36,
        height: 36,
        tintColor: '#ccc',
    },
    noImageText: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    actions: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        zIndex: 1,
    },
    iconButton: {
        backgroundColor: '#fff',
        borderRadius: 18,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    content: {
        padding: 16,
        flex: 1,
        justifyContent: 'flex-start',
    },
    countryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
        marginBottom: 4,
    },
    flagIcon: {
        width: 20,
        height: 20,
        marginRight: 6,
    },
    countryText: {
        fontSize: 14,
        color: '#555',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111',
        marginBottom: 6,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 14,
        color: '#555',
    },
});

export default memo(TravelListItem);
