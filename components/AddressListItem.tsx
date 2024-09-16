import React from 'react';
import {View, Pressable, StyleSheet, Linking} from 'react-native';
import {Card, Divider} from 'react-native-paper';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {TravelCoords} from '@/src/types/types';
import LabelText from '@/components/LabelText';

type AddressListItemProps = {
    travel: TravelCoords;
};

const AddressListItem: React.FC<AddressListItemProps> = ({travel}) => {
    const {
        address, categoryName, coord, travelImageThumbUrl, articleUrl, urlTravel
    } = travel;

    // Ограничение координат до определенного количества символов
    const shortCoord = coord ? coord.substring(0, 20) + (coord.length > 20 ? '...' : '') : '';

    const handlePress = () => {
        if (articleUrl || urlTravel) {
            Linking.openURL(articleUrl || urlTravel);
        }
    };

    return (
        <Pressable onPress={handlePress} style={({pressed}) => [{opacity: pressed ? 0.8 : 1}]}>
            <Card style={styles.container}>
                {travelImageThumbUrl && (
                    <Card.Cover
                        source={{uri: travelImageThumbUrl}}
                        style={styles.image}
                        resizeMode="cover"
                    />
                )}
                <Card.Content style={styles.cardContent}>
                    <LabelText label="Координаты места:" text={shortCoord}/>
                    {coord && <Divider style={styles.divider}/>}
                    <LabelText label="Адрес места:" text={address}/>
                    {address && <Divider style={styles.divider}/>}
                    <LabelText label="Категория объекта:" text={categoryName}/>
                </Card.Content>
            </Card>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        elevation: 5,
        marginVertical: wp(2),
        marginHorizontal: wp(4),
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    cardContent: {
        alignItems: 'flex-start',
        padding: wp(2),
    },
    image: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    divider: {
        backgroundColor: '#d1d1d1',
        marginVertical: 8,
        height: 1,
    },
});

export default AddressListItem;
