import React from 'react';
import { StyleSheet, View } from 'react-native';
import Head from 'expo-router/head';
import ListTravel from '@/components/listTravel/ListTravel';

export default function TravelScreen() {
    return (
        <>
            <Head>
                <title key="title">Маршруты, идеи и вдохновение для путешествий по Беларуси | Metravel</title>
                <meta
                    key="description"
                    name="description"
                    content="Авторские маршруты, советы и впечатления от путешественников по всему миру. Присоединяйся к сообществу Metravel и вдохновляйся на новые открытия!"
                />

                {/* OG meta */}
                <meta key="og:title" property="og:title" content="Маршруты, идеи и вдохновение для путешествий по Беларуси | Metravel" />
                <meta key="og:description" property="og:description" content="Авторские маршруты, советы и впечатления от путешественников по всему миру." />
                <meta key="og:url" property="og:url" content="https://metravel.by/" />
                <meta key="og:image" property="og:image" content="https://metravel.by/og-preview.jpg" />

                {/* Twitter Card */}
                <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
                <meta key="twitter:title" name="twitter:title" content="Маршруты, идеи и вдохновение для путешествий по Беларуси | Metravel" />
                <meta key="twitter:description" name="twitter:description" content="Авторские маршруты, советы и впечатления от путешественников по всему миру." />
                <meta key="twitter:image" name="twitter:image" content="https://metravel.by/og-preview.jpg" />
            </Head>

            <View style={styles.container}>
                <ListTravel />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
