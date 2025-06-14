import React, { lazy, Suspense, useEffect, useState, useMemo } from 'react';
import '@expo/metro-runtime';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    View,
} from 'react-native';
import * as Font from 'expo-font';
import { SplashScreen, Stack, usePathname } from 'expo-router';
import {
    MD3LightTheme as DefaultTheme,
    PaperProvider,
} from 'react-native-paper';
import { FiltersProvider } from '@/providers/FiltersProvider';
import { AuthProvider } from '@/context/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Head from 'expo-router/head'; // ✅ правильный импорт Head для expo-router 3.x+

/* ---------------- lazy footer ---------------- */
const Footer = lazy(() => import('@/components/Footer'));

/* reanimated / gestures only native */
if (Platform.OS !== 'web') {
    require('react-native-reanimated');
    require('react-native-gesture-handler');
}

/* ---------------- theme ---------------- */
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
    },
    fonts: {
        ...DefaultTheme.fonts,
        bodyLarge: {
            ...DefaultTheme.fonts.bodyLarge,
            fontFamily: 'Playfair Display, serif',
        },
    },
};

/* ---------------- query client ---------------- */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
            keepPreviousData: true,
        },
    },
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = Font.useFonts(
        Platform.OS === 'web'
            ? {}
            : { ...FontAwesome.font },
    );

    const [appReady, setAppReady] = useState(false);

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            setAppReady(true);
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!appReady) return null;

    return <RootLayoutNav />;
}

function RootLayoutNav() {
    const pathname = usePathname();

    const showFooter = useMemo(() => {
        const noFooterPages = ['/login', '/onboarding'];
        return !noFooterPages.includes(pathname);
    }, [pathname]);

    // Можем динамически ставить title по pathname (необязательно, но полезно)
    const dynamicTitle = useMemo(() => {
        if (pathname.startsWith('/travels/')) {
            return 'Путешествие | Metravel';
        }
        if (pathname === '/metravel') {
            return 'Мои путешествия | Metravel';
        }
        return 'Путешествия | Metravel';
    }, [pathname]);

    return (
        <PaperProvider theme={theme}>
            <AuthProvider>
                <QueryClientProvider client={queryClient}>
                    {__DEV__ && Platform.OS !== 'web' && (
                        <ReactQueryDevtools initialIsOpen={false} />
                    )}
                    <FiltersProvider>
                        <View style={styles.wrapper}>
                            <Head>
                                <title>{dynamicTitle}</title>
                                <meta name="description" content="Путешествия, маршруты и статьи от сообщества Metravel." />
                                <meta name="viewport" content="width=device-width, initial-scale=1" />

                                {/* OG meta */}
                                <meta property="og:type" content="website" />
                                <meta property="og:title" content={dynamicTitle} />
                                <meta property="og:description" content="Путешествия, маршруты и статьи от сообщества Metravel." />
                                <meta property="og:url" content={`https://metravel.by${pathname}`} />
                                <meta property="og:image" content="https://metravel.by/og-preview.jpg" />

                                {/* Twitter Card */}
                                <meta name="twitter:card" content="summary_large_image" />
                                <meta name="twitter:title" content={dynamicTitle} />
                                <meta name="twitter:description" content="Путешествия, маршруты и статьи от сообщества Metravel." />
                                <meta name="twitter:image" content="https://metravel.by/og-preview.jpg" />

                                {/* Fonts */}
                                <link
                                    href="https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap"
                                    rel="stylesheet"
                                />

                                {/* Favicon */}
                                <link rel="icon" href="/favicon.ico" />
                                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                            </Head>

                            <View style={styles.content}>
                                <Stack>
                                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                                </Stack>
                            </View>

                            {showFooter && (
                                <Suspense
                                    fallback={<ActivityIndicator size="small" color="#6B4F4F" style={styles.loading} />}
                                >
                                    <Footer />
                                </Suspense>
                            )}
                        </View>
                    </FiltersProvider>
                </QueryClientProvider>
            </AuthProvider>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    wrapper: { flex: 1, justifyContent: 'space-between' },
    content: { flex: 1 },
    loading: { padding: 8 },
});
