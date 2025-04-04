import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    Image,
    useWindowDimensions,
    Animated,
    Easing,
} from 'react-native';
import { Card } from 'react-native-paper';
import { Travel } from '@/src/types/types';
import { router } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

type Props = {
    travel: Travel;
    currentUserId: string;
    isSuperuser: boolean;
    onEditPress: (id: string) => void;
    onDeletePress: (id: string) => void;
};

const placeholderImage = 'https://via.placeholder.com/400x200?text=Нет+фото';

const TravelListItem = ({
                            travel,
                            isSuperuser,
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
    const route = useRoute();
    const isMetravel = route.name === 'metravel';
    const canEditOrDelete = isMetravel || isSuperuser;

    const countries = countryName ? countryName.split(',').map((c) => c.trim()) : [];

    const safeUrl = travel_image_thumb_url?.startsWith('http://')
        ? travel_image_thumb_url.replace('http://', 'https://')
        : travel_image_thumb_url;

    const imageSource = safeUrl ? { uri: safeUrl } : { uri: placeholderImage };

    // Анимация
    const scaleValue = new Animated.Value(1);

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

    // Динамический расчет размеров карточки
    let cardWidth = width * 0.9;
    let imageHeight = 200;
    let contentHeight = 120;

    if (width > 768 && width <= 1200) {
        cardWidth = (width - 400) / 2;
        imageHeight = 250;
    } else if (width > 1200) {
        cardWidth = (width - 550) / 2;
        imageHeight = 400;
    }

    return (
        <View style={[styles.cardContainer, { width: cardWidth }]}>
            <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => router.push(`/travels/${slug}`)}
                activeOpacity={0.9}
            >
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                    <Card style={styles.card}>
                        <View style={[styles.imageContainer, { height: imageHeight }]}>
                            <Image
                                key={safeUrl}
                                source={imageSource}
                                style={styles.image}
                            />
                            {canEditOrDelete && (
                                <View style={styles.actionsAbsolute}>
                                    <TouchableOpacity onPress={() => onEditPress(id)} style={styles.iconButton}>
                                        <Feather name="edit" size={18} color="#333" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => onDeletePress(id)} style={styles.iconButton}>
                                        <Feather name="trash-2" size={18} color="#333" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View style={[styles.content, { height: contentHeight }]}>
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
            </TouchableOpacity>
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
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    imageContainer: {
        width: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    actionsAbsolute: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
    },
    iconButton: {
        backgroundColor: 'rgba(255,255,255,0.9)',
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
        overflow: 'hidden',
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
        flexShrink: 1,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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

export default TravelListItem;
