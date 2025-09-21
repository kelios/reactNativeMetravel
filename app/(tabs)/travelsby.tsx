// app/travelsby/index.tsx
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { usePathname } from 'expo-router';
import ListTravel from '@/components/listTravel/ListTravel';
import InstantSEO from '@/components/seo/InstantSEO';
import {useIsFocused} from "@react-navigation/native/src";

export default function TravelsByScreen() {
    const pathname = usePathname();
    const isFocused = useIsFocused();
    const SITE = process.env.EXPO_PUBLIC_SITE_URL || 'https://metravel.by';

    const canonical = useMemo(
        () => `${SITE}${pathname || '/travelsby'}`,
        [SITE, pathname]
    );

    const title = 'Путешествия по Беларуси | Metravel';
    const description =
        'Подборка маршрутов и мест по Беларуси: идеи для выходных и больших поездок. Фото, точки на карте и советы путешественников.';

    return (
        <>
            {isFocused && (
            <InstantSEO
                headKey="travelsby" // Упрощенный стабильный ключ
                title={title}
                description={description}
                canonical={canonical}
                image={`${SITE}/og-preview.jpg`}
                ogType="website"
            />
            )}
            <View style={styles.container}>
                <ListTravel />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
});