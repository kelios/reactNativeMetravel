import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Platform,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { Text, IconButton, Snackbar, Divider } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
    travel: {
        address: string;
        coord: string;
        travelImageThumbUrl?: string;
        categoryName?: string;
        articleUrl?: string;
        urlTravel?: string;
    };
}

const PopupContentComponent: React.FC<Props> = ({ travel }) => {
    const {
        address,
        coord,
        travelImageThumbUrl,
        categoryName,
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
            <View style={styles.popup}>
                {travelImageThumbUrl ? (
                    <Image source={{ uri: travelImageThumbUrl }} style={styles.img} />
                ) : (
                    <Text style={styles.noImg}>Нет изображения</Text>
                )}

                {address && (
                    <>
                        <Text style={styles.title} numberOfLines={1}>
                            {address}
                        </Text>
                        <Divider style={styles.divider} />
                    </>
                )}

                {shortCoord && (
                    <>
                        <Text style={styles.label}>Координаты:</Text>
                        <TouchableOpacity onPress={handleOpenMap}>
                            <Text style={styles.coordLink} numberOfLines={1}>
                                {shortCoord}
                            </Text>
                        </TouchableOpacity>
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
        return <IconButton icon={icon} size={20} onPress={onPress} color="#6AAAAA" />;
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
    }
    return { backgroundColor };
};

const styles = StyleSheet.create({
    popup: {
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 4,
        maxWidth: 240,
    },
    img: {
        width: '100%',
        height: 100,
        borderRadius: 8,
        marginBottom: 6,
    },
    noImg: {
        fontStyle: 'italic',
        color: '#888',
        marginBottom: 6,
    },
    title: {
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        color: '#555',
        fontWeight: '500',
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
        gap: 10,
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

export default PopupContentComponent;
