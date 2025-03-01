import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Platform,
    useWindowDimensions
} from 'react-native';
import { Menu, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useFilters } from '@/providers/FiltersProvider';
import { useAuth } from '@/context/AuthContext';

function RenderRightMenu() {
    const navigation = useNavigation();
    const { isAuthenticated, username, logout } = useAuth();
    const { updateFilters } = useFilters();

    const [visible, setVisible] = useState(false);

    const width = useWindowDimensions().width;
    const isMobile = width <= 768;

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('index')} style={styles.homeButton}>
                <Image source={require('../assets/icons/logo_yellow.png')} style={styles.logo} />
                <Text style={styles.homeButtonText}>MeTravel</Text>
            </TouchableOpacity>

            <View style={styles.rightContainer}>
                {username && !isMobile && (
                    <View style={styles.userContainer}>
                        <Icon name="account-circle" size={24} color="#333" />
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
                                leadingIcon="login"
                            />
                            <Menu.Item
                                onPress={() => {
                                    navigation.navigate('registration');
                                    closeMenu();
                                }}
                                title="Зарегистрироваться"
                                leadingIcon="account-plus"
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
                                leadingIcon="earth"
                            />
                            <Divider />
                            <Menu.Item
                                onPress={() => {
                                    navigation.navigate('travel/new');
                                    closeMenu();
                                }}
                                title="Добавить путешествие"
                                leadingIcon="map-plus"
                            />
                            <Divider />
                            <Menu.Item
                                onPress={async () => {
                                    await logout();
                                    closeMenu();
                                    navigation.navigate('index');
                                }}
                                title="Выход"
                                leadingIcon="logout"
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
    homeButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    homeButtonText: {
        fontSize: 20,
        fontWeight: '400',
        color: '#6aaaaa',
        marginLeft: 8,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
    },
    username: {
        fontSize: 16,
        color: '#333',
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
        resizeMode: 'contain',
    },
});

export default RenderRightMenu;
