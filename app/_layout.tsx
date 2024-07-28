import React from 'react'
import '@expo/metro-runtime'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import {useFonts} from 'expo-font'
import {SplashScreen, Stack} from 'expo-router'
import {useEffect} from 'react'
import CookiePopup from '@/components/CookiePopup'
import {
    MD3LightTheme as DefaultTheme,
    PaperProvider,
} from 'react-native-paper'
import {PlayfairDisplay_400Regular} from '@expo-google-fonts/playfair-display'
import {FiltersProvider} from "@/providers/FiltersProvider";
import {AuthProvider} from "@/context/AuthContext";

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router'

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: 'tomato',
        secondary: 'yellow',
    },
}

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
    const [loaded, error] = useFonts({
        PlayfairDisplay_400Regular,
        ...FontAwesome.font,
    })

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error
    }, [error])

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync()
        }
    }, [loaded])

    if (!loaded) {
        return null
    }

    return <RootLayoutNav/>
}

function RootLayoutNav() {
    //  const colorScheme = useColorScheme()

    return (
        <PaperProvider theme={theme}>
            <AuthProvider>
                <FiltersProvider>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                    </Stack>
                    <CookiePopup/>
                </FiltersProvider>
            </AuthProvider>
        </PaperProvider>
    )
}
