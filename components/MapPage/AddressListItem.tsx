// AddressListItem.tsx
import React, { useMemo, useCallback, useState } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    ImageBackground,
    Linking,
    useWindowDimensions,
    ActivityIndicator,
} from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { TravelCoords } from '@/src/types/types';

type Props = {
    travel: TravelCoords;
    isMobile?: boolean;
    onPress?: () => void;
};

const addVersion = (url?: string, updated?: string) =>
    url && updated ? `${url}?v=${new Date(updated).getTime()}` : url;

const AddressListItem: React.FC<Props> = ({
                                              travel,
                                              isMobile: isMobileProp,
                                              onPress,
                                          }) => {
    const {
        address,
        categoryName,
        coord,
        travelImageThumbUrl,
        articleUrl,
        urlTravel,
        updated_at,
    } = travel;

    const [imgLoaded, setImgLoaded] = useState(false);
    const { width } = useWindowDimensions();
    const isMobile = isMobileProp ?? width <= 768;

    const categories = useMemo(
        () => categoryName?.split(',').map((c) => c.trim()) ?? [],
        [categoryName]
    );

    const showToast = useCallback((msg: string) => {
        Toast.show({ type: 'info', text1: msg, position: 'bottom' });
    }, []);

    const copyCoords = useCallback(async () => {
        if (!coord) return;
        await Clipboard.setStringAsync(coord);
        showToast('Координаты скопированы');
    }, [coord, showToast]);

    const openUrlSafe = useCallback(
        async (url?: string) => {
            if (!url) return;
            const ok = await Linking.canOpenURL(url);
            if (ok) Linking.openURL(url);
            else showToast('Не удалось открыть ссылку');
        },
        [showToast]
    );

    const openTelegram = useCallback(() => {
        if (!coord) return;
        const url = `https://t.me/share/url?url=${encodeURIComponent(
            coord
        )}&text=${encodeURIComponent(`Координаты: ${coord}`)}`;
        openUrlSafe(url);
    }, [coord, openUrlSafe]);

    const openMap = useCallback(() => {
        if (coord) openUrlSafe(`https://maps.google.com/?q=${coord}`);
    }, [coord, openUrlSafe]);

    const handlePress = useCallback(() => {
        if (onPress) onPress();
        else openUrlSafe(articleUrl || urlTravel);
    }, [onPress, articleUrl, urlTravel, openUrlSafe]);

    return (
        <View style={[styles.card, { height: isMobile ? 200 : 240 }]}>
            <Pressable
                style={StyleSheet.absoluteFill}
                onPress={handlePress}
                accessibilityRole="button"
                accessibilityLabel="Открыть маршрут"
                android_ripple={{ color: '#0002' }}
                onLongPress={copyCoords}
            >
                <ImageBackground
                    source={
                        travelImageThumbUrl
                            ? { uri: addVersion(travelImageThumbUrl, updated_at) }
                            : require('@/assets/no-data.webp')
                    }
                    style={styles.image}
                    imageStyle={{ borderRadius: 12 }}
                    onLoadEnd={() => setImgLoaded(true)}
                >
                    {!imgLoaded && (
                        <View style={styles.loader}>
                            <ActivityIndicator size="small" color="#fff" />
                        </View>
                    )}

                    <View style={styles.iconRow}>
                        <IconButton
                            icon="link"
                            size={18}
                            onPress={() => openUrlSafe(articleUrl || urlTravel)}
                            iconColor="#fff"
                            style={styles.iconBtn}
                        />
                        <IconButton
                            icon="content-copy"
                            size={18}
                            onPress={copyCoords}
                            iconColor="#fff"
                            style={styles.iconBtn}
                        />
                        <IconButton
                            icon="send"
                            size={18}
                            onPress={openTelegram}
                            iconColor="#fff"
                            style={styles.iconBtn}
                        />
                    </View>

                    <View style={styles.overlay}>
                        {address && (
                            <Text style={styles.title} numberOfLines={1}>
                                {address}
                            </Text>
                        )}

                        {coord && (
                            <Pressable onPress={openMap}>
                                <Text style={styles.coord}>{coord}</Text>
                            </Pressable>
                        )}

                        {!!categories.length && (
                            <View style={styles.catWrap}>
                                {categories.map((cat, i) => (
                                    <View key={i.toString()} style={styles.catChip}>
                                        <Text style={styles.catText}>{cat}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </ImageBackground>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
        marginHorizontal: 4,
        borderRadius: 12,
        backgroundColor: '#f3f3f3',
        elevation: 2,
        overflow: 'hidden',
    },
    image: { flex: 1, justifyContent: 'flex-end' },
    loader: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0003',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    iconRow: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        zIndex: 2,
    },
    iconBtn: {
        backgroundColor: 'rgba(0,0,0,0.45)',
        marginLeft: 4,
        borderRadius: 6,
    },
    overlay: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    title: { color: '#fff', fontWeight: '600', fontSize: 15, marginBottom: 4 },
    coord: {
        color: '#cceeff',
        textDecorationLine: 'underline',
        fontSize: 12,
        marginBottom: 6,
    },
    catWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    catChip: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    catText: { color: '#fff', fontSize: 12, fontWeight: '500' },
});

export default React.memo(AddressListItem);
