import React, {useState} from 'react'
import {Dimensions, Image, StyleSheet, TextInput, View} from 'react-native'
import {Card} from 'react-native-paper'
import {Button} from 'react-native-elements'
import {useNavigation} from '@react-navigation/native'
import {useRoute} from "@react-navigation/core";
import {useAuth} from "@/context/AuthContext";


const {width, height} = Dimensions.get('window')

export default function login() {
    const navigation = useNavigation();
    const route = useRoute();
    const [newPassword, setParamNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { setNewPassword } = useAuth();

    const { password_reset_token } = route.params || {};

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        setNewPassword(password_reset_token, newPassword);
        // После успешного сброса пароля, возможно, стоит перенаправить пользователя на экран входа
         navigation.navigate('login');
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('@/assets/images/media/slider/about.jpg')}
                style={styles.topImage}
            />
            <Card style={styles.card}>
                <Card.Content>
                    <TextInput
                        style={styles.input}
                        placeholder="Новый пароль"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setParamNewPassword}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Подтвердите пароль"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <Button
                        title="Сменить пароль"
                        buttonStyle={styles.applyButton}
                        onPress={() => handleResetPassword()}>

                    </Button>

                </Card.Content>
            </Card>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        width: '50%', // Изменено для лучшей адаптации
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        marginTop: -400, // Поднять карточку, чтобы перекрыть часть изображения
        borderRadius: 8, // Добавлено для скругления углов
        padding: 10, // Добавлено для внутренних отступов
        shadowOpacity: 0.2, // Добавлено для тени
        shadowRadius: 5, // Радиус тени
        shadowOffset: {width: 0, height: 2}, // Смещение тени
    },
    image: {
        width: '50%',
        height: 500,
        marginRight: 10, // Adds some space between the image and the text
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
    text: {
        padding: 10,
        fontSize: 16,
    },
    link: {
        color: '#4b7c6f',
        fontSize: 16,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'white',
    },
    applyButton: {
        backgroundColor: '#6aaaaa'
    }
})
