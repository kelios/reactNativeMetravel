import React, { useRef, useState } from 'react';
import {
  Button,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { sendFeedback } from '@/src/api/travels';

export default function FeedbackForm() {
  /* ------------------- state ------------------- */
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  const [response, setResp]   = useState<{ text: string; error: boolean }>({ text: '', error: false });
  const [sending, setSending] = useState(false);

  /* ------------------- refs для фокуса --------- */
  const emailRef   = useRef<TextInput>(null);
  const messageRef = useRef<TextInput>(null);

  /* ------------------- helpers ----------------- */
  const isEmailValid = (val: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const clearForm = () => {
    setName('');
    setEmail('');
    setMessage('');
  };

  /* ------------------- submit ------------------ */
  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      return setResp({ text: 'Заполните все поля.', error: true });
    }
    if (!isEmailValid(email)) {
      return setResp({ text: 'Введите корректный e-mail.', error: true });
    }

    try {
      setSending(true);
      const res = await sendFeedback(name.trim(), email.trim(), message.trim());
      setResp({ text: res, error: false });
      clearForm();
    } catch (e: any) {
      setResp({ text: e?.message || 'Не удалось отправить сообщение.', error: true });
    } finally {
      setSending(false);
    }
  };

  /* ------------------- key handler ------------ */
  const handleWebKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  /* ------------------- ui ---------------------- */
  return (
      <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <ImageBackground
              source={require('@/assets/images/media/slider/about.jpg')}
              style={styles.bg}
              resizeMode="cover"
          >
            <View style={styles.center}>
              <View style={styles.form}>
                {response.text !== '' && (
                    <Text
                        style={[
                          styles.response,
                          response.error ? styles.err : styles.ok,
                        ]}
                    >
                      {response.text}
                    </Text>
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Имя"
                    value={name}
                    onChangeText={setName}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                />

                <TextInput
                    ref={emailRef}
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={() => messageRef.current?.focus()}
                />

                <TextInput
                    ref={messageRef}
                    style={[styles.input, styles.message]}
                    placeholder="Сообщение"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    blurOnSubmit={false}
                    onKeyDown={Platform.OS === 'web' ? handleWebKey : undefined}
                    onSubmitEditing={
                      Platform.OS !== 'web' ? () => handleSubmit() : undefined
                    }
                />

                <Button
                    color="#6AAAAA"
                    title={sending ? 'Отправка…' : 'Отправить'}
                    onPress={handleSubmit}
                    disabled={sending}
                />
              </View>
            </View>
          </ImageBackground>
        </ScrollView>
      </KeyboardAvoidingView>
  );
}

/* ------------------- styles ------------------ */
const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    padding: 20,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  form: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    padding: 20,
  },
  input: {
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  message: { height: 100, textAlignVertical: 'top' },
  response: { textAlign: 'center', marginBottom: 15, fontSize: 16 },
  err: { color: '#d32f2f' },
  ok: { color: '#2e7d32' },
});
