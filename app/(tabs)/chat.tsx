import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { Button } from 'react-native-paper';
import { sendAIMessage} from "@/src/api/travels";

export default function ChatScreen() {
    const [messages, setMessages] = useState([]); // Сообщения в чате
    const [inputText, setInputText] = useState(''); // Текст, который вводит пользователь

    // Функция для отправки запроса на backend
    const sendMessage = async () => {
        if (inputText.trim() === '') return;

        // Добавляем сообщение пользователя в чат
        const userMessage = { id: messages.length + 1, text: inputText, isUser: true };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInputText('');

        try {
            // Отправляем запрос на ваш backend
            const response = await sendAIMessage(inputText);

            // Добавляем ответ от бота в чат
            const botMessage = { id: messages.length + 2, text: response.data.reply, isUser: false };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            const errorMessage = { id: messages.length + 2, text: 'Произошла ошибка. Попробуйте снова.', isUser: false };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        }
    };

    // Рендер сообщений
    const renderMessage = ({ item }) => (
        <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.botMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.messagesList}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Задайте ваш вопрос..."
                />
                <Button mode="contained" onPress={sendMessage} style={styles.button}>
                    Отправить
                </Button>
            </View>
        </SafeAreaView>
    );
}

// Стили
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    messagesList: {
        padding: 10,
    },
    messageContainer: {
        maxWidth: '80%',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#007bff',
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#e0e0e0',
    },
    messageText: {
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginRight: 10,
    },
    button: {
        justifyContent: 'center',
    },
});

