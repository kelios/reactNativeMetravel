// TabLayout.tsx — кастомный header + полный офф таббара
import React, {useMemo} from 'react';
import { Tabs } from 'expo-router';
import CustomHeader from '@/components/CustomHeader';

const Header = React.memo(function Header() {
    return <CustomHeader />;
});

// Поведение href:
// - null      -> экран исключён из линкинга (скрыт полностью)
// - undefined -> экран адресуем, но скрыт из таббара
const HIDDEN = { title: '', href: undefined, lazy: true } as const;
const HIDDEN_NOHREF = { title: '', href: null, lazy: true } as const;

export default function TabLayout() {
    const tabBarHiddenStyle = useMemo(() => ({ display: 'none' }), []);
    return (
        <Tabs
            initialRouteName="index"
            screenOptions={{
                tabBar: () => null,       // убираем таббар полностью
                tabBarStyle: tabBarHiddenStyle,
                header: () => <Header />, // кастомный заголовок
                lazy: true,               // экраны создаются по первому фокусу
                freezeOnBlur: true,       // заморозка внефокусных экранов
            }}
        >
            <Tabs.Screen name="index" />

            {/* адресуемые, но скрытые в таббаре */}
            <Tabs.Screen name="travelsby" options={HIDDEN} />
            <Tabs.Screen name="map" options={HIDDEN} />
            <Tabs.Screen name="travels/[param]" options={HIDDEN} />

            {/* полностью скрытые из линкинга */}
            <Tabs.Screen name="about" options={HIDDEN_NOHREF} />
            <Tabs.Screen name="articles" options={HIDDEN_NOHREF} />
            <Tabs.Screen name="contact" options={HIDDEN_NOHREF} />
            <Tabs.Screen name="article/[id]" options={HIDDEN_NOHREF} />
            <Tabs.Screen name="login" options={HIDDEN_NOHREF} />
            <Tabs.Screen name="registration" options={HIDDEN_NOHREF} />
            <Tabs.Screen name="set-password" options={HIDDEN_NOHREF} />
            <Tabs.Screen name="travel/new" options={HIDDEN_NOHREF} />
            <Tabs.Screen name="travel/[id]" options={HIDDEN_NOHREF} />
            <Tabs.Screen name="metravel" options={HIDDEN_NOHREF} />
            <Tabs.Screen name="chat" options={HIDDEN_NOHREF} />
            <Tabs.Screen name="accountconfirmation" options={HIDDEN_NOHREF} />
        </Tabs>
    );
}
