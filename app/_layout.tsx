// app/_layout.tsx
import "@expo/metro-runtime";
import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, usePathname } from "expo-router";
import Head from "expo-router/head";
import { MD3LightTheme as DefaultTheme, PaperProvider } from "react-native-paper";
import { FiltersProvider } from "@/providers/FiltersProvider";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const Footer = lazy(() => import("@/components/Footer"));

const fontMap =
    Platform.OS === "web"
        ? {}
        : {
            FontAwesome:
                require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf"),
        } as const;

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: "orange",
        secondary: "yellow",
        background: "#f8f8f8",
        surface: "#ffffff",
        error: "#d32f2f",
        onPrimary: "#fff",
        onSecondary: "#fff",
        onBackground: "#000",
        onSurface: "#000",
        onError: "#fff",
    },
    fonts: {
        ...DefaultTheme.fonts,
        bodyLarge:
            Platform.OS === "web"
                ? { ...DefaultTheme.fonts.bodyLarge, fontFamily: 'ui-serif, "Times New Roman", Georgia, serif' }
                : { ...DefaultTheme.fonts.bodyLarge, fontFamily: '"Playfair Display", serif' },
    },
} as const;

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
    const [loaded, error] = useFonts(fontMap);
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
    const SITE = process.env.EXPO_PUBLIC_SITE_URL || "https://metravel.by";
    const canonical = `${SITE}${pathname || "/"}`;

    // страницы, где не показываем футер
    const showFooter = useMemo(() => !["/login", "/onboarding"].includes(pathname || ""), [pathname]);

    const defaultTitle = "MeTravel — путешествия и маршруты";
    const defaultDescription = "Маршруты, места и впечатления от путешественников.";

    return (
        <PaperProvider theme={theme}>
            <AuthProvider>
                <QueryClientProvider client={queryClient}>
                    {__DEV__ && Platform.OS !== "web" && <ReactQueryDevtools initialIsOpen={false} />}
                    <FiltersProvider>
                        <View style={styles.wrapper}>
                            {/* Базовые head-теги. Страницы будут переопределять их через InstantSEO. */}
                            <Head>
                                {/* Только базовые неизменяемые теги */}
                                <link rel="icon" href="/favicon.ico" />
                                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

                                {/* Fallback значения - будут использоваться только если страница не предоставит свои */}
                                <title key="fallback-title">{defaultTitle}</title>
                                <meta key="fallback-description" name="description" content={defaultDescription} />
                                <link key="fallback-canonical" rel="canonical" href={canonical} />
                            </Head>

                            <View style={styles.content}>
                                <Stack screenOptions={{ headerShown: false }}>
                                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                                </Stack>
                            </View>

                            {showFooter && (
                                <Suspense fallback={<ActivityIndicator size="small" color="#6B4F4F" style={styles.loading} />}>
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
    wrapper: { flex: 1, justifyContent: "space-between" },
    content: { flex: 1 },
    loading: { padding: 8 },
});