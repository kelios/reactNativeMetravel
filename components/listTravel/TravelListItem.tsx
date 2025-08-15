import React, { memo, useCallback, useMemo } from 'react';
import { View, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const WebImage = memo(
    ({ src, alt, isPriority = false }: { src: string; alt: string; isPriority?: boolean }) => (
        <img
            src={src}
            alt={alt}
            width={800}
            height={600}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            decoding="async"
            loading={isPriority ? 'eager' : 'lazy'}
            fetchpriority={isPriority ? 'high' : 'low'}
            crossOrigin="anonymous"
        />
    )
);

const NativeImage = memo(({ source }: { source: string }) => (
    <ExpoImage
        source={{ uri: source }}
        style={styles.img}
        contentFit="cover"
        transition={300}
        cachePolicy="disk"
    />
));

function TravelListItem({
                            travel,
                            isSuperuser,
                            isMetravel,
                            onDeletePress,
                            isFirst,
                            isSingle = false,
                        }: any) {
    if (!travel) return null;

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

    const imgUrl = useMemo(() => {
        if (!travel_image_thumb_url) return null;
        const v = updated_at ? Date.parse(updated_at) : id;
        return `${travel_image_thumb_url}?v=${v}&w=${isSingle ? 800 : 400}&q=80&fit=crop&auto=format`;
    }, [travel_image_thumb_url, updated_at, id, isSingle]);

    const countries = useMemo(
        () => countryName.split(',').map((c: string) => c.trim()).filter(Boolean),
        [countryName]
    );

    const canEdit = isSuperuser || isMetravel;

    const open = useCallback(() => router.push(`/travels/${slug}`), [slug]);
    const edit = useCallback(() => router.push(`/travel/${id}`), [id]);
    const remove = useCallback(() => onDeletePress(id), [id, onDeletePress]);

    const ImageComponent = Platform.OS === 'web' ? WebImage : NativeImage;

    return (
        <View style={styles.wrap}>
            <Pressable
                onPress={open}
                style={[styles.card, isSingle && styles.single]}
                accessibilityLabel={`Путешествие: ${name}`}
                accessibilityRole="button"
            >
                {imgUrl ? (
                    <ImageComponent
                        src={imgUrl}
                        alt={name}
                        source={imgUrl}
                        isPriority={isFirst}
                    />
                ) : (
                    <View style={styles.imgStub}>
                        <Feather name="image" size={40} color="#666" />
                    </View>
                )}

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    locations={[0.6, 1]}
                    style={styles.grad}
                />

                <View style={styles.overlay}>
                    {countries.length > 0 && (
                        <View style={styles.tags}>
                            {countries.map(c => (
                                <View key={c} style={styles.tag}>
                                    <Text style={styles.tagTxt}>{c}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <Text
                        style={styles.title}
                        numberOfLines={2}
                        accessibilityLabel={`Название: ${name}`}
                    >
                        {name}
                    </Text>

                    <View style={styles.metaRow}>
                        {!!userName && (
                            <View style={styles.metaBox}>
                                <Feather name="user" size={14} color="#eee" />
                                <Text style={styles.metaTxt}>{userName}</Text>
                            </View>
                        )}
                        <View style={styles.metaBox}>
                            <Feather name="eye" size={14} color="#eee" />
                            <Text style={styles.metaTxt}>{countUnicIpView}</Text>
                        </View>
                    </View>
                </View>
            </Pressable>

            {canEdit && (
                <View style={styles.actions}>
                    <Pressable
                        onPress={edit}
                        hitSlop={8}
                        style={styles.btn}
                        accessibilityLabel="Редактировать"
                    >
                        <Feather name="edit" size={18} color="#fff" />
                    </Pressable>
                    <Pressable
                        onPress={remove}
                        hitSlop={8}
                        style={styles.btn}
                        accessibilityLabel="Удалить"
                    >
                        <Feather name="trash-2" size={18} color="#fff" />
                    </Pressable>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { padding: 8, width: '100%' },
    card: {
        position: 'relative',
        width: '100%',
        aspectRatio: 1,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    single: { maxWidth: 600, alignSelf: 'center' },
    img: {
        width: '100%',
        height: '100%',
        backgroundColor: '#1a1a1a',
    },
    imgStub: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
    },
    grad: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '60%',
    },
    overlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: 16,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    tagTxt: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 12,
    },
    metaBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    metaTxt: {
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
    btn: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 18,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default memo(TravelListItem);
