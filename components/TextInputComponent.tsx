// TextInputComponent.tsx
import React from 'react';
import {StyleSheet} from "react-native";

interface TextInputProps {
    label: string;
}

const TextInputComponent: React.FC<TextInputProps> = ({ label }) => {
    const [value, setValue] = React.useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    return (
        <div>
            <label>{label}</label>
            <input style={styles.textInput} type="text" value={value} onChange={handleChange} />
        </div>
    );
};

export default TextInputComponent;

const styles = StyleSheet.create({
textInput: {
    borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
},
})