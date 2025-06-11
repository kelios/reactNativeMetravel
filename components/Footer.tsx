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
import Icon from 'react-native-vector-icons/FontAwesome';          // FA 4 (home, globe…)
import Icon5 from 'react-native-vector-icons/FontAwesome5';        // FA 5 (tiktok)

type NavItem = { name: string; label: string; route: Href };

const Footer: React.FC = () => {
    /* ---------- breakpoint ---------- */
    const { width } = useWindowDimensions();
    const isMobile = width <= 500;

    /* ---------- navigation ---------- */
    const nav: NavItem[] = [
        { name: 'home',        label: 'Путешествия',  route: '/' },
        { name: 'globe',       label: 'Беларусь',     route: '/travelsby' },
        { name: 'map',         label: 'Карта',        route: '/map' },
        { name: 'instagram',   label: 'Insta BY',    route: '/travels/akkaunty-v-instagram-o-puteshestviyah-po-belarusi' },
        { name: 'envelope',    label: 'Обратная связь', route: '/contact' },
        { name: 'info-circle', label: 'О сайте',      route: '/about' },
    ];

    /* ---------- memoised styles ---------- */
    const s = useMemo(() => createStyles(width), [width]);

    /* ---------- helpers ---------- */
    const open = (url: string) => Linking.openURL(url).catch(() => {});

    /* ---------- MOBILE  ---------- */
    if (isMobile) {
        return (
            <View style={s.root}>
                <View style={s.row}>
                    {nav.slice(0, 3).map(item => (
                        <Link key={item.name} href={item.route} accessibilityLabel={item.label}>
                            <Icon name={item.name} size={20} color="#ff9f5a" style={s.pad} />
                        </Link>
                    ))}

                    <Pressable onPress={() => open('https://www.tiktok.com/@metravel.by')} hitSlop={8} accessibilityLabel="TikTok">
                        <Icon5 name="tiktok" size={20} color="#ff9f5a" style={s.pad} />
                    </Pressable>

                    <Pressable onPress={() => open('https://www.instagram.com/metravelby/')} hitSlop={8} accessibilityLabel="Instagram">
                        <Icon name="instagram" size={20} color="#ff9f5a" style={s.pad} />
                    </Pressable>

                    <Pressable onPress={() => open('https://www.youtube.com/@metravelby')} hitSlop={8} accessibilityLabel="YouTube">
                        <Icon name="youtube" size={20} color="#ff9f5a" style={s.pad} />
                    </Pressable>
                </View>
            </View>
        );
    }

    /* ---------- DESKTOP / TABLET ---------- */
    return (
        <View style={s.root}>
            <View style={s.links}>
                {nav.map(item => (
                    <Link key={item.name} href={item.route} style={s.link} accessibilityLabel={item.label}>
                        <Icon name={item.name} size={20} color="#ff9f5a" />
                        <Text style={s.linkTxt}>{item.label}</Text>
                    </Link>
                ))}
            </View>

            <View style={s.bottom}>
                <View style={s.social}>
                    <Pressable onPress={() => open('https://www.tiktok.com/@metravel.by')} hitSlop={8} accessibilityLabel="TikTok">
                        <Icon5 name="tiktok" size={20} color="#ff9f5a" style={s.pad} />
                    </Pressable>
                    <Pressable onPress={() => open('https://www.instagram.com/metravelby/')} hitSlop={8} accessibilityLabel="Instagram">
                        <Icon name="instagram" size={20} color="#ff9f5a" style={s.pad} />
                    </Pressable>
                    <Pressable onPress={() => open('https://www.youtube.com/@metravelby')} hitSlop={8} accessibilityLabel="YouTube">
                        <Icon name="youtube" size={20} color="#ff9f5a" style={s.pad} />
                    </Pressable>
                </View>

                <View style={s.brand}>
                    <Image source={require('../assets/icons/logo_yellow_60x60.png')} style={s.logo} />
                    <Text style={s.copy}>© MeTravel 2020</Text>
                </View>
            </View>
        </View>
    );
};

/* ---------- styles ---------- */
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
        /* mobile row */
        row: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
        pad: { padding: 6 },

        /* links (desktop) */
        links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
        link:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10, maxWidth: '48%' },
        linkTxt: { color: '#ff9f5a', fontSize: w > 500 ? 14 : 12, marginLeft: 8 },

        /* bottom line */
        bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        social: { flexDirection: 'row', alignItems: 'center' },
        brand:  { flexDirection: 'row', alignItems: 'center' },
        logo:   { width: 30, height: 30, marginRight: 8 },
        copy:   { color: '#bbb', fontSize: w > 500 ? 12 : 10 },
    });

export default Footer;
