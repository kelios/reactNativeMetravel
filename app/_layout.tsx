import React, { useEffect } from 'react';
import '@expo/metro-runtime';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import {
    MD3LightTheme as DefaultTheme,
    PaperProvider,
} from 'react-native-paper';
import { FiltersProvider } from '@/providers/FiltersProvider';
import { AuthProvider } from '@/context/AuthContext';
import CookiePopup from '@/components/CookiePopup';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { useWebAnalytics } from '@/components/analitic/useWebAnalytics';

SplashScreen.preventAutoHideAsync();

// Тема
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

export default function RootLayout() {
    // Вызов кастомного хука на верхнем уровне
    useWebAnalytics();

    // Подключение шрифтов
    const [loaded, error] = useFonts({
        ...FontAwesome.font,
    });

    // Если произошла ошибка при загрузке шрифтов — выбрасываем её
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    // Когда шрифты загрузятся — скрываем SplashScreen
    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    // Пока шрифты не загрузились, возвращаем null
    if (!loaded) return null;

    return <RootLayoutNav />;
}

function RootLayoutNav() {
    return (
        <PaperProvider theme={theme}>
            <AuthProvider>
                <FiltersProvider>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </Stack>
                </FiltersProvider>
            </AuthProvider>
        </PaperProvider>
    );
}
