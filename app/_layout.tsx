import React, { useEffect } from 'react';
import '@expo/metro-runtime';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import {
    MD3LightTheme as DefaultTheme,
    PaperProvider,
} from 'react-native-paper';
import { PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display';
import { FiltersProvider } from '@/providers/FiltersProvider';
import { AuthProvider } from '@/context/AuthContext';
import CookiePopup from '@/components/CookiePopup';
import { sendAnalyticsEvent } from '@/src/utils/analytics';
import { YandexMetricaComponent } from '@/src/utils/YandexMetrica';
import 'react-native-reanimated';
import 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

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
};

export default function RootLayout() {
    const [loaded, error] = useFonts({
        PlayfairDisplay_400Regular,
        ...FontAwesome.font,
    });

    useEffect(() => {
        const shouldSendAnalytics = process.env.EXPO_PUBLIC_IS_LOCAL_API !== 'true';

        if (shouldSendAnalytics) {
            sendAnalyticsEvent('app_open', { screen: 'Home' });
        }
    }, []);

    useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return <RootLayoutNav />;
}

function RootLayoutNav() {
    return (
        <PaperProvider theme={theme}>
            <AuthProvider>
                <FiltersProvider>
                    <Stack>
                        <Stack.Screen
                            name="(tabs)"
                            options={{ headerShown: false }}
                        />
                    </Stack>
                    <YandexMetricaComponent />
                </FiltersProvider>
            </AuthProvider>
            <CookiePopup />
        </PaperProvider>
    );
}
