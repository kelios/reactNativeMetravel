import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, Card } from 'react-native-elements'; // Используем Card из react-native-elements
import { confirmAccount } from '@/src/api/travels';
import { useAuth } from '@/context/AuthContext';

const { height } = Dimensions.get('window'); // Получаем высоту экрана

export default function AccountConfirmation() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const route = useRoute();
    const navigation = useNavigation();
    const { setIsAuthenticated } = useAuth();

    useEffect(() => {
        const confirm = async () => {
            try {
                const { hash } = route.params as { hash: string };
                const response = await confirmAccount(hash);
                if (response.userToken) {
                    setIsAuthenticated(true);
                    navigation.navigate('index'); // Перенаправляем на главную страницу
                } else {
                    setError('Не удалось подтвердить учетную запись. '+ response.non_field_errors[0]);
                }
            } catch (err: any) {
                setError('Произошла ошибка при подтверждении учетной записи. '+ err.message);
            } finally {
                setLoading(false);
            }
        };

        confirm();
    }, [route.params]);

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: '/assets/images/media/slider/about.jpg' }}
                style={styles.backgroundImage}
            />
            <View style={styles.contentContainer}>
                <Card containerStyle={styles.card}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : (
                        <Text style={styles.successText}>Учетная запись успешно подтверждена!</Text>
                    )}
                    {error && (
                        <Button
                            title="На главную"
                            onPress={() => navigation.navigate('index')}
                            buttonStyle={styles.button}
                        />
                    )}
                </Card>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        width: '100%',
        height: height * 0.5, // Картинка занимает верхнюю половину экрана
        position: 'absolute',
        top: 0,
        left: 0,
    },
    contentContainer: {
        width: '50%',
        position: 'absolute',
        top: '30%', // Располагаем контент немного ниже центра картинки
        alignItems: 'center',
    },
    card: {
        width: '100%',
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
        marginBottom: 20,
        textAlign: 'center',
    },
    successText: {
        color: 'green',
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#6aaaaa',
        padding: 10,
        borderRadius: 5,
    },
});
