import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const { sendPassword } = useAuth();

    const handleSendPassword = async () => {
        const success = await sendPassword(email);
        if (success) {
            // Перейти на экран входа или показать сообщение об успешной отправке
        }
    };

    return (
        <View>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <Button title="Отправить инструкцию" onPress={handleSendPassword} />
        </View>
    );
};

export default ForgotPasswordScreen;