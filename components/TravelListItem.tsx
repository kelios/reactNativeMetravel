import React, { useRef, useState, memo } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Text,
    useWindowDimensions,
    Animated,
    Easing,
    Image,
    Platform,
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

    const countries = countryName ? countryName.split(',').map(c => c.trim()) : [];

    const [imageError, setImageError] = useState(false);

    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.timing(scaleValue, {
            toValue: 0.95,
            duration: 150,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(scaleValue, {
            toValue: 1,
            duration: 150,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
        }).start();
    };

    const getCardStyle = () => {
        let cardWidth = width * 0.9;
        let imageHeight = 200;

        if (width > 768 && width <= 1200) {
            cardWidth = (width - 400) / 2;
            imageHeight = 250;
        } else if (width > 1200) {
            cardWidth = (width - 550) / 2;
            imageHeight = 400;
        }

        return { cardWidth, imageHeight };
    };

    const { cardWidth, imageHeight } = getCardStyle();

    return (
        <View style={[styles.cardContainer, { width: cardWidth }]}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => router.push(`/travels/${slug}`)}
                style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                    <Card style={styles.card}>
                        <View style={[styles.imageContainer, { height: imageHeight }]}>
                            {!imageError ? (
                                <Image
                                    source={{ uri: travel_image_thumb_url }}
                                    style={styles.image}
                                    onError={() => setImageError(true)}
                                    resizeMode="cover"
                                    defaultSource={Platform.OS === 'ios' ? placeholderImage : undefined}
                                />
                            ) : (
                                <View style={styles.fallback}>
                                    <Text style={styles.fallbackText}>Нет фото</Text>
                                </View>
                            )}

                            {canEditOrDelete && (
                                <View style={styles.actionsAbsolute}>
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
                                <View style={styles.countries}>
                                    {countries.map((country, index) => (
                                        <Text key={index} style={styles.chip}>{country}</Text>
                                    ))}
                                </View>
                            )}

                            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{name}</Text>

                            <View style={styles.metaRow}>
                                <Text style={styles.meta}>
                                    Автор: <Text style={styles.author}>{userName}</Text>
                                </Text>
                                <Text style={styles.meta}>👀 {countUnicIpView}</Text>
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
    },
    image: {
        width: '100%',
        height: '100%',
    },
    fallback: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fallbackText: {
        color: '#888',
        fontSize: 12,
    },
    actionsAbsolute: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
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
