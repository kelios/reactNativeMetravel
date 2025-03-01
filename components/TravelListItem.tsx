import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    Image,
    Dimensions,
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

// Заглушка-картинка (можно заменить на любую свою)
const placeholderImage = 'https://via.placeholder.com/400x200?text=Нет+фото';

const TravelListItem = ({
                            travel,
                            currentUserId,
                            isSuperuser,
                            onEditPress,
                            onDeletePress,
                        }: Props) => {
    const {
        id,
        slug,
        travel_image_thumb_url,
        name,
        countryName,
        userName,
        countUnicIpView,
        createdAt,
    } = travel;

    const route = useRoute();
    const isMetravel = route.name === 'metravel';

    const canEditOrDelete = isMetravel || isSuperuser;

    const countries = (countryName || '').split(',').map((c) => c.trim());

    const imageSource = travel_image_thumb_url ? { uri: travel_image_thumb_url } : { uri: placeholderImage };

    return (
        <View style={styles.cardContainer}>
            <TouchableOpacity onPress={() => router.push(`/travels/${slug}`)}>
                <Card style={styles.card}>
                    <View style={styles.imageContainer}>
                        <Image source={imageSource} style={styles.image} />
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

                    <View style={styles.content}>
                        <View style={styles.countries}>
                            {countries.map((country, index) => (
                                <Text key={index} style={styles.chip}>{country}</Text>
                            ))}
                        </View>

                        <Text style={styles.title}>{name}</Text>

                        <View style={styles.metaRow}>
                            <Text style={styles.meta}>
                                Автор: <Text style={styles.author}>{userName}</Text>
                            </Text>
                            <Text style={styles.meta}>👀 {countUnicIpView || 0}</Text>
                        </View>

                        <Text style={styles.date}>Опубликовано: {formatDate(createdAt)}</Text>
                    </View>
                </Card>
            </TouchableOpacity>
        </View>
    );
};

const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const { width } = Dimensions.get('window');
const cardWidth = width <= 768 ? width * 0.9 : 400;

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    card: {
        width: cardWidth,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        backgroundColor: '#f5f5f5',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    actionsAbsolute: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        gap: 8,
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
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    countries: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginBottom: 6,
    },
    chip: {
        backgroundColor: '#f5f5f5',
        color: '#333',
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 6,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    meta: {
        fontSize: 14,
        color: '#555',
    },
    author: {
        fontWeight: 'bold',
        color: '#111',
    },
    date: {
        fontSize: 12,
        color: '#aaa',
        marginTop: 4,
    },
});

export default TravelListItem;
