import React, {useRef, useState} from 'react';
import {
    Dimensions,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {Card} from 'react-native-paper';
import {Button} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '@/context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const passwordRef = useRef<TextInput>(null);
    const navigation = useNavigation();
    const { login, sendPassword } = useAuth();

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

    const handleResetPassword = async () => {
        if (isValidEmail(email)) {
            try {
                const result = await sendPassword(email);
                setMessage(result);
                setIsError(result.toLowerCase().includes('ошиб') || result.toLowerCase().includes('не удалось'));
            } catch (err: any) {
                setMessage(err.message || 'Ошибка при сбросе пароля.');
                setIsError(true);
            }
        } else {
            setMessage('Введите корректный email.');
            setIsError(true);
        }
    };

    const handleLogin = async () => {
        setMessage('');
        try {
            const success = await login(email, password);
            if (success) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'index' }],
                });
            } else {
                setMessage('Неверный email или пароль.');
                setIsError(true);
            }
        } catch (err: any) {
            setMessage(err.message || 'Ошибка при входе.');
            setIsError(true);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
                <ImageBackground
                    source={require('@/assets/images/media/slider/about.jpg')}
                    style={styles.backgroundImage}
                    blurRadius={3}
                >
                    <View style={styles.formContainer}>
                        <Card style={styles.card}>
                            <Card.Content>
                                {message ? (
                                    <Text
                                        style={[
                                            styles.messageText,
                                            isError ? styles.errorText : styles.successText,
                                        ]}
                                    >
                                        {message}
                                    </Text>
                                ) : null}

                                <TextInput
                                    placeholder="Email"
                                    value={email}
                                    onChangeText={setEmail}
                                    style={styles.input}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor="#888"
                                    returnKeyType="next"
                                    blurOnSubmit={false}
                                    onSubmitEditing={() => passwordRef.current?.focus()}
                                />

                                <TextInput
                                    ref={passwordRef}
                                    placeholder="Пароль"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    style={styles.input}
                                    placeholderTextColor="#888"
                                    returnKeyType="done"
                                    onSubmitEditing={handleLogin}
                                />

                                <Button
                                    title="Войти"
                                    buttonStyle={styles.applyButton}
                                    onPress={handleLogin}
                                />

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
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height,
    },
    formContainer: { width: '80%', maxWidth: 400 },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },
    input: {
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    applyButton: {
        backgroundColor: '#6aaaaa',
        paddingVertical: 12,
        borderRadius: 8,
    },
    forgotPasswordText: {
        color: '#0066ff',
        textDecorationLine: 'underline',
        marginTop: 15,
        textAlign: 'center',
        fontSize: 16,
    },
    messageText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 16,
    },
    errorText: {
        color: 'red',
    },
    successText: {
        color: '#2e7d32', // глубокий зелёный
    },
});
