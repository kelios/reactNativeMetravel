import React, { useState } from 'react';
import {
    StyleSheet,
    Linking,
    Image,
    View as RNView,
    Platform,
} from 'react-native';
import {
    Card,
    Divider,
    Button,
    Text,
    useTheme,
    IconButton,
    Snackbar,
} from 'react-native-paper';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import * as Clipboard from 'expo-clipboard';

import LabelText from '@/components/LabelText';
import { TravelCoords } from '@/src/types/types';

type AddressListItemProps = {
    travel: TravelCoords;
};

const AddressListItem: React.FC<AddressListItemProps> = ({ travel }) => {
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

    const handlePressLink = () => {
        const link = articleUrl || urlTravel;
        if (link) {
            Linking.openURL(link).catch(err =>
                console.error('Failed to open URL:', err)
            );
        }
    };

    const handleCopyCoords = () => {
        if (!coord) return;
        Clipboard.setString(coord);
        setSnackbarMessage('Координаты скопированы!');
        setSnackbarVisible(true);
    };

    const handleShareTelegram = () => {
        if (!coord) return;
        const telegramShareUrl =
            'https://t.me/share/url?url=' + encodeURIComponent(coord) +
            '&text=' + encodeURIComponent(`Координаты места: ${coord}`);
        Linking.openURL(telegramShareUrl).catch(err =>
            console.error('Failed to open Telegram URL:', err)
        );
    };

    const categoryBadgeStyle = getCategoryBadgeStyle(categoryName);

    return (
        <>
            <Card style={styles.container} mode="contained">
                {/* Фото */}
                {travelImageThumbUrl ? (
                    <Card.Cover
                        source={{ uri: travelImageThumbUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <Image
                        source={require('@/assets/no-data.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                )}

                {/* Контент */}
                <Card.Content style={styles.cardContent}>
                    {!!address && (
                        <>
                            <Text style={styles.title} numberOfLines={2}>
                                {address}
                            </Text>
                            <Divider style={styles.divider} />
                        </>
                    )}

                    {!!shortCoord && (
                        <>
                            <LabelText
                                label="Координаты:"
                                text={shortCoord}
                                labelStyle={styles.labelText}
                                textStyle={styles.labelText}
                            />
                            <RNView style={styles.coordsActions}>
                                <Tooltip icon="content-copy" onPress={handleCopyCoords} tooltip="Скопировать" />
                                <Tooltip icon="send" onPress={handleShareTelegram} tooltip="В Telegram" />
                            </RNView>
                            <Divider style={styles.divider} />
                        </>
                    )}

                    {!!categoryName && (
                        <RNView style={[styles.categoryWrapper, categoryBadgeStyle]}>
                            <Text style={styles.categoryText}>{categoryName}</Text>
                        </RNView>
                    )}
                </Card.Content>

                <Card.Actions style={styles.actions}>
                    <Button
                        onPress={handlePressLink}
                        mode="contained-tonal"
                        icon="link"
                        buttonColor="#ff9f5a"
                        textColor="#fff"
                        style={styles.moreButton}
                        labelStyle={{ fontWeight: '600' }}
                    >
                        Подробнее
                    </Button>
                </Card.Actions>
            </Card>

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
            <IconButton icon={icon} size={20} color="#6AAAAA" onPress={onPress} />
        );
    }

    return (
        <RNView
            style={{ position: 'relative', display: 'inline-flex' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <IconButton icon={icon} size={20} color="#6AAAAA" onPress={onPress} />
            {hovered && (
                <RNView style={styles.tooltip}>
                    <Text style={styles.tooltipText}>{tooltip}</Text>
                </RNView>
            )}
        </RNView>
    );
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
        borderRadius: 16,
        marginVertical: 10,
        marginHorizontal: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    image: {
        width: '100%',
        height: 180,
    },
    cardContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        gap: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
    },
    divider: {
        marginVertical: 8,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    coordsActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    labelText: {
        fontSize: 14,
        color: '#444',
    },
    categoryWrapper: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    categoryText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
    },
    actions: {
        justifyContent: 'flex-end',
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    moreButton: {
        borderRadius: 8,
    },
    snackbar: {
        backgroundColor: '#333',
        marginHorizontal: 16,
        borderRadius: 8,
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
});

export default AddressListItem;
