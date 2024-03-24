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
import { Menu, Button } from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useNavigation } from '@react-navigation/native'
import { useFilters} from "@/providers/FiltersProvider";

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
  const navigation = useNavigation()
  const [visible, setVisible] = React.useState(false)
  const openMenu = () => setVisible(true)
  const closeMenu = () => setVisible(false)
  const { updateFilters,filters } = useFilters();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 10,
      }}
    >
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button onPress={openMenu}>
            <Icon name="menu" size={24} color="#000" />
          </Button>
        }
      >
        <Menu.Item
          onPress={() => {
            navigation.navigate('login')
            closeMenu()
          }}
          title="Войти"
        />
        <Menu.Item
          onPress={() => {
            navigation.navigate('registration')
            closeMenu()
          }}
          title="Зарегестрироваться"
        />
        <Menu.Item
          onPress={() => {
              updateFilters({ user_id: 1 });
              navigation.navigate('index')
           // navigation.navigate('mytravelslist')
            closeMenu()
          }}
          title="Мои путешествия"
        />
        <Menu.Item
          onPress={() => {
            navigation.navigate('addtravel')
            closeMenu()
          }}
          title="Добавить путешествие"
        />
        <Menu.Item
          onPress={() => {
            //unlog function
            closeMenu()
          }}
          title="Выход"
        />
      </Menu>
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
            tabBarIconStyle: { display: 'none' },
            title: 'Путешествуем по Беларуси',
            headerRight: () => renderRightMenu(),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            tabBarIconStyle: { display: 'none' },
            title: 'Карта путешествий',
            headerRight: () => renderRightMenu(),
          }}
        />
        <Tabs.Screen
          name="travels/439"
          options={{
            tabBarIconStyle: { display: 'none' },
            title: 'Аккаунты в instagram о путешествиях по Беларуси',
            headerRight: () => renderRightMenu(),
            href: {
              pathname: '/travels/439',
            },
          }}
        />

        <Tabs.Screen
          name="travels/[id]"
          options={{
            tabBarIconStyle: { display: 'none' },
            title: 'Аккаунты в instagram о путешествиях по Беларуси',
            headerRight: () => renderRightMenu(),
            href: {
              pathname: '/travels/439',
            },
          }}
        />

        <Tabs.Screen
          name="about"
          options={{
            tabBarIconStyle: { display: 'none' },
            href: null,
            title: 'О сайте',
            headerRight: () => renderRightMenu(),
          }}
        />

        <Tabs.Screen
          name="articles"
          options={{
            tabBarIconStyle: { display: 'none' },
            href: null,
            title: 'Новости/Розогрыши',
            headerRight: () => renderRightMenu(),
          }}
        />

        <Tabs.Screen
          name="contact"
          options={{
            tabBarIconStyle: { display: 'none' },
            href: null,
            title: 'Обратная связь',
            headerRight: () => renderRightMenu(),
          }}
        />
        <Tabs.Screen
          name="article/[id]"
          options={{
            tabBarIconStyle: { display: 'none' },
            href: null,
            title: 'Новость',
            headerRight: () => renderRightMenu(),
          }}
        />

        <Tabs.Screen
          name="login"
          options={{
            tabBarIconStyle: { display: 'none' },
            href: null,
            title: 'Войти',
            headerRight: () => renderRightMenu(),
          }}
        />
      </Tabs>

      <Footer />
    </>
  )
}
