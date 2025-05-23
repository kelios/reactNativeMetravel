import React from 'react';
import {StyleSheet, View} from 'react-native';
import ListTravel from '@/components/listTravel/ListTravel';

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
