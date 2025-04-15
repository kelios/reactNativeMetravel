// TabLayout.tsx — кастомный header с полным отключением встроенного
import React from 'react';
import { Tabs } from 'expo-router';
import CustomHeader from '@/components/CustomHeader';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: { display: 'none' },
                header: () => <CustomHeader />, // наш кастомный хедер
            }}
        >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="travelsby" options={hiddenTabOptions()} />
            <Tabs.Screen name="map" options={hiddenTabOptions()} />
            <Tabs.Screen name="about" options={hiddenTabOptions(true)} />
            <Tabs.Screen name="articles" options={hiddenTabOptions(true)} />
            <Tabs.Screen name="contact" options={hiddenTabOptions(true)} />
            <Tabs.Screen name="article/[id]" options={hiddenTabOptions(true)} />
            <Tabs.Screen name="login" options={hiddenTabOptions(true)} />
            <Tabs.Screen name="registration" options={hiddenTabOptions(true)} />
            <Tabs.Screen name="set-password" options={hiddenTabOptions(true)} />
            <Tabs.Screen name="travel/new" options={hiddenTabOptions(true)} />
            <Tabs.Screen name="travel/[id]" options={hiddenTabOptions(true)} />
            <Tabs.Screen name="travels/[param]" options={hiddenTabOptions()} />
            <Tabs.Screen name="metravel" options={hiddenTabOptions(true)} />
            <Tabs.Screen name="chat" options={hiddenTabOptions(true)} />
            <Tabs.Screen name="accountconfirmation" options={hiddenTabOptions(true)} />
        </Tabs>
    );
}

function hiddenTabOptions(hideFromHref: boolean = false) {
    return {
        title: '',
        href: hideFromHref ? null : undefined,
    };
}