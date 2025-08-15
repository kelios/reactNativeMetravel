import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import "@expo/metro-runtime";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { MD3LightTheme as DefaultTheme, PaperProvider } from "react-native-paper";
import { FiltersProvider } from "@/providers/FiltersProvider";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Head from "expo-router/head";

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
    const showFooter = useMemo(() => {
        if (typeof window === "undefined") return true;
        const pathname = window.location.pathname;
        return !["/login", "/onboarding"].includes(pathname);
    }, []);

    return (
        <PaperProvider theme={theme}>
            <AuthProvider>
                <QueryClientProvider client={queryClient}>
                    {__DEV__ && Platform.OS !== "web" && <ReactQueryDevtools initialIsOpen={false} />}
                    <FiltersProvider>
                        <View style={styles.wrapper}>
                            <Head>
                                <meta name="viewport" content="width=device-width, initial-scale=1" />
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
    wrapper: { flex: 1, justifyContent: "space-between" },
    content: { flex: 1 },
    loading: { padding: 8 },
});
