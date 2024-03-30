import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  Dimensions,
  Image,
  TextInput,
} from 'react-native'
import { auth } from '@/src/api/travels'
import { Card } from 'react-native-paper'
import { Button } from 'react-native-elements'

const { width, height } = Dimensions.get('window')

export default function login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: '/assets/images/media/slider/about.jpg' }}
        style={styles.topImage}
      />
      <Card style={styles.card}>
        <Card.Content>
                  <TextInput
                      placeholder="Логин"
                      value={username}
                      onChangeText={setUsername}
                      style={styles.input}
                  />
                  <TextInput
                      placeholder="Пароль"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      style={styles.input}
                  />
                  <Button
                          title="Войти"
                          buttonStyle={styles.applyButton}
                          onPress={() => auth(username, password)}>

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
        shadowOffset: { width: 0, height: 2 }, // Смещение тени
    },
 image: {
    width: '50%',
    height: 400,
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
  applyButton:{
      backgroundColor:'#6aaaaa'
  }
})
