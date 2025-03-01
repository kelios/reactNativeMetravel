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

/**
 * Простой компонент для Web, чтобы показывать tooltip при hover.
 * На мобильных платформах hover-события не работают,
 * поэтому tooltip появляться не будет.
 */
const HoverableTooltip: React.FC<{
    tooltip: string;
    children: React.ReactNode;
}> = ({ tooltip, children }) => {
    const [hovered, setHovered] = useState(false);

    // Если не web, просто возвращаем children
    if (Platform.OS !== 'web') {
        return <>{children}</>;
    }

    return (
        <RNView
            style={{ position: 'relative', display: 'inline-flex' }}
            // Для Web: onMouseEnter/onMouseLeave
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {children}
            {hovered && (
                <RNView style={styles.tooltip}>
                    <Text style={styles.tooltipText}>{tooltip}</Text>
                </RNView>
            )}
        </RNView>
    );
};

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

    // Ограничение длины координат
    const shortCoord =
        coord && coord.length > 20
            ? coord.substring(0, 20) + '...'
            : coord || '';

    // Состояние для Snackbar (уведомление внизу экрана)
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const onDismissSnackbar = () => setSnackbarVisible(false);

    // Открытие ссылки «Подробнее»
    const handlePressLink = () => {
        const link = articleUrl || urlTravel;
        if (link) {
            Linking.openURL(link).catch((err) => {
                console.error('Failed to open URL:', err);
            });
        }
    };

    // Копирование координат
    const handleCopyCoords = () => {
        if (!coord) return;
        Clipboard.setString(coord);
        setSnackbarMessage('Координаты скопированы!');
        setSnackbarVisible(true);
    };

    // Отправка координат в Telegram (через Telegram Share URL)
    const handleShareTelegram = () => {
        if (!coord) return;
        const telegramShareUrl =
            'https://t.me/share/url?url=' + encodeURIComponent(coord) +
            '&text=' + encodeURIComponent(`Координаты места: ${coord}`);
        Linking.openURL(telegramShareUrl).catch((err) => {
            console.error('Failed to open Telegram URL:', err);
        });
    };

    // Цветовая метка для категории
    const categoryBadgeStyle = getCategoryBadgeStyle(categoryName);

    // Тема React Native Paper (если нужно что-то подтянуть)
    const { colors } = useTheme();

    return (
        <>
            <Card style={styles.container} elevation={4}>
                {/* Картинка или placeholder */}
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
                        resizeMode="cover"
                    />
                )}

                <Card.Content style={styles.cardContent}>
                    {/* Заголовок — адрес */}
                    {!!address && (
                        <Text variant="titleMedium" style={styles.title}>
                            {address}
                        </Text>
                    )}

                    {!!address && <Divider style={styles.divider} />}

                    {/* Координаты (новая строка) + иконки копирования и шаринга */}
                    {!!shortCoord && (
                        <>
                            <LabelText
                                label="Координаты:"
                                text={shortCoord}
                                labelStyle={styles.labelText}
                                textStyle={styles.labelText}
                            />
                            <RNView style={styles.coordsActions}>
                                <HoverableTooltip tooltip="Скопировать координаты">
                                    <IconButton
                                        icon="content-copy"
                                        size={20}
                                        color="#6AAAAA"
                                        onPress={handleCopyCoords}
                                        accessibilityLabel="Скопировать координаты"
                                    />
                                </HoverableTooltip>

                                <HoverableTooltip tooltip="Поделиться координатами">
                                    <IconButton
                                        icon="send"
                                        size={20}
                                        color="#6AAAAA"
                                        onPress={handleShareTelegram}
                                        accessibilityLabel="Отправить координаты в Telegram"
                                    />
                                </HoverableTooltip>
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
                </Card.Content>

                {/* Кнопка «Подробнее» */}
                <Card.Actions style={styles.actions}>
                    <Button
                        onPress={handlePressLink}
                        mode="contained"
                        icon="link"
                        buttonColor="#ff9f5a" // брендовый оранжевый
                        textColor="#fff"
                    >
                        Подробнее
                    </Button>
                </Card.Actions>
            </Card>

            {/* Snackbar для уведомлений (копирование координат) */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={onDismissSnackbar}
                duration={2000}
                action={{
                    label: 'OK',
                    onPress: () => {
                        setSnackbarVisible(false);
                    },
                }}
            >
                {snackbarMessage}
            </Snackbar>
        </>
    );
};

/**
 * Вычисляем стиль бейджа для категории
 */
function getCategoryBadgeStyle(category?: string) {
    if (!category) return {};
    let backgroundColor = '#bbb';

    // Примеры назначения цвета по типам
    switch (category.toLowerCase()) {
        case 'природа':
            backgroundColor = '#4CAF50';
            break;
        case 'город':
            backgroundColor = '#2196F3';
            break;
        case 'музей':
            backgroundColor = '#9C27B0';
            break;
        // ...и т. д. на ваше усмотрение
        default:
            backgroundColor = '#ccc';
            break;
    }

    return { backgroundColor };
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF', // Белый фон карточки
        borderRadius: 12,
        marginVertical: wp(2),
        marginHorizontal: wp(4),
        overflow: 'hidden', // скругление для изображения
    },
    image: {
        width: '100%',
        height: 180,
    },
    cardContent: {
        paddingTop: wp(3),
        paddingBottom: wp(2),
    },
    title: {
        color: '#333',
        fontWeight: '700',
        marginBottom: 5,
    },
    divider: {
        backgroundColor: '#d1d1d1',
        marginVertical: wp(1),
        height: 1,
    },
    categoryWrapper: {
        borderRadius: 8,
        paddingHorizontal: wp(2),
        paddingVertical: wp(1),
        alignSelf: 'flex-start',
        marginTop: wp(1.5),
    },
    categoryText: {
        color: '#fff',
        fontSize: 13,
    },
    actions: {
        justifyContent: 'flex-end',
        paddingHorizontal: wp(2),
        paddingBottom: wp(2),
    },

    // Новая строка для иконок копирования/шаринга
    coordsActions: {
        flexDirection: 'row',
        marginTop: wp(1),
        marginBottom: wp(1),
    },

    // Текст для лейбла и координат
    labelText: {
        color: '#333',
    },

    // Стили для tooltip (только Web)
    tooltip: {
        position: 'absolute',
        bottom: '100%', // над иконкой
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
        fontSize: 12,
    },
});

export default AddressListItem;
