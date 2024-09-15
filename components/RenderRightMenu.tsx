import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
    const { updateFilters } = useFilters();
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
        <View style={styles.container}>
            {username && <Text style={styles.username}>{username}</Text>}
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                    <Button onPress={openMenu} style={styles.menuButton}>
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
                            icon="login"
                        />
                        <Menu.Item
                            onPress={() => {
                                navigation.navigate('registration');
                                closeMenu();
                            }}
                            title="Зарегистрироваться"
                            icon="account-plus"
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
                            icon="earth"
                        />
                        <Menu.Item
                            onPress={() => {
                                navigation.navigate('travel/new');
                                closeMenu();
                            }}
                            title="Добавить путешествие"
                            icon="map-plus"
                        />
                        <Menu.Item
                            onPress={async () => {
                                await logout();
                                closeMenu();
                                navigation.navigate('index');
                            }}
                            title="Выход"
                            icon="logout"
                        />
                    </>
                )}
            </Menu>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 10,
        alignItems: 'center',
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
    menuButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        padding: 5,
    },
});

export default RenderRightMenu;
