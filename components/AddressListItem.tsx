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
            Linking.openURL(link).catch((err) => {
                console.error('Failed to open URL:', err);
            });
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
        Linking.openURL(telegramShareUrl).catch((err) => {
            console.error('Failed to open Telegram URL:', err);
        });
    };

    const categoryBadgeStyle = getCategoryBadgeStyle(categoryName);

    return (
        <>
            <Card style={styles.container} elevation={4}>
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
                    <RNView style={styles.cardInnerWrapper}>
                        {/* Адрес */}
                        {!!address && (
                            <>
                                <Text
                                    variant="titleMedium"
                                    style={styles.title}
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                >
                                    {address}
                                </Text>
                                <Divider style={styles.divider} />
                            </>
                        )}

                        {/* Координаты */}
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
                                    <Tooltip icon="send" onPress={handleShareTelegram} tooltip="Отправить в Telegram" />
                                </RNView>
                                <Divider style={styles.divider} />
                            </>
                        )}

                        {/* Категория */}
                        {!!categoryName && (
                            <RNView style={[styles.categoryWrapper, categoryBadgeStyle]}>
                                <Text style={styles.categoryText}>{categoryName}</Text>
                            </RNView>
                        )}
                    </RNView>
                </Card.Content>

                {/* Кнопка Подробнее */}
                <Card.Actions style={styles.actions}>
                    <Button
                        onPress={handlePressLink}
                        mode="contained"
                        icon="link"
                        buttonColor="#ff9f5a"
                        textColor="#fff"
                    >
                        Подробнее
                    </Button>
                </Card.Actions>
            </Card>

            {/* Snackbar */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={2000}
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
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginVertical: wp(2),
        marginHorizontal: wp(4),
        overflow: 'hidden',
        elevation: 4,
    },
    image: {
        width: '100%',
        height: wp(40),
    },
    cardContent: {
        paddingHorizontal: wp(4),
        paddingVertical: wp(3),
    },
    cardInnerWrapper: {
        flexDirection: 'column',
        gap: wp(2),
    },
    title: {
        color: '#333',
        fontWeight: '700',
    },
    divider: {
        backgroundColor: '#d1d1d1',
        height: 1,
    },
    coordsActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    labelText: {
        color: '#333',
    },
    categoryWrapper: {
        borderRadius: 6,
        paddingHorizontal: wp(2),
        paddingVertical: wp(0.5),
        alignSelf: 'flex-start',
        maxWidth: '90%',
    },
    categoryText: {
        color: '#fff',
        fontSize: wp(3),
        fontWeight: '500',
    },
    actions: {
        justifyContent: 'flex-end',
        paddingHorizontal: wp(2),
        paddingBottom: wp(2),
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
        zIndex: 9999,
    },
    tooltipText: {
        color: '#fff',
        fontSize: wp(3),
    },
});

export default AddressListItem;
