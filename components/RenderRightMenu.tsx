import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    useWindowDimensions,
    Platform,
} from 'react-native';
import { Menu, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useFilters } from '@/providers/FiltersProvider';
import { useAuth } from '@/context/AuthContext';

function RenderRightMenu() {
    const navigation = useNavigation();
    const { isAuthenticated, username, logout, user } = useAuth();
    const { updateFilters } = useFilters();

    const [visible, setVisible] = useState(false);

    const width = useWindowDimensions().width;
    const isMobile = width <= 768;

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const handleNavigate = (screen: string, extraAction?: () => void) => {
        requestAnimationFrame(() => {
            if (extraAction) extraAction();
            navigation.navigate(screen);
            closeMenu();
        });
    };

    const handleLogout = async () => {
        await logout();
        closeMenu();
        navigation.navigate('index');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => {
                    if (visible) closeMenu();
                    navigation.navigate('index');
                }}
                style={styles.homeButton}
            >
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
                                onPress={() => handleNavigate('login')}
                                title="Войти"
                                leadingIcon="login"
                            />
                            <Menu.Item
                                onPress={() => handleNavigate('registration')}
                                title="Зарегистрироваться"
                                leadingIcon="account-plus"
                            />
                        </>
                    ) : (
                        <>
                            <Menu.Item
                                onPress={() =>
                                    handleNavigate('metravel', () =>
                                        updateFilters({ user_id: user?.id })
                                    )
                                }
                                title="Мои путешествия"
                                leadingIcon="earth"
                            />
                            <Divider />
                            <Menu.Item
                                onPress={() => handleNavigate('travel/new')}
                                title="Добавить путешествие"
                                leadingIcon="map-plus"
                            />
                            <Divider />
                            <Menu.Item
                                onPress={handleLogout}
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
        borderRadius: 24,
        padding: 8,
    },
    logo: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
});

export default RenderRightMenu;
