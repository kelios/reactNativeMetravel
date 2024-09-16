import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

export default function ModalScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>

            <Text style={styles.title}>О сайте</Text>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

            <EditScreenInfo path="app/modal.tsx" />

            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: '#f4511e',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});
