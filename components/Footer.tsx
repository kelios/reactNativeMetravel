import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    Image,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Link, Href } from 'expo-router';

type LinkItem = {
    name: string;
    label: string;
    route: Href;
};

const Footer: React.FC = () => {
    const windowsWidth = useWindowDimensions().width;
    const styles = getStyles(windowsWidth);

    const links: LinkItem[] = [
        { name: 'home', label: 'Путешествия', route: '/' },
        { name: 'globe', label: 'Беларусь', route: '/travelsby' },
        { name: 'map', label: 'Карта', route: '/map' },
        { name: 'instagram', label: 'Аккаунты в Instagram', route: '/travels/akkaunty-v-instagram-o-puteshestviyah-po-belarusi' },
        { name: 'envelope', label: 'Обратная связь', route: '/contact' },
        { name: 'info-circle', label: 'О сайте', route: '/about' },
    ];

    return (
        <View style={styles.footerContainer}>
            <View style={styles.linkContainer}>
                {links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.route}
                        style={styles.link}
                    >
                        <Icon name={link.name} size={20} color="#ff9f5a" />
                        <Text style={styles.linkText}>{link.label}</Text>
                    </Link>
                ))}
            </View>

            <View style={styles.footerBottomContainer}>
                <View style={styles.socialContainer}>
                    <TouchableOpacity
                        onPress={() => Linking.openURL('https://www.tiktok.com/@metravel.by')}
                        style={styles.socialLink}
                    >
                        <View style={styles.iconBackground}>
                            <Image
                                source={require('../assets/icons/tik-tok.png')}
                                style={styles.tiktokIcon}
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => Linking.openURL('https://www.instagram.com/metravelby/')}
                        style={styles.socialLink}
                    >
                        <Icon name="instagram" size={20} color="#ff9f5a" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => Linking.openURL('https://www.youtube.com/@metravelby')}
                        style={styles.socialLink}
                    >
                        <Icon name="youtube" size={20} color="#ff9f5a" />
                    </TouchableOpacity>
                </View>

                <View style={styles.footerTextContainer}>
                    <Image
                        source={require('../assets/icons/logo_yellow.png')}
                        style={styles.footerLogo}
                    />
                    <Text style={styles.footerText}>© MeTravel 2020</Text>
                </View>
            </View>
        </View>
    );
};

const getStyles = (windowsWidth: number) => {
    return StyleSheet.create({
        footerContainer: {
            width: '100%',
            backgroundColor: '#333',
            paddingVertical: windowsWidth > 500 ? 15 : 10,
            paddingHorizontal: 20,
            borderTopWidth: 1,
            borderTopColor: '#444',
        },
        linkContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginBottom: 10,
        },
        link: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
            maxWidth: '48%',
        },
        linkText: {
            color: '#ff9f5a',
            fontSize: windowsWidth > 500 ? 14 : 12,
            marginLeft: 8,
        },
        footerBottomContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        socialContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        socialLink: {
            marginHorizontal: 10,
        },
        footerTextContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        footerText: {
            color: '#bbb',
            fontSize: windowsWidth > 500 ? 12 : 10,
            marginLeft: 8,
        },
        iconBackground: {
            backgroundColor: '#ff9f5a',
            padding: 5,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        tiktokIcon: {
            width: 15,
            height: 15,
        },
        footerLogo: {
            width: 24,
            height: 24,
            marginRight: 8,
        },
    });
};

export default Footer;