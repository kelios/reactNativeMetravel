import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Image,
    TextInput,
    TouchableOpacity,
    Text,
} from 'react-native';
import { Card } from 'react-native-paper';
import { Button } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigation = useNavigation();
    const { login, sendPassword } = useAuth();

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return emailRegex.test(email);
    };

    const handleResetPassword = async () => {
        if (isValidEmail(email)) {
            const result = await sendPassword(email);
                setError(result);
        } else {
            setError('Введите корректный email адрес.');
        }
    };

    const handleLogin = async () => {
        setError(''); // сбросить ошибку перед попыткой входа
        const success = await login(email, password, navigation);
        if (!success) {
            setError('Неверный email или пароль.');
        }
    };

    const ForgotPasswordLink = ({ onPress }) => {
        return (
            <TouchableOpacity onPress={onPress}>
                <Text style={{ color: '#0066ff', textDecorationLine: 'underline' }}>Забыли пароль?</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: '/assets/images/media/slider/about.jpg' }}
                style={styles.topImage}
            />
            <Card style={styles.card}>
                <Card.Content>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        placeholder="Пароль"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                    />
                    <Button
                        title="Войти"
                        buttonStyle={styles.applyButton}
                        onPress={handleLogin}
                    />
                    <ForgotPasswordLink onPress={handleResetPassword} />
                </Card.Content>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '80%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        marginTop: -400,
        borderRadius: 8,
        padding: 10,
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    topImage: {
        width: '100%',
        height: 500,
    },
    input: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        width: '100%',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'white',
    },
    applyButton: {
        backgroundColor: '#6aaaaa',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
});
