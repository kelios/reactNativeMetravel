// TabLayout.tsx — кастомный header с полным отключением встроенного
import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import CustomHeader from '@/components/CustomHeader';

export default function TabLayout() {
    const tabBarHiddenStyle = useMemo(() => ({ display: 'none' }), []);
    const headerComponent = useMemo(() => () => <CustomHeader />, []);

    const hiddenOptions = useMemo(() => ({ title: '', href: undefined }), []);
    const hiddenHrefOptions = useMemo(() => ({ title: '', href: null }), []);

    return (
        <Tabs
            initialRouteName="index" // ✅ оптимизация для initial render
            screenOptions={{
                tabBarStyle: tabBarHiddenStyle,
                header: headerComponent,
            }}
        >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="travelsby" options={hiddenOptions} />
            <Tabs.Screen name="map" options={hiddenOptions} />
            <Tabs.Screen name="about" options={hiddenHrefOptions} />
            <Tabs.Screen name="articles" options={hiddenHrefOptions} />
            <Tabs.Screen name="contact" options={hiddenHrefOptions} />
            <Tabs.Screen name="article/[id]" options={hiddenHrefOptions} />
            <Tabs.Screen name="login" options={hiddenHrefOptions} />
            <Tabs.Screen name="registration" options={hiddenHrefOptions} />
            <Tabs.Screen name="set-password" options={hiddenHrefOptions} />
            <Tabs.Screen name="travel/new" options={hiddenHrefOptions} />
            <Tabs.Screen name="travel/[id]" options={hiddenHrefOptions} />
            <Tabs.Screen name="travels/[param]" options={hiddenOptions} />
            <Tabs.Screen name="metravel" options={hiddenHrefOptions} />
            <Tabs.Screen name="chat" options={hiddenHrefOptions} />
            <Tabs.Screen name="accountconfirmation" options={hiddenHrefOptions} />
        </Tabs>
    );
}
