import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, useColorScheme, Image } from 'react-native';

import Colors from '@/constants/Colors';


/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'MetravelBy',
          //tabBarIcon: ({ color }) => <TabBarIcon image="/assets/icons/logo_yellow" color={color} />,
          tabBarIcon: ({size,focused,color}) => {
            return (
              <Image
                style={{ width: 10, height: 10 }}
                source={{
                  uri:'/assets/icons/logo_yellow.ico',
                }}
              />
            );
          },
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="travelsby"
        options={{
          title: 'Путешествуем по Беларуси',
          
        }}
      />
       <Tabs.Screen
        name="[travels]"
        options={{
          href: '/travels/',
          title: 'Аккаунты в instagram о путешествиях по Беларуси',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
    </Tabs>
  );
}
