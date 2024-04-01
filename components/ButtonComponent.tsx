import React from 'react';
import {StyleSheet} from "react-native";

interface ButtonProps {
    onClick: () => void;
    label: string;
}

const ButtonComponent: React.FC<ButtonProps> = ({ onClick, label }) => {
    return (
        <button style={styles.applyButton} onClick={onClick}>{label}</button>
    );
};

export default ButtonComponent;

const styles = StyleSheet.create({
    applyButton: {
        backgroundColor: '#6aaaaa',
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10,
    }
})

