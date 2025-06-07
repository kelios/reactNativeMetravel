import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, Platform, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

const IconButton = memo(({ icon, onPress, style }) => (
    <Pressable
        onPress={(e) => { e.stopPropagation(); onPress(); }}
        style={[styles.iconButton, style]}
        hitSlop={8}
    >
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
                            onDeletePress,
                            isFirst,
                            isSingle = false,
                        }) => {
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 400;

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

    const canEdit = isMetravel || isSuperuser;

    const countries = useMemo(() =>
            countryName.split(',').map(c => c.trim()).filter(Boolean),
        [countryName]
    );

    const imageUrl = useMemo(() => {
        if (!travel_image_thumb_url) return null;
        const version = updated_at ? Date.parse(updated_at) : id;
        return `${travel_image_thumb_url}?v=${version}`;
    }, [travel_image_thumb_url, updated_at, id]);

    const handlePress = useCallback(() => router.push(`/travels/${slug}`), [slug]);

    // Измененный обработчик для редактирования
    const handleEdit = useCallback(() => {
        router.push(`/travel/${id}`);
    }, [id]);

    const handleDelete = useCallback(() => onDeletePress(id), [id, onDeletePress]);

    const renderImage = useMemo(() => {
        if (!imageUrl) return null;

        return Platform.OS === 'web' ? (
            <img
                src={imageUrl}
                alt={name}
                style={styles.htmlImage}
                loading={isFirst ? 'eager' : 'lazy'}
                decoding="async"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                srcSet={`
                    ${imageUrl}&w=200 200w,
                    ${imageUrl}&w=400 400w,
                    ${imageUrl}&w=800 800w
                `}
            />
        ) : (
            <Image
                style={styles.image}
                source={{ uri: imageUrl }}
                contentFit="cover"
                priority={isFirst ? 'high' : 'normal'}
            />
        );
    }, [imageUrl, name, isFirst]);

    const renderCountries = useMemo(() => {
        if (!countries.length) return null;

        return (
            <View style={styles.countryContainer}>
                {countries.map((c) => (
                    <Text key={c} style={styles.countryText}>{c}</Text>
                ))}
            </View>
        );
    }, [countries]);

    return (
        <View style={styles.container}>
            <View style={[styles.card, isSingle && styles.single]}>
                <Pressable
                    onPress={handlePress}
                    style={StyleSheet.absoluteFill}
                    accessibilityRole="button"
                    accessibilityLabel={`Travel to ${name}`}
                />

                {renderImage}

                <View style={styles.overlay} pointerEvents="box-none">
                    {renderCountries}
                    <Text style={styles.title} numberOfLines={2}>{name}</Text>
                    <View style={styles.metaRow}>
                        {!!userName && <Meta icon="user" text={userName} />}
                        <Meta icon="eye" text={countUnicIpView} />
                    </View>
                </View>

                {canEdit && (
                    <View style={styles.actionsWrapper} pointerEvents="auto">
                        <View style={styles.actions}>
                            <IconButton
                                icon="edit"
                                onPress={handleEdit}
                                style={isSmallScreen && styles.smallIconButton}
                            />
                            <IconButton
                                icon="trash-2"
                                onPress={handleDelete}
                                style={isSmallScreen && styles.smallIconButton}
                            />
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

export default memo(TravelListItem);

const styles = StyleSheet.create({
    container: {
        padding: 8,
        width: '100%',
        position: 'relative',
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
        aspectRatio: 1,
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
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 12,
        willChange: 'transform, opacity',
        contain: 'layout paint',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        lineHeight: 22,
        marginBottom: 8,
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
    actionsWrapper: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        pointerEvents: 'auto',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    iconButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 18,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallIconButton: {
        width: 30,
        height: 30,
    },
});