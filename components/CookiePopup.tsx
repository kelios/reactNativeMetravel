import React, { useState, useEffect } from 'react'
import { Modal, View, Text, Button, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

function CookiePopup() {
  const [isVisible, setIsVisible] = useState(true) // Показать всплывающее окно по умолчанию

  useEffect(() => {
    const checkAcceptedCookies = async () => {
      const hasAcceptedCookies =
        await AsyncStorage.getItem('hasAcceptedCookies')
      setIsVisible(hasAcceptedCookies !== 'true')
    }

    checkAcceptedCookies()
  }, [])

  const handleClose = async () => {
    setIsVisible(false)
    await AsyncStorage.setItem('hasAcceptedCookies', 'true')
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            На этом сайте используются файлы cookies для улучшения вашего
            пользовательского интерфейса.{' '}
          </Text>
          <Button color="#6aaaaa" title="Принять" onPress={handleClose} />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalButton: {
    backgroundColor: '#6aaaaa',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
})

export default CookiePopup
