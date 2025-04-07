import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

type LabelTextProps = {
    label: string;
    text: string;
};

const LabelText: React.FC<LabelTextProps> = ({ label, text }) => {
    return (
        <View style={styles.labelContainer}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.text}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    labelContainer: {
        marginVertical: 4,
    },
    label: {
        fontWeight: '600',
        color: '#00796b',
        marginBottom: 2,
        fontSize: 14,
    },
    text: {
        textAlign: 'left',
        color: '#333',
        fontSize: 14,
        ...Platform.select({
            web: {
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
            },
        }),
    },
});

export default LabelText;
