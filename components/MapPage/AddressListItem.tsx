import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Linking,
} from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { TravelCoords } from '@/src/types/types';

type Props = {
    travel: TravelCoords;
};

const AddressListItem: React.FC<Props> = ({ travel }) => {
    const { address, categoryName, coord, travelImageThumbUrl, articleUrl, urlTravel } = travel;

    const handleCopyCoords = () => {
        if (coord) Clipboard.setString(coord);
    };

    const handleOpenTelegram = () => {
        if (!coord) return;
        const url = `https://t.me/share/url?url=${encodeURIComponent(coord)}&text=${encodeURIComponent(`Координаты: ${coord}`)}`;
        Linking.openURL(url);
    };

    const handleOpenLink = () => {
        const url = articleUrl || urlTravel;
        if (url) Linking.openURL(url);
    };

    const handleOpenMap = () => {
        if (coord) Linking.openURL(`https://maps.google.com/?q=${coord}`);
    };

    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={handleOpenLink} activeOpacity={0.85}>
                <ImageBackground
                    source={
                        travelImageThumbUrl
                            ? { uri: travelImageThumbUrl }
                            : require('@/assets/no-data.png')
                    }
                    style={styles.image}
                    imageStyle={{ borderRadius: 12 }}
                >
                    <View style={styles.iconButtons}>
                        <View style={styles.iconButton}>
                            <IconButton icon="link" size={18} onPress={handleOpenLink} iconColor="#fff" />
                        </View>
                        <View style={styles.iconButton}>
                            <IconButton icon="content-copy" size={18} onPress={handleCopyCoords} iconColor="#fff" />
                        </View>
                        <View style={styles.iconButton}>
                            <IconButton icon="send" size={18} onPress={handleOpenTelegram} iconColor="#fff" />
                        </View>
                    </View>

                    <View style={styles.overlay}>
                        {address && <Text style={styles.title} numberOfLines={1}>{address}</Text>}

                        {coord && (
                            <TouchableOpacity onPress={handleOpenMap}>
                                <Text style={styles.coord}>{coord}</Text>
                            </TouchableOpacity>
                        )}

                        {categoryName && (
                            <View style={styles.categoryContainer}>
                                {categoryName.split(',').map((cat, index) => (
                                    <View key={index} style={styles.category}>
                                        <Text style={styles.categoryText}>{cat.trim()}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
        marginHorizontal: 4,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f3f3f3',
        elevation: 3,
    },
    image: {
        height: 220,
        justifyContent: 'flex-end',
    },
    iconButtons: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        zIndex: 2,
    },
    iconButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 6,
        marginLeft: 4,
    },
    overlay: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    title: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
        marginBottom: 4,
    },
    coord: {
        color: '#cceeff',
        textDecorationLine: 'underline',
        fontSize: 12,
        marginBottom: 6,
    },
    category: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    categoryText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
});

export default AddressListItem;
