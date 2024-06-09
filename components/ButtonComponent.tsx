import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ButtonComponentProps {
    label: string;
    onPress: () => void;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({ label, onPress }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={onPress}>
                <Text style={styles.buttonText}>{label}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#4b7c6f',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default ButtonComponent;