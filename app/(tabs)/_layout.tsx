import React from 'react';
import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import RenderRightMenu from '@/components/RenderRightMenu';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    width: '100%',
                    padding: 0,
                    position: 'absolute',
                    bottom: 0,
                    height: 0, // скрыт, если не нужен
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: '',
                    tabBarIcon: ({ color }) => (
                        <Image
                            style={{ width: 10, height: 10 }}
                            source={require('@/assets/icons/logo_yellow.ico')}
                        />
                    ),
                    headerRight: () => <RenderRightMenu />,
                }}
            />

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
        tabBarIconStyle: { display: 'none' },
        title: '',
        href: hideFromHref ? null : undefined,
        headerRight: () => <RenderRightMenu />,
    };
}
