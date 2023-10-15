import React from 'react'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Tabs } from 'expo-router'
import {
  useColorScheme,
  Image,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import Footer from '@/components/Footer'

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name']
  color: string
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />
}

function renderRightMenu() {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 10,
      }}
    >
      <Text>Войти</Text>
    </View>
  )
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
            tabBarIcon: ({ size, focused, color }) => {
              return (
                <Image
                  style={{ width: 10, height: 10 }}
                  source={{
                    uri: '/assets/icons/logo_yellow.ico',
                  }}
                />
              )
            },
            headerRight: () => renderRightMenu(),
          }}
        />
        <Tabs.Screen
          name="travelsby"
          options={{
            title: 'Путешествуем по Беларуси',
            headerRight: () => renderRightMenu(),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Карта путешествий',
            headerRight: () => renderRightMenu(),
          }}
        />
        <Tabs.Screen
          name="travels/[id]"
          options={{
            title: 'Аккаунты в instagram о путешествиях по Беларуси',
            headerRight: () => renderRightMenu(),
            href: {
              pathname: '/travels/439',
            },
          }}
        />
      </Tabs>

    
      <Footer />
    </>
  )
}
