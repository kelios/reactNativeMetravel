import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Image } from 'react-native';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { registration } from '@/src/api/travels';
import { FormValues } from '@/src/types/types';
import { Card } from 'react-native-paper';
import { Button } from 'react-native-elements';

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
        <View style={styles.container}>
            <Image
                source={{ uri: '/assets/images/media/slider/about.jpg' }} // Указываем путь к изображению
                style={styles.backgroundImage}
            />
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
                                <TextInput
                                    style={styles.input}
                                    onChangeText={handleChange('username')}
                                    onBlur={handleBlur('username')}
                                    value={values.username}
                                    placeholder="Имя пользователя"
                                    placeholderTextColor="#888"
                                />
                                {touched.username && errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

                                <TextInput
                                    style={styles.input}
                                    onChangeText={handleChange('email')}
                                    onBlur={handleBlur('email')}
                                    value={values.email}
                                    placeholder="Email"
                                    placeholderTextColor="#888"
                                    keyboardType="email-address"
                                />
                                {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                                <TextInput
                                    style={styles.input}
                                    onChangeText={handleChange('password')}
                                    onBlur={handleBlur('password')}
                                    value={values.password}
                                    placeholder="Пароль"
                                    placeholderTextColor="#888"
                                    secureTextEntry
                                />
                                {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                                <TextInput
                                    style={styles.input}
                                    onChangeText={handleChange('confirmPassword')}
                                    onBlur={handleBlur('confirmPassword')}
                                    value={values.confirmPassword}
                                    placeholder="Повторите пароль"
                                    placeholderTextColor="#888"
                                    secureTextEntry
                                />
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    backgroundImage: {
        width: '100%',
        height: 200, // Определяем высоту изображения, чтобы оно занимало место под формой
        position: 'absolute', // Фиксируем его положение под формой
        top: 0, // Располагаем изображение сверху
    },
    formContainer: {
        width: '90%',
        marginTop: 150, // Поднимаем форму над изображением
    },
    card: {
        padding: 20,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Полупрозрачный фон, чтобы текст был виден
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3, // Shadow для Android
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    generalMessageText: {
        color: '#e60000', // Красный цвет для ошибок
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    input: {
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        width: '100%',
        fontSize: 16,
        backgroundColor: '#fff',
    },
    applyButton: {
        backgroundColor: Platform.OS === 'ios' ? '#6aaaaa' : '#6aaaaa',
    },
});

export default RegisterForm;
