import React from 'react';
import {View, TextInput, Text, StyleSheet, Alert, Image} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {registration} from '@/src/api/travels'
import {FormValues} from '@/src/types/types'
import { Card } from 'react-native-paper'
import { Button } from 'react-native-elements'

// Validation Schema using Yup
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
    const handleFormSubmit = async (values: FormValues) => {
        try {
            const response = registration(values)
         //   Alert.alert("Success", "User registered successfully");
       //     console.log(response.data);
        } catch (error) {
            console.error(error);
           // Alert.alert("Ошибка", "An error occurred during registration");
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: '/assets/images/media/slider/about.jpg' }}
                style={styles.topImage}
            />
            <Formik<FormValues>
                initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
                validationSchema={RegisterSchema}
                onSubmit={handleFormSubmit}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <Card style={styles.card}>
                    <Card.Content>
                        <TextInput
                            style={styles.input}
                            onChangeText={handleChange('username')}
                            onBlur={handleBlur('username')}
                            value={values.username}
                            placeholder="Имя пользователя"
                        />
                        {touched.username && errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

                        <TextInput
                            style={styles.input}
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            value={values.email}
                            placeholder="Email"
                            keyboardType="email-address"
                        />
                        {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                        <TextInput
                            style={styles.input}
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            value={values.password}
                            placeholder="Пароль"
                            secureTextEntry
                        />
                        {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                        <TextInput
                            style={styles.input}
                            onChangeText={handleChange('confirmPassword')}
                            onBlur={handleBlur('confirmPassword')}
                            value={values.confirmPassword}
                            placeholder="Повторите пароль"
                            secureTextEntry
                        />
                        {touched.confirmPassword && errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

                        <Button onPress={handleSubmit} buttonStyle={styles.applyButton} title="Зарегистрироваться" />
                    </Card.Content>
                    </Card>
                )}
            </Formik>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'white',
    },
    card: {
        width: '50%', // Изменено для лучшей адаптации
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        marginTop: -400, // Поднять карточку, чтобы перекрыть часть изображения
        borderRadius: 8, // Добавлено для скругления углов
        padding: 10, // Добавлено для внутренних отступов
        shadowOpacity: 0.2, // Добавлено для тени
        shadowRadius: 5, // Радиус тени
        shadowOffset: { width: 0, height: 2 }, // Смещение тени
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
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
        width: 500,
    },
    applyButton:{
        backgroundColor:'#6aaaaa'
    }
});

export default RegisterForm;