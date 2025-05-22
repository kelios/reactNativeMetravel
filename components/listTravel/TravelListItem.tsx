import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

const placeholderImage = require('@/assets/placeholder.png');

const CARD_HEIGHT_MOBILE = 320;
const CARD_HEIGHT_DESKTOP = 460;

const IconButton = ({ icon, onPress }) => (
    <Pressable onPress={onPress} style={styles.iconButton}>
        <Feather name={icon} size={18} color="#fff" />
    </Pressable>
);

const Meta = ({ icon, text }) => (
    <View style={styles.metaItem}>
        <Feather name={icon} size={14} color="#eee" />
        <Text style={styles.metaText}>{text}</Text>
    </View>
);

const TravelListItem = ({
                            travel,
                            currentUserId, // reserved for future feature usage
                            isSuperuser,
                            isMetravel,
                            onEditPress,
                            onDeletePress,
                            isMobile,
                            isFirst,
                        }) => {
    const {
        id,
        slug,
        travel_image_thumb_url,
        name,
        countryName = '',
        userName,
        countUnicIpView = 0,
        updated_at,
    } = travel;

    const CARD_HEIGHT = isMobile ? CARD_HEIGHT_MOBILE : CARD_HEIGHT_DESKTOP;
    const canEdit = isMetravel || isSuperuser;

    const countries = useMemo(
        () => (countryName ? countryName.split(',').map((c) => c.trim()) : []),
        [countryName],
    );

    const imageSource = useMemo(() => {
        if (travel_image_thumb_url) {
            const version = updated_at ? Date.parse(updated_at) : id;
            return { uri: `${travel_image_thumb_url}?v=${version}` };
        }
        return placeholderImage;
    }, [travel_image_thumb_url, updated_at, id]);

    const handlePress = useCallback(() => router.push(`/travels/${slug}`), [slug]);
    const handleEditPress = useCallback(() => onEditPress(id), [id, onEditPress]);
    const handleDeletePress = useCallback(() => onDeletePress(id), [id, onDeletePress]);

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => [styles.container, pressed && styles.pressed]}
        >
            <View style={[styles.card, { height: CARD_HEIGHT }]}>
                <Image
                    style={[styles.image, { height: CARD_HEIGHT }]}
                    source={imageSource}      // понимает и require, и строку
                    contentFit="cover"
                    transition={150}
                    priority={isFirst ? 'high' : 'normal'}
                    placeholder={placeholderImage}
                    />

                <View style={styles.overlay} pointerEvents="box-none">
                    {canEdit && (
                        <View style={styles.actions} pointerEvents="box-none">
                            <IconButton icon="edit" onPress={handleEditPress} />
                            <IconButton icon="trash-2" onPress={handleDeletePress} />
                        </View>
                    )}

                    <View style={styles.textBox} pointerEvents="box-none">
                        {countries.length > 0 && (
                            <View style={styles.countryContainer}>
                                {countries.map((country) => (
                                    <Text key={country} style={styles.countryText}>
                                        {country}
                                    </Text>
                                ))}
                            </View>
                        )}

                        <Text style={styles.title} numberOfLines={1}>
                            {name}
                        </Text>

                        <View style={styles.metaRow}>
                            {userName?.length > 0 && <Meta icon="user" text={userName} />}
                            <Meta icon="eye" text={countUnicIpView} />
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

export default memo(
    TravelListItem,
    (prev, next) =>
        prev.travel.id === next.travel.id &&
        prev.isSuperuser === next.isSuperuser &&
        prev.isMetravel === next.isMetravel &&
        prev.isMobile === next.isMobile &&
        prev.isFirst === next.isFirst,
);

const styles = StyleSheet.create({
    container: {
        padding: 8,
        width: '100%',
    },
    pressed: { opacity: 0.95 },
    card: {
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: '#000',
        width: '100%',
    },
    image: {
        width: '100%',
        transform: [{ scale: 1.05 }],
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        padding: 16,
    },
    textBox: {
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
    countryText: {
        fontSize: 13,
        color: '#fff',
        marginRight: 10,
        marginBottom: 4,
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
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    metaText: {
        fontSize: 13,
        color: '#eee',
        marginLeft: 4,
    },
});