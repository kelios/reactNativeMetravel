import { Link, Stack } from 'expo-router';
import { Image, Text, View, StyleSheet } from 'react-native';

function LogoTitle() {
    return (
        <Image
            style={styles.logo}
            source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
        />
    );
}

export default function Home() {
    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Главная страница',
                    headerStyle: { backgroundColor: '#4b7c6f' },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        fontSize: 18,
                    },
                    headerTitle: (props) => <LogoTitle {...props} />,
                }}
            />
            <Text style={styles.welcomeText}>Добро пожаловать на главную страницу!</Text>
            <Text>
                <Link href="/details" style={styles.link}>
                    Перейти к деталям
                </Link>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    welcomeText: {
        fontSize: 20,
        marginTop: 20,
        color: '#333',
        textAlign: 'center',
    },
    link: {
        marginTop: 20,
        color: '#4b7c6f',
        textDecorationLine: 'underline',
        fontSize: 16,
    },
});
