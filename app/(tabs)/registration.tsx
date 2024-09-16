import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { registration } from '@/src/api/travels';
import { FormValues } from '@/src/types/types';
import { Card } from 'react-native-paper';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { height } = Dimensions.get('window'); // Получаем высоту экрана

// Валидационная схема с использованием Yup
const RegisterSchema = Yup.object().shape({
    username: Yup.string()
        .min(2, 'Поле слишком короткое, минимум 2 символа')
        .max(30, 'Поле слишком длинное, максимум 30 символов')
        .required('Поле обязательно для заполнения'),
    email: Yup.string().email('Неправильно заполнено поле - email').required('Поле обязательно для заполнения'),
    password: Yup.string()
        .min(8, 'Поле пароль должно содержать минимум 8 символов')
        .required('Поле обязательно для заполнения'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Пароли не совпадают')
        .required('Поле подвердить пароль обязательно для заполнения'),
});

const RegisterForm = () => {
    const [generalMessage, setGeneralMessage] = useState<string | null>(null);

    const handleFormSubmit = async (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
        setGeneralMessage(null);
        try {
            const serverMessage = await registration(values);
            setGeneralMessage(serverMessage);
        } catch (error: any) {
            console.error('Error during registration:', error);
            setGeneralMessage(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ImageBackground
            source={{ uri: '/assets/images/media/slider/about.jpg' }}
            style={styles.backgroundImage}
        >
            <Formik<FormValues>
                initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
                validationSchema={RegisterSchema}
                onSubmit={handleFormSubmit}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                    <View style={styles.formContainer}>
                        <Card style={styles.card}>
                            <Card.Content>
                                {generalMessage && (
                                    <Text style={styles.generalMessageText}>{generalMessage}</Text>
                                )}
                                <View style={styles.inputContainer}>
                                    <Icon name="account" size={20} color="#888" style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        onChangeText={handleChange('username')}
                                        onBlur={handleBlur('username')}
                                        value={values.username}
                                        placeholder="Имя пользователя"
                                        placeholderTextColor="#888"
                                    />
                                </View>
                                {touched.username && errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

                                <View style={styles.inputContainer}>
                                    <Icon name="email" size={20} color="#888" style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        onChangeText={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                        value={values.email}
                                        placeholder="Email"
                                        placeholderTextColor="#888"
                                        keyboardType="email-address"
                                    />
                                </View>
                                {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                                <View style={styles.inputContainer}>
                                    <Icon name="lock" size={20} color="#888" style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        onChangeText={handleChange('password')}
                                        onBlur={handleBlur('password')}
                                        value={values.password}
                                        placeholder="Пароль"
                                        placeholderTextColor="#888"
                                        secureTextEntry
                                    />
                                </View>
                                {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                                <View style={styles.inputContainer}>
                                    <Icon name="lock-check" size={20} color="#888" style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        onChangeText={handleChange('confirmPassword')}
                                        onBlur={handleBlur('confirmPassword')}
                                        value={values.confirmPassword}
                                        placeholder="Повторите пароль"
                                        placeholderTextColor="#888"
                                        secureTextEntry
                                    />
                                </View>
                                {touched.confirmPassword && errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

                                <Button
                                    onPress={handleSubmit}
                                    buttonStyle={styles.applyButton}
                                    title={isSubmitting ? "Отправка..." : "Зарегистрироваться"}
                                    disabled={isSubmitting}
                                />
                            </Card.Content>
                        </Card>
                    </View>
                )}
            </Formik>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    formContainer: {
        width: '80%',
    },
    card: {
        padding: 20,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Полупрозрачный фон для лучшей читаемости
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3, // Тени для Android
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    generalMessageText: {
        color: '#e60000', // Цвет ошибки
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
    },
    applyButton: {
        backgroundColor: '#6aaaaa',
        width: '100%',
        marginTop: 10,
    },
});

export default RegisterForm;
