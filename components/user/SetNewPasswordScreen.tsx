import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';

const SetNewPasswordScreen = ({ route }) => {
    const { token } = route.params; // Получить токен из параметров маршрута
    const [newPassword, setNewPassword] = useState('');
    const { setNewPassword } = useAuth();

    const handleSetNewPassword = async () => {
        const success = await setNewPassword(token, newPassword);
        if (success) {
            // Перейти на экран входа или показать сообщение об успешной смене пароля
        }
    };

    return (
        <View>
            <TextInput
                placeholder="Новый пароль"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
            />
            <Button title="Установить новый пароль" onPress={handleSetNewPassword} />
        </View>
    );
};

export default SetNewPasswordScreen;