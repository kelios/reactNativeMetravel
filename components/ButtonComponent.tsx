import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

interface ButtonComponentProps {
    label: string;
    onPress: () => void;
    disabled?: boolean;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({ label, onPress, disabled = false }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, disabled && styles.buttonDisabled]}
                onPress={onPress}
                disabled={disabled}
                activeOpacity={0.8}
            >
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
        paddingVertical: Platform.OS === 'ios' ? 12 : 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        minWidth: 120,
    },
    buttonDisabled: {
        backgroundColor: '#9bb5ad',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default ButtonComponent;
