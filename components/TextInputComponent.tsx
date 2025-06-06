import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';

interface TextInputComponentProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    secureTextEntry?: boolean;
}

const TextInputComponent: React.FC<TextInputComponentProps> = ({
                                                                   label,
                                                                   value,
                                                                   onChange,
                                                                   secureTextEntry = false,
                                                               }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder={`Введите ${String(label).toLowerCase()}`}
                secureTextEntry={secureTextEntry}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 5,
        fontSize: 16,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
});

export default TextInputComponent;
