import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface CheckboxComponentProps {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
}

const CheckboxComponent: React.FC<CheckboxComponentProps> = ({ label, value, onChange }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <Switch
                value={value}
                onValueChange={onChange}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    label: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
});

export default CheckboxComponent;
