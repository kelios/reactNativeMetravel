import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, Platform, useWindowDimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

/* ---------------- icon button ---------------- */
const IconButton = memo(
    ({ icon, onPress, style, accessibilityLabel }: { icon: any; onPress: () => void; style?: any; accessibilityLabel: string }) => (
        <Pressable
            onPress={e => {
                e.stopPropagation();
                onPress();
            }}
            style={[styles.iconButton, style]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
        >
            <Feather name={icon} size={18} color="#fff" />
        </Pressable>
    ),
);

/* ---------------- main component ------------- */
const TravelListItem = ({
                            travel,
                            isSuperuser,
                            isMetravel,
                            onDeletePress,
                            isFirst,
                            isSingle = false,
                        }: {
    travel: any;
    isSuperuser: boolean;
    isMetravel: boolean;
    onDeletePress: (id: number) => void;
    isFirst: boolean;
    isSingle?: boolean;
}) => {
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 400;

    const {
        id,
        slug,
        travel_image_thumb_url,
        travel_image_thumb_width,
        travel_image_thumb_height,
        name,
        countryName = '',
        userName,
        countUnicIpView = 0,
        updated_at,
    } = travel;

    const canEdit = isMetravel || isSuperuser;

    /* --------- data helpers --------- */
    const countries = useMemo(
        () => countryName.split(',').map(c => c.trim()).filter(Boolean),
        [countryName],
    );

    const imageUrl = useMemo(() => {
        if (!travel_image_thumb_url) return null;
        const version = updated_at ? Date.parse(updated_at) : id;
        return `${travel_image_thumb_url}?v=${version}`;
    }, [travel_image_thumb_url, updated_at, id]);

    /* ---------- handlers ---------- */
    const handlePress = useCallback(() => router.push(`/travels/${slug}`), [slug]);
    const handleEdit = useCallback(() => router.push(`/travel/${id}`), [id]);
    const handleDelete = useCallback(() => onDeletePress(id), [id, onDeletePress]);

    /* ---------- render ---------- */
    return (
        <View style={styles.container}>
            <Pressable
                onPress={handlePress}
                style={[styles.card, isSingle && styles.single]}
                accessibilityRole="button"
                accessibilityLabel={`Открыть путешествие ${name}`}
            >
                {/* ---------- image ---------- */}
                {imageUrl ? (
                    Platform.OS === 'web' ? (
                        <img
                            src={imageUrl}
                            alt={name}
                            width={travel_image_thumb_width || 400}
                            height={travel_image_thumb_height || 400}
                            srcSet={`
                ${imageUrl}&w=320 320w,
                ${imageUrl}&w=640 640w,
                ${imageUrl}&w=960 960w`}
                            sizes="(max-width: 768px) 100vw, 33vw"
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            loading={isFirst ? 'eager' : 'lazy'}
                            fetchpriority={isFirst ? 'high' : 'auto'}
                            decoding="async"
                        />
                    ) : (
                        <ExpoImage
                            source={{ uri: imageUrl }}
                            style={styles.image}
                            contentFit="cover"
                            placeholder={require('@/assets/placeholder.png')}
                            transition={300}
                            priority={isFirst ? 'high' : 'normal'}
                            accessibilityLabel={name}
                        />
                    )
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Feather name="image" size={40} color="#666" />
                    </View>
                )}

                {/* ---------- overlays ---------- */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    locations={[0.6, 1]}
                    style={styles.gradientOverlay}
                />

                <View style={styles.overlay}>
                    {!!countries.length && (
                        <View style={styles.countryContainer}>
                            {countries.map(c => (
                                <View key={c} style={styles.countryTag}>
                                    <Text style={styles.countryText}>{c}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <Text numberOfLines={2} style={styles.title}>
                        {name}
                    </Text>

                    <View style={styles.metaRow}>
                        {!!userName && (
                            <View style={styles.metaItem}>
                                <Feather name="user" size={14} color="#eee" />
                                <Text numberOfLines={1} style={styles.metaText}>
                                    {userName}
                                </Text>
                            </View>
                        )}
                        <View style={styles.metaItem}>
                            <Feather name="eye" size={14} color="#eee" />
                            <Text numberOfLines={1} style={styles.metaText}>
                                {countUnicIpView}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ---------- edit / delete ---------- */}
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

export default memo(TravelListItem);

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
    container: { padding: 8, width: '100%' },
    single: { maxWidth: 600 },
    card: {
        position: 'relative',
        width: '100%',
        aspectRatio: 1,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    image: { width: '100%', height: '100%' },
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
    overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
    title: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 },
    countryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
    countryTag: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    countryText: { fontSize: 12, color: '#fff', fontWeight: '500' },
    metaRow: { flexDirection: 'row', gap: 12 },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    metaText: { fontSize: 13, color: '#eee', marginLeft: 6 },
    actions: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 8 },
    iconButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 18,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallIconButton: { width: 30, height: 30 },
});
