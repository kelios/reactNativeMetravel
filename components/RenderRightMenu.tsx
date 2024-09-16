import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Menu, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useFilters } from '@/providers/FiltersProvider';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

function RenderRightMenu() {
    const navigation = useNavigation();
    const [visible, setVisible] = useState(false);
    const [username, setUsername] = useState('');
    const { isAuthenticated, setIsAuthenticated, logout } = useAuth();
    const { updateFilters } = useFilters();

    useEffect(() => {
        const checkAuthentication = async () => {
            const token = await AsyncStorage.getItem('userToken');
            setIsAuthenticated(!!token);
        };
        const getUsername = async () => {
            const storedUsername = await AsyncStorage.getItem('userName');
            if (storedUsername) {
                setUsername(storedUsername);
            }
        };
        checkAuthentication();
        getUsername();
    }, []);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    return (
        <View style={styles.container}>
            {username && (
                <View style={styles.userContainer}>
                    <Icon name="account-circle" size={24} color="#fff" />
                    <Text style={styles.username}>{username}</Text>
                </View>
            )}
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                    <Button onPress={openMenu} style={styles.menuButton}>
                        <Icon name="menu" size={24} color="#000" />
                    </Button>
                }
            >
                {!isAuthenticated ? (
                    <>
                        <Menu.Item
                            onPress={() => {
                                navigation.navigate('login');
                                closeMenu();
                            }}
                            title="Войти"
                            icon={() => <Icon name="login" size={20} color="#000" />}
                        />
                        <Menu.Item
                            onPress={() => {
                                navigation.navigate('registration');
                                closeMenu();
                            }}
                            title="Зарегистрироваться"
                            icon={() => <Icon name="account-plus" size={20} color="#000" />}
                        />
                    </>
                ) : (
                    <>
                        <Menu.Item
                            onPress={() => {
                                updateFilters({ user_id: 1 });
                                navigation.navigate('metravel');
                                closeMenu();
                            }}
                            title="Мои путешествия"
                            icon={() => <Icon name="earth" size={20} color="#000" />}
                        />
                        <Divider />
                        <Menu.Item
                            onPress={() => {
                                navigation.navigate('travel/new');
                                closeMenu();
                            }}
                            title="Добавить путешествие"
                            icon={() => <Icon name="map-plus" size={20} color="#000" />}
                        />
                        <Divider />
                        <Menu.Item
                            onPress={async () => {
                                await logout();
                                closeMenu();
                                navigation.navigate('index');
                            }}
                            title="Выход"
                            icon={() => <Icon name="logout" size={20} color="#000" />}
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
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6aaaaa', // Цвет фона, можно заменить на цвет сайта
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 20,
        marginRight: 10,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 5,
    },
    menuButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        padding: 5,
    },
});

export default RenderRightMenu;
