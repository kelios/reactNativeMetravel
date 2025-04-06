import React from 'react';
import ListTravel from '@/components/listTravel/ListTravel';
import {StyleSheet, View} from "react-native";

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
