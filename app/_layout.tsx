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

const Footer = lazy(() => import("@/components/Footer"));

/** ===== Helpers ===== */
const isWeb = Platform.OS === "web";

// На web шрифты не подгружаем через useFonts, чтобы не блокировать старт
const fontMap =
    isWeb
        ? ({} as const)
        : ({
            FontAwesome:
                require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf"),
        } as const);

// Тема — стабильная ссылка
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
        bodyLarge: isWeb
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

// SplashScreen только для native
if (!isWeb) {
    SplashScreen.preventAutoHideAsync().catch(() => {});
}

// Неблокирующий idle-хук для монтирования второстепенных виджетов
function useIdleFlag(timeout = 2000) {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        let armed = false;
        const arm = () => {
            if (armed) return;
            armed = true;
            setReady(true);
            cleanup();
        };
        const cleanup = () => {
            ["scroll", "mousemove", "touchstart", "keydown", "click"].forEach((e) =>
                window.removeEventListener(e, arm, { passive: true } as any)
            );
        };
        if (typeof window !== "undefined") {
            if ("requestIdleCallback" in window) {
                (window as any).requestIdleCallback(arm, { timeout });
            } else {
                const t = setTimeout(arm, timeout);
                return () => clearTimeout(t);
            }
            ["scroll", "mousemove", "touchstart", "keydown", "click"].forEach((e) =>
                window.addEventListener(e, arm, { passive: true, once: true } as any)
            );
        }
        return cleanup;
    }, [timeout]);
    return ready;
}

export default function RootLayout() {
    const [appReady, setAppReady] = useState(isWeb); // на web стартуем сразу
    const [loaded, error] = useFonts(fontMap);

    // ошибки шрифтов пробрасываем (только native)
    useEffect(() => {
        if (!isWeb && error) throw error;
    }, [error]);

    useEffect(() => {
        if (isWeb) return; // web не ждём
        if (loaded) {
            setAppReady(true);
            SplashScreen.hideAsync().catch(() => {});
        }
    }, [loaded]);

    if (!appReady) return null;
    return <RootLayoutNav />;
}

function RootLayoutNav() {
    const pathname = usePathname();
    const SITE = process.env.EXPO_PUBLIC_SITE_URL || "https://metravel.by";
    const canonical = `${SITE}${pathname || "/"}`;

    // страницы без футера
    const showFooter = useMemo(
        () => !["/login", "/onboarding"].includes(pathname || ""),
        [pathname]
    );

    // Монтируем тяжёлые «украшения» (Footer/Devtools) на idle, чтобы не трогать TBT
    const idleReady = useIdleFlag(2500);

    const defaultTitle = "MeTravel — путешествия и маршруты";
    const defaultDescription = "Маршруты, места и впечатления от путешественников.";

    return (
        <PaperProvider theme={theme}>
            <AuthProvider>
                <QueryClientProvider client={queryClient}>
                    {/* Devtools: динамический импорт, только dev, только native, и после idle */}
                    {__DEV__ && !isWeb && idleReady && <DevtoolsLazy />}

                    <FiltersProvider>
                        <View style={styles.wrapper}>
                            {/* Базовые head-теги. Страницы переопределяют через InstantSEO. */}
                            <Head>
                                <link rel="icon" href="/favicon.ico" />
                                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

                                <title key="fallback-title">{defaultTitle}</title>
                                <meta key="fallback-description" name="description" content={defaultDescription} />
                                <link key="fallback-canonical" rel="canonical" href={canonical} />
                            </Head>

                            <View style={styles.content}>
                                <Stack screenOptions={{ headerShown: false }}>
                                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                                </Stack>
                            </View>

                            {showFooter && idleReady && (
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

/** Ленивый Devtools: не попадают в главный бандл */
function DevtoolsLazy() {
    const [Comp, setComp] = useState<React.ComponentType<any> | null>(null);
    useEffect(() => {
        let mounted = true;
        import("@tanstack/react-query-devtools")
            .then((m) => {
                if (mounted) setComp(() => (m as any).ReactQueryDevtools);
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, []);
    if (!Comp) return null;
    return <Comp initialIsOpen={false} />;
}

const styles = StyleSheet.create({
    wrapper: { flex: 1, justifyContent: "space-between" },
    content: { flex: 1 },
    loading: { padding: 8 },
});
