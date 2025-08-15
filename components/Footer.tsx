// src/components/Footer.tsx
import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    useWindowDimensions,
    Pressable,
    Image,
    Linking,
} from 'react-native';
import { Link, Href } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon5 from 'react-native-vector-icons/FontAwesome5';

type NavItem = { icon: string; label: string; route: Href };

const Footer: React.FC = () => {
    const { width } = useWindowDimensions();
    const isMobile = width <= 500;
    const s = useMemo(() => createStyles(width), [width]);

    const open = (url: string) => Linking.openURL(url).catch(() => {});

    const nav: NavItem[] = [
        { icon: 'home',       label: 'Путешествия',    route: '/' },
        { icon: 'globe',      label: 'Беларусь',       route: '/travelsby' },
        { icon: 'map',        label: 'Карта',          route: '/map' },
        { icon: 'list',       label: 'Пишут о BY',     route: '/travels/akkaunty-v-instagram-o-puteshestviyah-po-belarusi' },
        { icon: 'envelope',   label: 'Обратная связь', route: '/contact' },
        { icon: 'info-circle',label: 'О сайте',        route: '/about' },
    ];

    const social = [
        { icon: <Icon5 name="tiktok" size={20} color="#ff9f5a" />, url: 'https://www.tiktok.com/@metravel.by', label: 'TikTok' },
        { icon: <Icon name="instagram" size={20} color="#ff9f5a" />, url: 'https://www.instagram.com/metravelby/', label: 'Instagram' },
        { icon: <Icon name="youtube" size={20} color="#ff9f5a" />, url: 'https://www.youtube.com/@metravelby', label: 'YouTube' },
    ];

    if (isMobile) {
        return (
            <View style={s.root}>
                <View style={s.row}>
                    {nav.map(item => (
                        <Link key={item.label} href={item.route} accessibilityLabel={item.label}>
                            <Icon name={item.icon} size={20} color="#ff9f5a" style={s.pad} />
                        </Link>
                    ))}
                    {social.map(item => (
                        <Pressable key={item.label} onPress={() => open(item.url)} hitSlop={8} accessibilityLabel={item.label} style={s.pad}>
                            {item.icon}
                        </Pressable>
                    ))}
                </View>
            </View>
        );
    }

    return (
        <View style={s.root}>
            <View style={s.links}>
                {nav.map(item => (
                    <Link key={item.label} href={item.route} style={s.link} accessibilityLabel={item.label}>
                        <Icon name={item.icon} size={20} color="#ff9f5a" />
                        <Text style={s.linkTxt}>{item.label}</Text>
                    </Link>
                ))}
            </View>
            <View style={s.bottom}>
                <View style={s.social}>
                    {social.map(item => (
                        <Pressable key={item.label} onPress={() => open(item.url)} hitSlop={8} accessibilityLabel={item.label} style={s.pad}>
                            {item.icon}
                        </Pressable>
                    ))}
                </View>
                <View style={s.brand}>
                    <Image source={require('../assets/icons/logo_yellow_60x60.png')} style={s.logo} />
                    <Text style={s.copy}>© MeTravel 2020</Text>
                </View>
            </View>
        </View>
    );
};

const createStyles = (w: number) =>
    StyleSheet.create({
        root: {
            width: '100%',
            backgroundColor: '#333',
            paddingVertical: w > 500 ? 15 : 8,
            paddingHorizontal: 20,
            borderTopWidth: 1,
            borderTopColor: '#444',
        },
        row: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 4,
            paddingTop: 2,
        },
        pad: { padding: 6 },
        links: {
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
        linkTxt: {
            color: '#ff9f5a',
            fontSize: w > 500 ? 14 : 12,
            marginLeft: 8,
        },
        bottom: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        social: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
        },
        brand: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        logo: {
            width: 30,
            height: 30,
            marginRight: 8,
        },
        copy: {
            color: '#bbb',
            fontSize: w > 500 ? 12 : 10,
        },
    });

export default Footer;
