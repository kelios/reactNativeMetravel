import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    ImageBackground,
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

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

    const handleResetPassword = async () => {
        if (isValidEmail(email)) {
            try {
                const result = await sendPassword(email);
                setError(result);
            } catch (err: any) {
                setError(err.message || 'Ошибка при сбросе пароля.');
            }
        } else {
            setError('Введите корректный email.');
        }
    };

    const handleLogin = async () => {
        setError('');
        try {
            const success = await login(email, password, navigation);
            if (success) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'index' }],  // <- Заменить на ваш реальный экран
                });
            } else {
                setError('Неверный email или пароль.');
            }
        } catch (err: any) {
            setError(err.message || 'Ошибка при входе.');
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <ImageBackground source={require('@/assets/images/media/slider/about.jpg')} style={styles.backgroundImage} blurRadius={3}>
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
                                <Button title="Войти" buttonStyle={styles.applyButton} onPress={handleLogin} />
                                <TouchableOpacity onPress={handleResetPassword}>
                                    <Text style={styles.forgotPasswordText}>Забыли пароль?</Text>
                                </TouchableOpacity>
                            </Card.Content>
                        </Card>
                    </View>
                </ImageBackground>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollViewContent: { flexGrow: 1 },
    backgroundImage: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', height },
    formContainer: { width: '80%', maxWidth: 400 },
    card: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 12, padding: 20, elevation: 5 },
    input: { marginBottom: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
    applyButton: { backgroundColor: '#6aaaaa', paddingVertical: 12, borderRadius: 8 },
    forgotPasswordText: { color: '#0066ff', textDecorationLine: 'underline', marginTop: 15, textAlign: 'center', fontSize: 16 },
    errorText: { color: 'red', marginBottom: 15, textAlign: 'center', fontSize: 16 },
});
