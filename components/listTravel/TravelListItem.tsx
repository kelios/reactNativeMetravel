import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, Platform, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const IconButton = memo(({ icon, onPress, style, accessibilityLabel }) => (
    <Pressable
        onPress={(e) => {
            e.stopPropagation();
            onPress();
        }}
        style={[styles.iconButton, style]}
        hitSlop={8}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
    >
        <Feather name={icon} size={18} color="#fff" />
    </Pressable>
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

    const countries = useMemo(
        () => countryName.split(',').map(c => c.trim()).filter(Boolean),
        [countryName]
    );

    const imageUrl = useMemo(() => {
        if (!travel_image_thumb_url) return null;
        const version = updated_at ? Date.parse(updated_at) : id;
        return `${travel_image_thumb_url}?v=${version}`;
    }, [travel_image_thumb_url, updated_at, id]);

    const handlePress = useCallback(() => {
        router.push(`/travels/${slug}`);
    }, [slug]);

    const handleEdit = useCallback((e) => {
        e?.stopPropagation();
        router.push(`/travel/${id}`);
    }, [id]);

    const handleDelete = useCallback((e) => {
        e?.stopPropagation();
        onDeletePress(id);
    }, [id, onDeletePress]);

    // устанавливаем title на Web
    useEffect(() => {
        if (Platform.OS === 'web') {
            document.title = `${name} | Metravel`;
        }
    }, [name]);

    return (
        <View style={styles.container}>
            <Pressable
                onPress={handlePress}
                style={[styles.card, isSingle && styles.single]}
                accessibilityLabel={`Открыть путешествие ${name}`}
                accessibilityRole="button"
            >
                {imageUrl ? (
                    Platform.OS === 'web' ? (
                        <img
                            src={imageUrl}
                            alt={name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                            loading={isFirst ? 'eager' : 'lazy'}
                        />
                    ) : (
                        <Image
                            style={styles.image}
                            source={{ uri: imageUrl }}
                            contentFit="cover"
                            priority={isFirst ? 'high' : 'normal'}
                            accessibilityLabel={name}
                        />
                    )
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Feather name="image" size={40} color="#666" />
                    </View>
                )}

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradientOverlay}
                    locations={[0.6, 1]}
                />

                <View style={styles.overlay}>
                    {countries.length > 0 && (
                        <View style={styles.countryContainer}>
                            {countries.map((c) => (
                                <View key={c} style={styles.countryTag}>
                                    <Text style={styles.countryText}>{c}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <Text style={styles.title} numberOfLines={2}>
                        {name}
                    </Text>

                    <View style={styles.metaRow}>
                        {!!userName && (
                            <View style={styles.metaItem}>
                                <Feather name="user" size={14} color="#eee" />
                                <Text style={styles.metaText} numberOfLines={1}>
                                    {userName}
                                </Text>
                            </View>
                        )}
                        <View style={styles.metaItem}>
                            <Feather name="eye" size={14} color="#eee" />
                            <Text style={styles.metaText} numberOfLines={1}>
                                {countUnicIpView}
                            </Text>
                        </View>
                    </View>
                </View>

                {canEdit && (
                    <View style={styles.actions}>
                        <IconButton
                            icon="edit"
                            onPress={handleEdit}
                            style={isSmallScreen && styles.smallIconButton}
                            accessibilityLabel={`Редактировать путешествие ${name}`}
                        />
                        <IconButton
                            icon="trash-2"
                            onPress={handleDelete}
                            style={isSmallScreen && styles.smallIconButton}
                            accessibilityLabel={`Удалить путешествие ${name}`}
                        />
                    </View>
                )}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
        width: '100%',
    },
    single: {
        maxWidth: 600,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#000',
        position: 'relative',
        width: '100%',
        aspectRatio: 1,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    countryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    countryTag: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    countryText: {
        fontSize: 12,
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
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    metaText: {
        fontSize: 13,
        color: '#eee',
        marginLeft: 6,
    },
    actions: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
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

export default memo(TravelListItem);
