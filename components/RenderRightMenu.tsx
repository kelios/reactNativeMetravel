import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform,
} from 'react-native';
import { Menu, Divider } from 'react-native-paper';
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
            <View style={styles.leftContainer}>
                {/* Кнопка на главную страницу */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('index')}
                    style={styles.homeButton}
                >
                    <Image
                        source={require('../assets/icons/logo_yellow.png')}
                        style={styles.logo}
                    />
                    <Text style={styles.homeButtonText}>MeTravel</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.rightContainer}>
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
                        <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
                            <Icon name="menu" size={24} color="#333" />
                        </TouchableOpacity>
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
                                icon={() => <Icon name="login" size={20} color="#333" />}
                            />
                            <Menu.Item
                                onPress={() => {
                                    navigation.navigate('registration');
                                    closeMenu();
                                }}
                                title="Зарегистрироваться"
                                icon={() => <Icon name="account-plus" size={20} color="#333" />}
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
                                icon={() => <Icon name="earth" size={20} color="#333" />}
                            />
                            <Divider />
                            <Menu.Item
                                onPress={() => {
                                    navigation.navigate('travel/new');
                                    closeMenu();
                                }}
                                title="Добавить путешествие"
                                icon={() => <Icon name="map-plus" size={20} color="#333" />}
                            />
                            <Divider />
                            <Menu.Item
                                onPress={async () => {
                                    await logout();
                                    closeMenu();
                                    navigation.navigate('index');
                                }}
                                title="Выход"
                                icon={() => <Icon name="logout" size={20} color="#333" />}
                            />
                        </>
                    )}
                </Menu>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        width: '100%',
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    homeButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    homeButtonText: {
        fontSize: 20,
        fontWeight: '400',
        color: '#6aaaaa', // Применен ваш цвет
        fontFamily: Platform.select({
            ios: 'HelveticaNeue-Light',
            android: 'sans-serif-light',
            default: 'System',
        }),
        marginLeft: 8,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6aaaaa', // Применен ваш цвет
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
    },
    username: {
        fontSize: 16,
        fontWeight: '400',
        color: '#ffffff',
        marginLeft: 5,
    },
    menuButton: {
        backgroundColor: '#f5f5f5',
        borderRadius: 30,
        padding: 8,
    },
    logo: {
        width: 30,
        height: 30,
        resizeMode: 'contain', // Убедитесь, что иконка не обрезается
    },
});

export default RenderRightMenu;
