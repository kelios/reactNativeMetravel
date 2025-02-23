import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import { Image, useColorScheme, useWindowDimensions, View, StyleSheet } from 'react-native';
import Footer from '@/components/Footer';
import RenderRightMenu from '@/components/RenderRightMenu';
import NewTravelScreen from "@/app/(tabs)/travel/new";
import Breadcrumbs from "@/components/Breadcrumbs";

function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
}) {
    return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const width = useWindowDimensions().width;

    return (
        <View style={styles.container}>
            <Tabs
                screenOptions={{
                    tabBarStyle: {
                        width: '100%',
                        padding: 0,
                        position: 'absolute',
                        bottom: 0,
                        height: 0,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: '',
                        tabBarIcon: ({size, focused, color}) => {
                            return (
                                <Image
                                    style={{width: 10, height: 10}}
                                    source={require('@/assets/icons/logo_yellow.ico')}
                                />
                            )
                        },
                        headerRight: () => <RenderRightMenu />,
                    }}
                />
                <Tabs.Screen
                    name="travelsby"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        title: '',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />
                <Tabs.Screen
                    name="map"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        title: '',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="about"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: '',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="articles"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: '',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="contact"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: '',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />
                <Tabs.Screen
                    name="article/[id]"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: '',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="login"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: '',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="registration"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: '',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="set-password"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: '',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="travel/new"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: '',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="travel/[id]"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: '',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="travels/[param]"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        title: '',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="metravel"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: '',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="accountconfirmation"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: '',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

            </Tabs>
            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});