// app/export.tsx (или соответствующий путь)
import React, { Suspense } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { usePathname } from 'expo-router';

import InstantSEO from '@/components/seo/InstantSEO';
import ListTravel from '@/components/listTravel/ListTravel';

export default function ExportScreen() {
    const isFocused = useIsFocused();
    const pathname = usePathname();
    const SITE = process.env.EXPO_PUBLIC_SITE_URL || 'https://metravel.by';
    const canonical = `${SITE}${pathname || '/export'}`;

    const title = 'Экспорт в pdf | Metravel';
    const description =
        'Экспорт ваших опубликованных и черновых путешествий на платформе Metravel.by';

    return (
        <>
            {isFocused && (
                <InstantSEO
                    headKey="export"
                    title={title}
                    description={description}
                    canonical={canonical}
                    image={`${SITE}/og-preview.jpg`}
                    ogType="website"
                />
            )}

            <Suspense fallback={<div>Загрузка...</div>}>
                <ListTravel />
            </Suspense>
        </>
    );
}
