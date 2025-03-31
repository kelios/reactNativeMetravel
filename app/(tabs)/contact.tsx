import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ImageBackground,
  Text,
  Button,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from 'react-native';
import { sendFeedback } from '@/src/api/travels';

export default function FeedbackForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      setResponseMessage('Заполните все поля.');
      setIsError(true);
      return;
    }

    try {
      const result = await sendFeedback(name, email, message);
      setResponseMessage(result);
      setIsError(false);
      setName('');
      setEmail('');
      setMessage('');
    } catch (error: any) {
      setResponseMessage(error.message || 'Не удалось отправить сообщение.');
      setIsError(true);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' && !e.shiftKey) {
      e.preventDefault?.();
      handleSubmit();
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
              style={styles.backgroundImage}
          >
            <View style={styles.container}>
              <View style={styles.form}>
                {responseMessage ? (
                    <Text
                        style={[
                          styles.responseText,
                          isError ? styles.errorText : styles.successText,
                        ]}
                    >
                      {responseMessage}
                    </Text>
                ) : null}

                <TextInput
                    style={styles.input}
                    placeholder="Имя"
                    value={name}
                    onChangeText={setName}
                    returnKeyType="next"
                    onSubmitEditing={() => {}} // можно фокусить email, если хочешь
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={() => {}} // можно фокусить message
                />
                <TextInput
                    style={[styles.input, styles.messageInput]}
                    placeholder="Сообщение"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    blurOnSubmit={false}
                    onKeyPress={Platform.OS === 'web' ? handleKeyPress : undefined}
                    onSubmitEditing={
                      Platform.OS !== 'web'
                          ? (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => handleSubmit()
                          : undefined
                    }
                />
                <Button color="#6AAAAA" title="Отправить" onPress={handleSubmit} />
              </View>
            </View>
          </ImageBackground>
        </ScrollView>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    height: 100,
  },
  responseText: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
  },
  successText: {
    color: '#2e7d32',
  },
});
