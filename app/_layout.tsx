import React, {lazy, useEffect} from 'react';
import '@expo/metro-runtime';
import {Platform, StyleSheet, View} from 'react-native';
import {useFonts} from 'expo-font';
import {SplashScreen, Stack} from 'expo-router';
import {MD3LightTheme as DefaultTheme, PaperProvider,} from 'react-native-paper';
import {FiltersProvider} from '@/providers/FiltersProvider';
import {AuthProvider} from '@/context/AuthContext';
// 🎨 Только на мобильных загружаем FontAwesome
import FontAwesome from '@expo/vector-icons/FontAwesome';

const Footer = lazy(() => import('@/components/Footer'));

// ⚙️ Только на мобильных подключаем gesture/reanimated
if (Platform.OS !== 'web') {
    require('react-native-reanimated');
    require('react-native-gesture-handler');
}

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: 'orange',
        secondary: 'yellow',
        background: '#f8f8f8',
        surface: '#ffffff',
        error: '#d32f2f',
        onPrimary: '#fff',
        onSecondary: '#fff',
        onBackground: '#000',
        onSurface: '#000',
        onError: '#fff',
        elevation: {
            level0: 'transparent',
            level1: '#f0f0f0',
            level2: '#e0e0e0',
            level3: '#d0d0d0',
            level4: '#c0c0c0',
            level5: '#b0b0b0',
        },
    },
    fonts: {
        ...DefaultTheme.fonts,
        bodyLarge: {
            ...DefaultTheme.fonts.bodyLarge,
            fontFamily: 'Playfair Display, serif',
        },
    },
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts(
        Platform.OS === 'web'
            ? {} // не грузим иконки на веб
            : {
                ...FontAwesome.font,
            }
    );

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) return null;

    return <RootLayoutNav />;
}

function RootLayoutNav() {
    return (
        <PaperProvider theme={theme}>
            <AuthProvider>
                <FiltersProvider>
                    <View style={styles.wrapper}>
                        <View style={styles.content}>
                            <Stack>
                                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                            </Stack>
                        </View>
                        <Footer />
                    </View>
                </FiltersProvider>
            </AuthProvider>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
    },
});
