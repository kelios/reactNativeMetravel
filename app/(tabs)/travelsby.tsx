import React from 'react';
import { View, StyleSheet } from 'react-native';
import ListTravel from '@/components/ListTravel';

export default function TravelScreen() {
    return (
        <View style={styles.container}>
            <ListTravel />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
