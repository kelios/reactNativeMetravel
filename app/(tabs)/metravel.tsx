import React, { Suspense } from 'react';
import Head from 'expo-router/head';
import ListTravel from '@/components/listTravel/ListTravel';

export default function MeTravelScreen() {
    return (
        <>
            <Head>
                <title key="title">Мои путешествия | Metravel</title>
                <meta
                    key="description"
                    name="description"
                    content="Список ваших опубликованных и черновых путешествий на платформе Metravel."
                />
                <meta key="og:title" property="og:title" content="Мои путешествия | Metravel" />
                <meta key="og:description" property="og:description" content="Список ваших опубликованных и черновых путешествий на платформе Metravel." />
                <meta key="og:url" property="og:url" content="https://metravel.by/metravel" />
                <meta key="og:image" property="og:image" content="https://metravel.by/og-preview.jpg" />
                <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
                <meta key="twitter:title" name="twitter:title" content="Мои путешествия | Metravel" />
                <meta key="twitter:description" name="twitter:description" content="Список ваших опубликованных и черновых путешествий на платформе Metravel." />
                <meta key="twitter:image" name="twitter:image" content="https://metravel.by/og-preview.jpg" />
            </Head>

            <Suspense fallback={<div>Загрузка...</div>}>
                <ListTravel />
            </Suspense>
        </>
    );
}
