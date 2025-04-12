import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, useWindowDimensions } from 'react-native';
import { ChevronDown, ChevronUp, MapPinned } from 'lucide-react-native';

const ToggleableMapSection = ({ children }: { children: React.ReactNode }) => {
    const [showMap, setShowMap] = useState(false);
    const { width } = useWindowDimensions();
    const isMobile = width <= 480;

    return (
        <View style={styles.wrapper}>
            <Pressable
                onPress={() => setShowMap((prev) => !prev)}
                style={({ pressed }) => [
                    styles.toggleButton,
                    pressed && styles.toggleButtonPressed,
                ]}
            >
                <MapPinned size={18} color="#3B2C24" style={{ marginRight: 6 }} />
                <Text style={[styles.toggleText, isMobile && styles.toggleTextMobile]}>
                    {showMap ? 'Скрыть карту' : 'Показать карту'}
                </Text>
                {showMap ? (
                    <ChevronUp size={18} color="#3B2C24" />
                ) : (
                    <ChevronDown size={18} color="#3B2C24" />
                )}
            </Pressable>

            {showMap && (
                <View style={[styles.mapContainer, isMobile && styles.mapContainerMobile]}>
                    {children}
                </View>
            )}
        </View>
    );
};

export default ToggleableMapSection;

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        gap: 8,
    },
    toggleButtonPressed: {
        backgroundColor: '#f0f0f0',
    },
    toggleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3B2C24',
    },
    toggleTextMobile: {
        fontSize: 14,
    },
    mapContainer: {
        marginTop: 16,
        width: '100%',
        minHeight: 400,
        borderRadius: 16,
        backgroundColor: '#fff',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    mapContainerMobile: {
        minHeight: 300,
    },
});
