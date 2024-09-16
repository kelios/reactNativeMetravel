import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, ImageBackground } from 'react-native';
import { sendFeedback } from '@/src/api/travels';

export default function FeedbackForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      Alert.alert('Ошибка', 'Заполните все поля.');
      return;
    }
    sendFeedback(name, email, message)
        .then((response) => {
          Alert.alert('Успех', 'Сообщение успешно отправлено.');
          // Clear form fields after successful submission
          setName('');
          setEmail('');
          setMessage('');
        })
        .catch((error) => {
          Alert.alert('Ошибка', 'Не удалось отправить сообщение.');
        });
  };

  return (
      <ImageBackground
          source={{ uri: '/assets/images/media/slider/about.jpg' }}
          style={styles.backgroundImage}
      >
        <View style={styles.container}>
          <View style={styles.form}>
            <TextInput
                style={styles.input}
                placeholder="Имя"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <TextInput
                style={[styles.input, styles.messageInput]}
                placeholder="Сообщение"
                value={message}
                onChangeText={setMessage}
                multiline
            />
            <Button color="#6AAAAA" title="Отправить" onPress={handleSubmit} />
          </View>
        </View>
      </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    justifyContent: 'center', // Centers the content vertically
    padding: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 500, // Limit the maximum width for better readability on larger screens
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // White background with slight transparency
    borderRadius: 10,
    padding: 20,
  },
  input: {
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  messageInput: {
    height: 100, // Increased height for multiline message input
  },
});
