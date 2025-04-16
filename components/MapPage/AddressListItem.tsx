import React, { useState } from 'react';
import {
    StyleSheet,
    Linking,
    Platform,
    TouchableOpacity,
    View,
    Image,
} from 'react-native';
import { Text, IconButton, Snackbar, Divider } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LabelText from '@/components/LabelText';
import { TravelCoords } from '@/src/types/types';

type Props = {
    travel: TravelCoords;
    isTablet?: boolean;
    isMobile?: boolean;
};

const AddressListItem: React.FC<Props> = ({
                                              travel,
                                              isTablet = false,
                                              isMobile = false,
                                          }) => {
    const {
        address,
        categoryName,
        coord,
        travelImageThumbUrl,
        articleUrl,
        urlTravel,
    } = travel;

    const shortCoord =
        typeof coord === 'string' && coord.length > 20
            ? coord.substring(0, 20) + '...'
            : coord || '';

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleCopyCoords = () => {
        if (!coord) return;
        Clipboard.setString(coord);
        setSnackbarMessage('Координаты скопированы!');
        setSnackbarVisible(true);
    };

    const handleOpenTelegram = () => {
        if (!coord) return;
        const url =
            'https://t.me/share/url?url=' +
            encodeURIComponent(coord) +
            '&text=' +
            encodeURIComponent(`Координаты места: ${coord}`);
        Linking.openURL(url);
    };

    const handleOpenLink = () => {
        const url = articleUrl || urlTravel;
        if (url) Linking.openURL(url);
    };

    const handleOpenMap = () => {
        if (coord) Linking.openURL(`https://maps.google.com/?q=${coord}`);
    };

    const categoryIcon = getCategoryIcon(categoryName);
    const badgeStyle = getCategoryBadgeStyle(categoryName);

    return (
        <>
            <View style={[styles.container, isMobile && { marginHorizontal: 4 }]}>
                <Image
                    source={
                        travelImageThumbUrl
                            ? { uri: travelImageThumbUrl }
                            : require('@/assets/no-data.png')
                    }
                    style={[styles.image, isMobile && { height: 120 }]}
                    resizeMode='cover'
                />

                <View style={styles.content}>
                    {!!address && (
                        <>
                            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                                {address}
                            </Text>
                            <Divider style={styles.divider} />
                        </>
                    )}

                    {!!shortCoord && (
                        <>
                            <LabelText
                                label="Координаты:"
                                text={
                                    <TouchableOpacity onPress={handleOpenMap}>
                                        <Text style={styles.coordLink} numberOfLines={1}>
                                            {shortCoord}
                                        </Text>
                                    </TouchableOpacity>
                                }
                                labelStyle={styles.labelText}
                            />
                            <View style={styles.actions}>
                                <Tooltip icon="content-copy" onPress={handleCopyCoords} tooltip="Скопировать" />
                                <Tooltip icon="send" onPress={handleOpenTelegram} tooltip="В Telegram" />
                                <Tooltip icon="link" onPress={handleOpenLink} tooltip="Подробнее" />
                            </View>
                            <Divider style={styles.divider} />
                        </>
                    )}

                    {!!categoryName && (
                        <View style={[styles.categoryWrapper, badgeStyle]}>
                            {categoryIcon && (
                                <MaterialCommunityIcons name={categoryIcon} size={14} color="#fff" style={{ marginRight: 4 }} />
                            )}
                            <Text style={styles.categoryText}>{categoryName}</Text>
                        </View>
                    )}
                </View>
            </View>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={2000}
                style={styles.snackbar}
                action={{ label: 'OK', onPress: () => setSnackbarVisible(false) }}
            >
                {snackbarMessage}
            </Snackbar>
        </>
    );
};

const Tooltip = ({
                     icon,
                     onPress,
                     tooltip,
                 }: {
    icon: string;
    onPress: () => void;
    tooltip: string;
}) => {
    const [hovered, setHovered] = useState(false);

    if (Platform.OS !== 'web') {
        return (
            <IconButton icon={icon} size={20} onPress={onPress} color="#6AAAAA" />
        );
    }

    return (
        <View
            style={{ position: 'relative', display: 'inline-flex' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <IconButton icon={icon} size={20} onPress={onPress} color="#6AAAAA" />
            {hovered && (
                <View style={styles.tooltip}>
                    <Text style={styles.tooltipText}>{tooltip}</Text>
                </View>
            )}
        </View>
    );
};

const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
        case 'природа':
            return 'tree';
        case 'город':
            return 'city-variant';
        case 'музей':
            return 'bank';
        default:
            return undefined;
    }
};

const getCategoryBadgeStyle = (category?: string) => {
    let backgroundColor = '#bbb';
    switch (category?.toLowerCase()) {
        case 'природа':
            backgroundColor = '#4CAF50';
            break;
        case 'город':
            backgroundColor = '#2196F3';
            break;
        case 'музей':
            backgroundColor = '#9C27B0';
            break;
        default:
            backgroundColor = '#ccc';
            break;
    }
    return { backgroundColor };
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginVertical: 8,
        overflow: 'hidden',
        elevation: 1,
    },
    image: {
        width: '100%',
        height: 140,
    },
    content: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#222',
    },
    labelText: {
        fontSize: 13,
        color: '#444',
    },
    coordLink: {
        fontSize: 13,
        color: '#007AFF',
    },
    divider: {
        marginVertical: 6,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 6,
    },
    categoryWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginTop: 6,
    },
    categoryText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    tooltip: {
        position: 'absolute',
        bottom: '100%',
        left: 0,
        backgroundColor: '#333',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        marginBottom: 6,
        zIndex: 1000,
    },
    tooltipText: {
        color: '#fff',
        fontSize: 12,
    },
    snackbar: {
        backgroundColor: '#333',
        marginHorizontal: 16,
        borderRadius: 8,
    },
});

export default AddressListItem;
