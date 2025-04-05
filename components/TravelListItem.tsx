import React, { useRef, useState, memo } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Text,
    useWindowDimensions,
    Animated,
    Platform,
    Image,
} from 'react-native';
import { Card } from 'react-native-paper';
import { Travel } from '@/src/types/types';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

const placeholderImage = require('@/assets/placeholder.png');

type Props = {
    travel: Travel;
    currentUserId: string;
    isSuperuser: boolean;
    isMetravel: boolean;
    onEditPress: (id: string) => void;
    onDeletePress: (id: string) => void;
};

const TravelListItem = ({
                            travel,
                            isSuperuser,
                            isMetravel,
                            onEditPress,
                            onDeletePress,
                        }: Props) => {
    const {
        id,
        slug,
        travel_image_thumb_url,
        name,
        countryName = '',
        userName,
        countUnicIpView = 0,
    } = travel;

    const { width } = useWindowDimensions();
    const canEditOrDelete = isMetravel || isSuperuser;
    const countries = countryName ? countryName.split(',').map((c) => c.trim()) : [];
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.97,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = () => {
        setTimeout(() => router.push(`/travels/${slug}`), 100);
    };

    const getCardStyle = () => {
        let cardWidth = width * 0.9;
        let imageHeight = 200;

        if (width >= 768 && width <= 1024) {
            imageHeight = 350;
        } else if (width > 1024 && width <= 1200) {
            cardWidth = (width - 400) / 2;
            imageHeight = 250;
        } else if (width > 1200 && width <= 1400) {
            cardWidth = (width - 400) / 2;
            imageHeight = 300;
        } else if (width > 1400) {
            cardWidth = (width - 400) / 2;
            imageHeight = 500;
        }

        return { cardWidth, imageHeight };
    };

    const { cardWidth, imageHeight } = getCardStyle();

    const isValidImageUrl = (url?: string): boolean =>
        !!url && typeof url === 'string' && url.startsWith('http');

    return (
        <View style={[styles.cardContainer, { width: cardWidth }]}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handlePress}
                style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                    <Card style={styles.card}>
                        <View style={[styles.imageContainer, { height: imageHeight }]}>
                            {!imageError && isValidImageUrl(travel_image_thumb_url) ? (
                                Platform.OS === 'web' ? (
                                    <img
                                        src={travel_image_thumb_url}
                                        alt={name}
                                        onError={() => setImageError(true)}
                                        onLoad={() => setImageLoaded(true)}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: imageLoaded ? 'block' : 'none',
                                        }}
                                    />
                                ) : (
                                    <Image
                                        source={{ uri: travel_image_thumb_url }}
                                        style={styles.image}
                                        onError={() => setImageError(true)}
                                        onLoad={() => setImageLoaded(true)}
                                        resizeMode="cover"
                                    />
                                )
                            ) : (
                                <Image source={placeholderImage} style={styles.image} resizeMode="cover" />
                            )}

                            {canEditOrDelete && (
                                <View style={styles.actionsAbsolute}>
                                    <Pressable
                                        onPress={() => onEditPress(id)}
                                        style={styles.iconButton}
                                        hitSlop={10}
                                    >
                                        <Feather name="edit" size={18} color="#333" />
                                    </Pressable>
                                    <Pressable
                                        onPress={() => onDeletePress(id)}
                                        style={styles.iconButton}
                                        hitSlop={10}
                                    >
                                        <Feather name="trash-2" size={18} color="#333" />
                                    </Pressable>
                                </View>
                            )}
                        </View>

                        <View style={styles.content}>
                            {countries.length > 0 && (
                                <View style={styles.countries}>
                                    {countries.map((country) => (
                                        <Text key={country} style={styles.chip}>
                                            {country}
                                        </Text>
                                    ))}
                                </View>
                            )}

                            <Text style={styles.title} numberOfLines={2}>
                                {name}
                            </Text>

                            <View style={styles.metaRow}>
                                <Text style={styles.meta}>
                                    Автор: <Text style={styles.author}>{String(userName || 'Неизвестно')}</Text>
                                </Text>
                                <Text style={styles.meta}>👀 {countUnicIpView ?? 0}</Text>
                            </View>
                        </View>
                    </Card>
                </Animated.View>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        alignSelf: 'center',
        marginBottom: 15,
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    imageContainer: {
        width: '100%',
        position: 'relative',
        zIndex: 1,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    actionsAbsolute: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        zIndex: 2,
    },
    iconButton: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        marginLeft: 8,
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: 'space-between',
    },
    countries: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 4,
    },
    chip: {
        backgroundColor: '#f5f5f5',
        color: '#333',
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        marginRight: 4,
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    meta: {
        fontSize: 14,
        color: '#555',
    },
    author: {
        fontWeight: 'bold',
        color: '#111',
    },
});

export default memo(TravelListItem);
