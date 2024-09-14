import React, { useState } from 'react'
import { View, TextInput, Button, Alert, StyleSheet, Image } from 'react-native'
import { sendFeedback } from '@/src/api/travels'

export default function FeedbackForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      Alert.alert('Ошибка', 'Заполните все поля.')
      return
    }
    sendFeedback(name, email, message)
      .then((response) => {
        Alert.alert('Успех', 'Сообщение успешно отправлено.')
      })
      .catch((error) => {
        Alert.alert('Ошибка', 'Не удалось отправить сообщение.')
      })
  }

  return (
    <View>
      <Image
        source={{ uri: '/assets/images/media/slider/about.jpg' }}
        style={styles.topImage}
      />
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
            style={styles.input}
            placeholder="Сообщение"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <Button color="#6AAAAA" title="Отправить" onPress={handleSubmit} />
        </View>
        <Image
          source={{ uri: '/assets/images/media/slider/main2.jpg' }}
          style={styles.image}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // This makes the child elements (Image and Text) sit side by side
    alignItems: 'center', // This vertically aligns the child items in the middle
    padding: 50,
  },
  button: {

  },
  form: {
    flex: 1,
    padding: 50,
  },
  input: {
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  image: {
    width: '50%',
    height: 500,
    marginRight: 10, // Adds some space between the image and the text
  },
  topImage: {
    width: '100%',
    height: 300,
  },
})
