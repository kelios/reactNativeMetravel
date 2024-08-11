import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Image,
    TextInput,
    TouchableOpacity,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
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
            try {
                const result = await sendPassword(email);
                setError(result);
            } catch (err: any) {
                setError(err.message || 'Ошибка при сбросе пароля.');
            }
        } else {
            setError('Введите корректный email адрес.');
        }
    };

    const handleLogin = async () => {
        setError(''); // сбросить ошибку перед попыткой входа
        try {
            const success = await login(email, password, navigation);
            if (!success) {
                setError('Неверный email или пароль.');
            }
        } catch (err: any) {
            setError(err.message || 'Ошибка при входе в систему.');
        }
    };

    const ForgotPasswordLink = ({ onPress }) => {
        return (
            <TouchableOpacity onPress={onPress}>
                <Text style={styles.forgotPasswordText}>Забыли пароль?</Text>
            </TouchableOpacity>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: '/assets/images/media/slider/about.jpg' }}
                        style={styles.backgroundImage}
                    />
                    <View style={styles.formContainer}>
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
                                    placeholderTextColor="#888"
                                />
                                <TextInput
                                    placeholder="Пароль"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    style={styles.input}
                                    placeholderTextColor="#888"
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
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    imageContainer: {
        width: '100%',
        height: height * 0.5, // Контейнер для изображения и формы занимает половину экрана
        alignItems: 'center',
        justifyContent: 'center', // Центрирование формы по вертикали
        position: 'relative',
    },
    backgroundImage: {
        width: '100%',
        height: '100%', // Изображение занимает весь контейнер
        position: 'absolute', // Абсолютное позиционирование для наложения формы
        top: 0,
        left: 0,
    },
    formContainer: {
        width: '50%', // Форму делаем немного уже, чтобы была по центру
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Полупрозрачный фон формы
        borderRadius: 8,
        padding: 20,
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3, // Для теней на Android
    },
    input: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        width: '100%',
        fontSize: 16,
        backgroundColor: '#fff',
    },
    applyButton: {
        backgroundColor: '#6aaaaa',
        width: '100%',
    },
    forgotPasswordText: {
        color: '#0066ff',
        textDecorationLine: 'underline',
        marginTop: 10,
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
});
