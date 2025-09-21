// app/login.tsx (или соответствующий путь)
import React, { useRef, useState } from 'react';
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
import { Card } from 'react-native-paper';
import { Button } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import { usePathname } from 'expo-router';

import InstantSEO from '@/components/seo/InstantSEO';
import { useAuth } from '@/context/AuthContext';

const { height } = Dimensions.get('window');

export default function Login() {
    /* ---------- state ---------- */
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState<{ text: string; error: boolean }>({ text: '', error: false });
    const [loading, setLoading] = useState(false);
    const passwordRef = useRef<TextInput>(null);

    /* ---------- helpers ---------- */
    const navigation = useNavigation();
    const { login, sendPassword } = useAuth();

    const isFocused = useIsFocused();
    const pathname = usePathname();
    const SITE = process.env.EXPO_PUBLIC_SITE_URL || 'https://metravel.by';
    const canonical = `${SITE}${pathname || '/login'}`;

    const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());
    const showMsg = (text: string, error = false) => setMsg({ text, error });

    /* ---------- actions ---------- */
    const handleResetPassword = async () => {
        if (!isEmailValid(email)) return showMsg('Введите корректный email.', true);
        try {
            setLoading(true);
            const res = await sendPassword(email.trim());
            showMsg(res, /ошиб|не удалось/i.test(res));
        } catch (e: any) {
            showMsg(e?.message || 'Ошибка при сбросе пароля.', true);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!isEmailValid(email) || password.trim() === '') {
            return showMsg('Введите email и пароль.', true);
        }
        try {
            setLoading(true);
            showMsg('');
            const ok = await login(email.trim(), password);
            if (ok) {
                navigation.reset({ index: 0, routes: [{ name: 'index' as never }] } as any);
            } else {
                showMsg('Неверный email или пароль.', true);
            }
        } catch (e: any) {
            showMsg(e?.message || 'Ошибка при входе.', true);
        } finally {
            setLoading(false);
        }
    };

    const title = 'Вход | Metravel';
    const description =
        'Войдите в свой аккаунт на Metravel, чтобы управлять путешествиями, создавать маршруты и сохранять избранное.';

    /* ---------- render ---------- */
    return (
        <>
            {isFocused && (
                <InstantSEO
                    headKey="login"
                    title={title}
                    description={description}
                    canonical={canonical}
                    image={`${SITE}/og-preview.jpg`}
                    ogType="website"
                />
            )}

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollViewContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <ImageBackground
                        source={require('@/assets/images/media/slider/about.jpg')}
                        style={styles.bg}
                        blurRadius={3}
                    >
                        <View style={styles.inner}>
                            <Card style={styles.card}>
                                <Card.Content>
                                    {msg.text !== '' && (
                                        <Text
                                            style={[
                                                styles.message,
                                                msg.error ? styles.err : styles.ok,
                                            ]}
                                        >
                                            {msg.text}
                                        </Text>
                                    )}

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        placeholderTextColor="#888"
                                        returnKeyType="next"
                                        blurOnSubmit={false}
                                        onSubmitEditing={() => passwordRef.current?.focus()}
                                    />

                                    <TextInput
                                        ref={passwordRef}
                                        style={styles.input}
                                        placeholder="Пароль"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        placeholderTextColor="#888"
                                        returnKeyType="done"
                                        onSubmitEditing={handleLogin}
                                    />

                                    <Button
                                        title={loading ? 'Подождите…' : 'Войти'}
                                        buttonStyle={styles.btn}
                                        onPress={handleLogin}
                                        disabled={loading}
                                    />

                                    <TouchableOpacity onPress={handleResetPassword} disabled={loading}>
                                        <Text style={styles.forgot}>Забыли пароль?</Text>
                                    </TouchableOpacity>
                                </Card.Content>
                            </Card>
                        </View>
                    </ImageBackground>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollViewContent: { flexGrow: 1 },
    bg: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', height },
    inner: { width: '80%', maxWidth: 400 },
    card: {
        backgroundColor: 'rgba(255,255,255,0.95)',
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
    btn: { backgroundColor: '#6aaaaa', paddingVertical: 12, borderRadius: 8 },
    forgot: {
        color: '#0066ff',
        textDecorationLine: 'underline',
        marginTop: 15,
        textAlign: 'center',
        fontSize: 16,
    },
    message: { marginBottom: 15, textAlign: 'center', fontSize: 16 },
    err: { color: 'red' },
    ok: { color: '#2e7d32' },
});
