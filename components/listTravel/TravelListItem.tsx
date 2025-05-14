import React, { memo, useState, useCallback, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FastImage } from 'expo-fast-image';

const placeholderImage = require('@/assets/placeholder.png');

const TravelListItem = ({
                            travel,
                            currentUserId,
                            isSuperuser,
                            isMetravel,
                            onEditPress,
                            onDeletePress,
                            isMobile,
                            index = 0,
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
    const CARD_HEIGHT = isMobile ? 320 : 460;

    const canEdit = isMetravel || isSuperuser;

    const handlePress = useCallback(() => {
        router.push(`/travels/${slug}`);
    }, [slug]);

    const handleEditPress = useCallback(() => {
        onEditPress(id);
    }, [id, onEditPress]);

    const handleDeletePress = useCallback(() => {
        onDeletePress(id);
    }, [id, onDeletePress]);

    const handleImageError = useCallback(() => {
        setImageError(true);
    }, []);

    const imageSource = useMemo(() => {
        if (!imageError && travel_image_thumb_url) {
            return { uri: travel_image_thumb_url };
        }
        return placeholderImage;
    }, [travel_image_thumb_url, imageError]);

    const ImageComponent = useMemo(() => memo(({ source, onError }) => {
        if (Platform.OS === 'web') {
            return (
                <img
                    src={source.uri}
                    alt="travel"
                    style={styles.backgroundImageWeb}
                    onError={onError}
                    loading="lazy"
                />
            );
        }

        return (
            <FastImage
                source={source}
                style={styles.backgroundImage}
                resizeMode={FastImage.resizeMode.cover}
                onError={onError}
            />
        );
    }), []);

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
                styles.pressableContainer,
                { opacity: pressed ? 0.95 : 1 },
            ]}
        >
            <View style={[styles.card, { height: CARD_HEIGHT }]}>
                <View style={styles.imageWrapper}>
                    <ImageComponent
                        source={imageSource}
                        onError={handleImageError}
                    />
                </View>

                <View style={styles.contentOverlay}>
                    {canEdit && (
                        <View style={styles.actions}>
                            <Pressable onPress={handleEditPress} style={styles.iconButton}>
                                <Feather name="edit" size={18} color="#fff" />
                            </Pressable>
                            <Pressable onPress={handleDeletePress} style={styles.iconButton}>
                                <Feather name="trash-2" size={18} color="#fff" />
                            </Pressable>
                        </View>
                    )}

                    <View style={styles.textBackground}>
                        {countries.length > 0 && (
                            <View style={styles.countryContainer}>
                                {countries.map((country, index) => (
                                    <View style={styles.countryItem} key={index}>
                                        <Text style={styles.countryText}>{country}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                        <Text style={styles.title} numberOfLines={1}>{name}</Text>
                        <View style={styles.metaRow}>
                            {userName?.length > 0 && (
                                <View style={styles.metaItem}>
                                    <Feather name="user" size={14} color="#eee" />
                                    <Text style={styles.metaText}>{userName}</Text>
                                </View>
                            )}
                            <View style={styles.metaItem}>
                                <Feather name="eye" size={14} color="#eee" />
                                <Text style={styles.metaText}>{countUnicIpView ?? 0}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
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
        backgroundColor: '#000',
        width: '100%',
        position: 'relative',
    },
    imageWrapper: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        transform: [{ scale: 1.1 }], // Мобильный эффект с "вылезанием"
    },
    backgroundImageWeb: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        borderRadius: 18,
        transform: 'scale(1.1)', // Эффект для веба
    },
    contentOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 16,
        zIndex: 1,
    },
    textBackground: {
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        borderRadius: 12,
        padding: 12,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 8,
    },
    iconButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 18,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    countryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 6,
    },
    countryItem: {
        marginRight: 10,
        marginBottom: 4,
    },
    countryText: {
        fontSize: 13,
        color: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metaText: {
        fontSize: 13,
        color: '#eee',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
        margin: 5,
    },
});

export default memo(TravelListItem);