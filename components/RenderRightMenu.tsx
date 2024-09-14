import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Button, Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useFilters } from '@/providers/FiltersProvider';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

function RenderRightMenu() {
    const navigation = useNavigation();
    const [visible, setVisible] = useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);
    const { updateFilters, filters } = useFilters();
    const [username, setUsername] = useState('');
    const { isAuthenticated, setIsAuthenticated, logout } = useAuth();

    const checkAuthentication = async () => {
        const token = await AsyncStorage.getItem('userToken');
        setIsAuthenticated(!!token);
    };

    useEffect(() => {
        checkAuthentication();
    }, []);

    useEffect(() => {
        const getUsername = async () => {
            const storedUsername = await AsyncStorage.getItem('userName');
            if (storedUsername) {
                setUsername(storedUsername);
            }
        };
        getUsername();
    }, []);

    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingRight: 10,
            }}
        >
            {username && <Text>{username}</Text>}
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                    <Button onPress={openMenu}>
                        <Icon name="menu" size={24} color="#000" />
                    </Button>
                }
            >
                {!isAuthenticated && (
                    <>
                        <Menu.Item
                            onPress={() => {
                                navigation.navigate('login');
                                closeMenu();
                            }}
                            title="Войти"
                        />
                        <Menu.Item
                            onPress={() => {
                                navigation.navigate('registration');
                                closeMenu();
                            }}
                            title="Зарегистрироваться"
                        />
                    </>
                )}
                {isAuthenticated && (
                    <>
                        <Menu.Item
                            onPress={() => {
                                updateFilters({ user_id: 1 });
                                navigation.navigate('metravel');
                                closeMenu();
                            }}
                            title="Мои путешествия"
                        />
                        <Menu.Item
                            onPress={() => {
                                navigation.navigate('travel/new');
                                closeMenu();
                            }}
                            title="Добавить путешествие"
                        />
                        <Menu.Item
                            onPress={async () => {
                                await logout();
                                closeMenu();
                                navigation.navigate('index');
                            }}
                            title="Выход"
                        />
                    </>
                )}
            </Menu>
        </View>
    );
}

export default RenderRightMenu;