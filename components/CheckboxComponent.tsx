import React from 'react';
import { View, Text, Switch, StyleSheet, Platform } from 'react-native';

interface CheckboxComponentProps {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
}

const CheckboxComponent: React.FC<CheckboxComponentProps> = ({ label, value, onChange }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label} numberOfLines={1}>
                {label}
            </Text>
            <Switch
                value={value}
                onValueChange={onChange}
                thumbColor={Platform.OS === 'android' ? (value ? '#ff7f50' : '#f4f3f4') : undefined}
                trackColor={{ false: '#ccc', true: '#ffb899' }}
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
        marginRight: 8,
    },
});

export default CheckboxComponent;
