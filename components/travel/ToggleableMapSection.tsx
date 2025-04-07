import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, useWindowDimensions } from 'react-native';
import { ChevronDown, ChevronUp, MapPinned } from 'lucide-react-native';

const ToggleableMapSection = ({ children }: { children: React.ReactNode }) => {
    const [showMap, setShowMap] = useState(false);
    const { width } = useWindowDimensions();
    const isMobile = width <= 480;

    return (
        <View style={[styles.wrapper, isMobile && styles.wrapperMobile]}>
            <Pressable
                onPress={() => setShowMap((prev) => !prev)}
                style={({ pressed }) => [
                    styles.toggleButton,
                    styles.toggleButtonFullWidth,
                    isMobile && styles.toggleButtonMobile,
                    pressed && styles.toggleButtonPressed,
                ]}
            >
                <MapPinned size={18} color="#6B4F4F" style={{ marginRight: 6 }} />
                <Text style={[styles.toggleText, isMobile && styles.toggleTextMobile]}>
                    {showMap ? 'Скрыть карту' : 'Показать карту'}
                </Text>
                {showMap ? <ChevronUp size={18} color="#6B4F4F" /> : <ChevronDown size={18} color="#6B4F4F" />}
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
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    wrapperMobile: {
        paddingHorizontal: 8,
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        gap: 6,
    },
    toggleButtonFullWidth: {
        width: '100%',
        justifyContent: 'center',
    },
    toggleButtonMobile: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    toggleButtonPressed: {
        backgroundColor: '#e8e8e8',
    },
    toggleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B4F4F',
    },
    toggleTextMobile: {
        fontSize: 14,
    },
    mapContainer: {
        marginTop: 14,
        width: '100%',
        minHeight: 400,
        borderRadius: 12,
        backgroundColor: '#fff',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    mapContainerMobile: {
        minHeight: 300,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#3B2C24',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
});
