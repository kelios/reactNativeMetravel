// app/travel/index.tsx
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { usePathname } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

import ListTravel from '@/components/listTravel/ListTravel';
import InstantSEO from '@/components/seo/InstantSEO';

export default function TravelScreen() {
    const pathname = usePathname();
    const isFocused = useIsFocused();

    const SITE = process.env.EXPO_PUBLIC_SITE_URL || 'https://metravel.by';

    // стабильный canonical без промежуточных значений при навигации
    const canonical = useMemo(() => `${SITE}${pathname || ''}`, [SITE, pathname]);

    const title = 'Маршруты, идеи и вдохновение для путешествий | Metravel';
    const description =
        'Авторские маршруты, советы и впечатления от путешественников по всему миру. Присоединяйся к сообществу Metravel и вдохновляйся на новые открытия!';

    return (
        <>
            {isFocused && (
                <InstantSEO
                    headKey="travel-list"
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
