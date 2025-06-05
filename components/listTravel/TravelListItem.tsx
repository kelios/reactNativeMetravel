import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, Platform, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

const IconButton = memo(({ icon, onPress }) => (
    <Pressable onPress={onPress} style={styles.iconButton} hitSlop={8}>
        <Feather name={icon} size={18} color="#fff" />
    </Pressable>
));

const Meta = memo(({ icon, text }) => (
    <View style={styles.metaItem}>
        <Feather name={icon} size={14} color="#eee" />
        <Text style={styles.metaText} numberOfLines={1}>{text}</Text>
    </View>
));

const TravelListItem = ({
                            travel,
                            isSuperuser,
                            isMetravel,
                            onEditPress,
                            onDeletePress,
                            isFirst,
                            isSingle = false,
                        }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

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

    const CARD_HEIGHT = useMemo(() => {
        return isMobile ? 320 : isTablet ? 380 : 460;
    }, [isMobile, isTablet]);

    const canEdit = isMetravel || isSuperuser;
    const countries = useMemo(() => countryName.split(',').map(c => c.trim()).filter(Boolean), [countryName]);

    const imageUrl = useMemo(() => {
        if (!travel_image_thumb_url) return null;
        const version = updated_at ? Date.parse(updated_at) : id;
        return `${travel_image_thumb_url}?v=${version}`;
    }, [travel_image_thumb_url, updated_at, id]);

    const handlePress = useCallback(() => router.push(`/travels/${slug}`), [slug]);
    const handleEdit = useCallback((e) => { e.stopPropagation(); onEditPress(id); }, [id, onEditPress]);
    const handleDelete = useCallback((e) => { e.stopPropagation(); onDeletePress(id); }, [id, onDeletePress]);

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
                isSingle && styles.single,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Travel to ${name}`}
        >
            <View style={[styles.card, { height: CARD_HEIGHT }]}>
                {imageUrl && (Platform.OS === 'web' ? (
                    <img src={imageUrl} alt={name} style={styles.htmlImage} loading={isFirst ? 'eager' : 'lazy'} />
                ) : (
                    <Image style={styles.image} source={{ uri: imageUrl }} contentFit="cover" transition={200} priority={isFirst ? 'high' : 'normal'} />
                ))}

                <View style={styles.overlay} pointerEvents="box-none">
                    {canEdit && (
                        <View style={styles.actions} pointerEvents="box-none">
                            <IconButton icon="edit" onPress={handleEdit} />
                            <IconButton icon="trash-2" onPress={handleDelete} />
                        </View>
                    )}

                    <View style={styles.textBox} pointerEvents="box-none">
                        {!!countries.length && (
                            <View style={styles.countryContainer}>
                                {countries.map((c) => (
                                    <Text key={c} style={styles.countryText}>{c}</Text>
                                ))}
                            </View>
                        )}

                        <Text style={styles.title} numberOfLines={2}>{name}</Text>
                        <View style={styles.metaRow}>
                            {!!userName && <Meta icon="user" text={userName} />}
                            <Meta icon="eye" text={countUnicIpView} />
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

export default memo(TravelListItem, (prev, next) => {
    const a = prev.travel;
    const b = next.travel;
    return (
        a.id === b.id &&
        a.updated_at === b.updated_at &&
        a.name === b.name &&
        a.countryName === b.countryName &&
        a.userName === b.userName &&
        a.countUnicIpView === b.countUnicIpView &&
        prev.isSuperuser === next.isSuperuser &&
        prev.isMetravel === next.isMetravel &&
        prev.isFirst === next.isFirst &&
        prev.isSingle === next.isSingle
    );
});

const styles = StyleSheet.create({
    container: {
        padding: 8,
        width: '100%',
    },
    pressed: {
        opacity: 0.95,
        transform: [{ scale: 0.98 }],
    },
    single: {
        alignSelf: 'center',
        maxWidth: 600,
        width: '100%',
        paddingHorizontal: 8,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#000',
        position: 'relative',
        width: '100%',
        alignSelf: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    htmlImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        borderRadius: 16,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        padding: 16,
    },
    textBox: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 12,
        padding: 12,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginBottom: 8,
    },
    iconButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 18,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 6,
    },
    countryText: {
        fontSize: 13,
        color: '#fff',
        fontWeight: '500',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        lineHeight: 24,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 13,
        color: '#eee',
        marginLeft: 4,
    },
});