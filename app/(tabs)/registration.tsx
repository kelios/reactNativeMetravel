import React, { useState } from 'react';
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
import { Button, Icon } from 'react-native-elements';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { registration } from '@/src/api/travels';
import type { FormValues } from '@/src/types/types';

const { height } = Dimensions.get('window');

/* ---------- Yup-схема ---------- */
const RegisterSchema = Yup.object().shape({
    username: Yup.string()
        .trim()
        .matches(/^[\w\-]{2,30}$/, 'Допустимы буквы, цифры, -, _ (2-30 симв.)')
        .required('Поле обязательно'),
    email: Yup.string()
        .email('Некорректный email')
        .required('Поле обязательно'),
    password: Yup.string()
        .min(8, 'Минимум 8 символов')
        .required('Поле обязательно'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Пароли не совпадают')
        .required('Подтверждение обязательно'),
});

export default function RegisterForm() {
    const [showPass, setShowPass] = useState(false);
    const [generalMsg, setMsg] = useState<{ text: string; error: boolean }>({ text: '', error: false });

    const onSubmit = async (
        values: FormValues,
        { setSubmitting, resetForm }: FormikHelpers<FormValues>,
    ) => {
        setMsg({ text: '', error: false });
        try {
            const res = await registration(values);
            setMsg({ text: res, error: /ошиб|fail|invalid/i.test(res) });
            if (!/ошиб|fail|invalid/i.test(res)) resetForm();
        } catch (e: any) {
            setMsg({ text: e?.message || 'Не удалось зарегистрироваться.', error: true });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <ImageBackground
                    source={require('@/assets/images/media/slider/about.jpg')}
                    style={styles.bg}
                    resizeMode="cover"
                    blurRadius={3}
                >
                    <Formik<FormValues>
                        initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
                        validationSchema={RegisterSchema}
                        onSubmit={onSubmit}
                    >
                        {({
                              handleChange,
                              handleBlur,
                              handleSubmit,
                              values,
                              errors,
                              touched,
                              isSubmitting,
                          }) => (
                            <View style={styles.center}>
                                <Card style={styles.card}>
                                    <Card.Content>
                                        {generalMsg.text !== '' && (
                                            <Text
                                                style={[
                                                    styles.msg,
                                                    generalMsg.error ? styles.err : styles.ok,
                                                ]}
                                            >
                                                {generalMsg.text}
                                            </Text>
                                        )}

                                        {/* ---------- username ---------- */}
                                        <View style={styles.inputWrap}>
                                            <Icon name="account" type="material-community" size={20} color="#888" />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Имя пользователя"
                                                placeholderTextColor="#888"
                                                value={values.username}
                                                onChangeText={handleChange('username')}
                                                onBlur={handleBlur('username')}
                                                autoCapitalize="none"
                                                returnKeyType="next"
                                            />
                                        </View>
                                        {touched.username && errors.username && (
                                            <Text style={styles.err}>{errors.username}</Text>
                                        )}

                                        {/* ---------- email ---------- */}
                                        <View style={styles.inputWrap}>
                                            <Icon name="email" type="material-community" size={20} color="#888" />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Email"
                                                placeholderTextColor="#888"
                                                value={values.email}
                                                onChangeText={handleChange('email')}
                                                onBlur={handleBlur('email')}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                returnKeyType="next"
                                            />
                                        </View>
                                        {touched.email && errors.email && (
                                            <Text style={styles.err}>{errors.email}</Text>
                                        )}

                                        {/* ---------- password ---------- */}
                                        <View style={styles.inputWrap}>
                                            <Icon name="lock" type="material-community" size={20} color="#888" />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Пароль"
                                                placeholderTextColor="#888"
                                                value={values.password}
                                                onChangeText={handleChange('password')}
                                                onBlur={handleBlur('password')}
                                                secureTextEntry={!showPass}
                                                returnKeyType="next"
                                            />
                                            <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                                                <Icon
                                                    name={showPass ? 'eye-off' : 'eye'}
                                                    type="material-community"
                                                    size={20}
                                                    color="#888"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        {touched.password && errors.password && (
                                            <Text style={styles.err}>{errors.password}</Text>
                                        )}

                                        {/* ---------- confirm ---------- */}
                                        <View style={styles.inputWrap}>
                                            <Icon name="lock-check" type="material-community" size={20} color="#888" />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Повторите пароль"
                                                placeholderTextColor="#888"
                                                value={values.confirmPassword}
                                                onChangeText={handleChange('confirmPassword')}
                                                onBlur={handleBlur('confirmPassword')}
                                                secureTextEntry={!showPass}
                                                returnKeyType="done"
                                                onSubmitEditing={() => handleSubmit()}
                                            />
                                        </View>
                                        {touched.confirmPassword && errors.confirmPassword && (
                                            <Text style={styles.err}>{errors.confirmPassword}</Text>
                                        )}

                                        {/* ---------- button ---------- */}
                                        <Button
                                            title={isSubmitting ? 'Отправка…' : 'Зарегистрироваться'}
                                            buttonStyle={styles.btn}
                                            onPress={handleSubmit as any}
                                            disabled={isSubmitting}
                                            loading={isSubmitting}
                                        />
                                    </Card.Content>
                                </Card>
                            </View>
                        )}
                    </Formik>
                </ImageBackground>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
    bg: { flex: 1, justifyContent: 'center', alignItems: 'center', height },
    center: { width: '85%', maxWidth: 420 },
    card: {
        padding: 20,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.92)',
        elevation: 4,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        marginBottom: 12,
    },
    input: { flex: 1, paddingVertical: 10, fontSize: 16 },
    err: { color: '#d32f2f', marginBottom: 6, textAlign: 'left' },
    ok: { color: '#2e7d32', marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
    msg: { marginBottom: 20, textAlign: 'center', fontSize: 16 },
    btn: { backgroundColor: '#6aaaaa', borderRadius: 6, marginTop: 8 },
});
