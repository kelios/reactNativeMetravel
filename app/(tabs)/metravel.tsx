// app/metravel/index.tsx
import React, { Suspense, useMemo } from 'react';
import { View, Text } from 'react-native';
import ListTravel from '@/components/listTravel/ListTravel';
import InstantSEO from '@/components/seo/InstantSEO';
import {useIsFocused} from "@react-navigation/native/src";

export default function MeTravelScreen() {
    const SITE = process.env.EXPO_PUBLIC_SITE_URL || 'https://metravel.by';
    const isFocused = useIsFocused();
    // стабильный canonical и стабильный ключ для head
    const canonical = useMemo(() => `${SITE}/metravel`, [SITE]);

    return (
        <>
            {isFocused && (
            <InstantSEO
                headKey="metravel" // фиксированный ключ для этой страницы
                title="Мои путешествия | Metravel"
                description="Список ваших опубликованных и черновых путешествий на платформе Metravel."
                canonical={canonical}
                image={`${SITE}/og-preview.jpg`}
                ogType="website"
            />
            )}
            <Suspense
                fallback={
                    <View style={{ padding: 16 }}>
                        <Text>Загрузка…</Text>
                    </View>
                }
            >
                <ListTravel />
            </Suspense>
        </>
    );
}
