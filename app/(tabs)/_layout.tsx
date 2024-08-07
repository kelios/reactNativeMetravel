import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome'
import {Tabs} from 'expo-router'
import {Image, useColorScheme, useWindowDimensions} from 'react-native'
import Footer from '@/components/Footer'
import RenderRightMenu from '@/components/RenderRightMenu';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name']
    color: string
}) {
    return <FontAwesome size={28} style={{marginBottom: -3}} {...props} />
}
export default function TabLayout() {
    const colorScheme = useColorScheme()
    const width = useWindowDimensions().width
    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarStyle: {
                        width: '100%',
                        padding: width > 500 ? 10 : 0,
                        position: 'absolute',
                        bottom: width > 500 ? 30 : 20,
                        height: width > 500 ? 50 : 80,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Все путешествия',
                        //tabBarIcon: ({ color }) => <TabBarIcon image="/assets/icons/logo_yellow" color={color} />,
                        tabBarIcon: ({size, focused, color}) => {
                            return (
                                <Image
                                    style={{width: 10, height: 10}}
                                    source={{
                                        uri: '/assets/icons/logo_yellow.ico',
                                    }}
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
                        title: 'Путешествуем по Беларуси',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />
                <Tabs.Screen
                    name="map"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        title: 'Карта путешествий',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />
                <Tabs.Screen
                    name="travels/439"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        title: 'Аккаунты в instagram о путешествиях по Беларуси',
                        headerRight: () => <RenderRightMenu />,
                        href: {
                            pathname: '/travels/439',
                        },
                    }}
                />

                <Tabs.Screen
                    name="travels/[id]"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        title: 'Аккаунты в instagram о путешествиях по Беларуси',
                        headerRight: () => <RenderRightMenu />,
                        href: {
                            pathname: '/travels/439',
                        },
                    }}
                />

                <Tabs.Screen
                    name="about"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: 'О сайте',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="articles"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: 'Новости/Розогрыши',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="contact"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: 'Обратная связь',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />
                <Tabs.Screen
                    name="article/[id]"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: 'Новость',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="login"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: 'Войти',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="registration"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: 'Зарегистрироваться',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="newtravel"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: 'Новое путешествие',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

                <Tabs.Screen
                    name="forgotpassword"
                    options={{
                        tabBarIconStyle: {display: 'none'},
                        href: null,
                        title: 'Изменить пароль',
                        headerRight: () => <RenderRightMenu />,
                    }}
                />

            </Tabs>

            <Footer/>
        </>
    )
}
