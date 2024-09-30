import React, { useEffect } from 'react';
import '@expo/metro-runtime';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useRouter } from 'expo-router';  // Updated here
import {
    MD3LightTheme as DefaultTheme,
    PaperProvider,
} from 'react-native-paper';
import { PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display';
import { FiltersProvider } from '@/providers/FiltersProvider';
import { AuthProvider } from '@/context/AuthContext';
import CookiePopup from "@/components/CookiePopup";

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: 'orange',
        secondary: 'yellow',
    },
};

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        PlayfairDisplay_400Regular,
        ...FontAwesome.font,
    });

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
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
                        <Stack.Screen name="(tabs)" options={{ headerShown: false, headerTitle: '' }} />
                    </Stack>
                </FiltersProvider>
            </AuthProvider>
            <CookiePopup />
        </PaperProvider>
    );
}
