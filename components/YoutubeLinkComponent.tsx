import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface YoutubeLinkComponentProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

const YoutubeLinkComponent: React.FC<YoutubeLinkComponentProps> = ({ label, value, onChange }) => {
    const [inputValue, setInputValue] = useState(value);
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const validateYoutubeUrl = (url: string) => {
        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S+)?$/;
        return regex.test(url);
    };

    const handleBlur = () => {
        if (inputValue.trim() === '') {
            setIsValid(true);
            onChange('');
            return;
        }

        const valid = validateYoutubeUrl(inputValue);
        setIsValid(valid);
        if (valid) {
            onChange(inputValue);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, !isValid && styles.invalidInput]}
                value={inputValue}
                onChangeText={setInputValue}
                onBlur={handleBlur}
                placeholder="Введите ссылку на YouTube"
            />
            {!isValid && <Text style={styles.errorText}>Неверная ссылка на YouTube</Text>}
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
    invalidInput: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        marginTop: 5,
    },
});

export default YoutubeLinkComponent;
