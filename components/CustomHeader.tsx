import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import RenderRightMenu from './RenderRightMenu';

export default function CustomHeader() {
    return (
        <View style={styles.wrapper}>
            <View style={styles.inner}>
                 <RenderRightMenu />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        minHeight: 56,
    },
    inner: {
        width: '100%',
        maxWidth: '100%',
        marginHorizontal: 0,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...(Platform.OS === 'web' && {
            marginLeft: 0,
            marginRight: 0,
        }),
    },
});
