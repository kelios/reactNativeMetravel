import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    useWindowDimensions,
    Platform,
    useColorScheme,
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

    const { width } = useWindowDimensions();
    const isMobile = width <= 768;
    const colorScheme = useColorScheme();

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
                style={styles.logoContainer}
            >
                <Image
                    source={require('../assets/icons/logo_yellow_60x60.png')}
                    style={[styles.logo, isMobile && styles.logoMobile]}
                    resizeMode="contain"
                />
                {!isMobile && (
                    <View style={styles.logoTextRow}>
                        <Text style={styles.logoTextMe}>Me</Text>
                        <Text style={styles.logoTextTravel}>Travel</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View style={styles.rightContainer}>
                {username && !isMobile && (
                    <View style={styles.userContainer}>
                        <Icon name="account-circle" size={24} color="#333" />
                        <Text style={styles.username} numberOfLines={1}>{username}</Text>
                    </View>
                )}

                <Menu
                    visible={visible}
                    onDismiss={closeMenu}
                    contentStyle={styles.menuContent}
                    anchor={
                        <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
                            <Icon name="menu" size={24} color="#333" />
                        </TouchableOpacity>
                    }
                >
                    {!isAuthenticated ? (
                        <>
                            <Menu.Item onPress={() => handleNavigate('login')} title="Войти" leadingIcon="login" />
                            <Menu.Item onPress={() => handleNavigate('registration')} title="Зарегистрироваться" leadingIcon="account-plus" />
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
                                leadingIcon={({ size }) => <Icon name="earth" size={size} color="#6aaaaa" />}
                            />
                            <Divider />
                            <Menu.Item
                                onPress={() => handleNavigate('travel/new')}
                                title="Добавить путешествие"
                                leadingIcon={({ size }) => <Icon name="map-plus" size={size} color="#6aaaaa" />}
                            />
                            <Divider />
                            <Menu.Item
                                onPress={handleLogout}
                                title="Выход"
                                leadingIcon={({ size }) => <Icon name="logout" size={size} color="#6aaaaa" />}
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
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 32,
        height: 32,
    },
    logoMobile: {
        width: 26,
        height: 26,
    },
    logoText: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 8,
        flexDirection: 'row',
    },
    logoTextMe: {
        color: '#f28c28',
    },
    logoTextTravel: {
        color: '#6aaaaa',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
        maxWidth: 180,
        marginRight: 8,
    },
    username: {
        fontSize: 16,
        color: '#333',
        marginLeft: 6,
    },
    logoTextRow: {
        flexDirection: 'row',
        marginLeft: 8,
    },
    menuButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 24,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContent: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingVertical: 4,
        elevation: 5,
        minWidth: 200,
        borderColor: '#e0e0e0',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
});

export default RenderRightMenu;
