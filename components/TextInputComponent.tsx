import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface TextInputComponentProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    secureTextEntry?: boolean;
    placeholder?: string;
}

const TextInputComponent: React.FC<TextInputComponentProps> = ({
                                                                   label,
                                                                   value,
                                                                   onChange,
                                                                   secureTextEntry = false,
                                                                   placeholder,
                                                               }) => {
    return (
        <View style={styles.container}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder || `Введите ${label?.toLowerCase?.() || ''}`}
                secureTextEntry={secureTextEntry}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    label: { marginBottom: 6, fontSize: 15, color: '#333', fontWeight: '500' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 15,
        backgroundColor: '#fff',
    },
});

export default React.memo(TextInputComponent);
