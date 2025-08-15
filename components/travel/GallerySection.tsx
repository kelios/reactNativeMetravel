import React from 'react';
import { View, StyleSheet, Text, ActivityIndicator, useColorScheme } from 'react-native';
import ImageGalleryComponent from '@/components/travel/ImageGalleryComponent';
import { TravelFormData, Travel } from '@/src/types/types';

interface GallerySectionProps {
    formData: TravelFormData | null;
    travelDataOld?: Travel | null;
}

const GallerySection: React.FC<GallerySectionProps> = ({ formData }) => {
    const theme = useColorScheme();
    const isDarkMode = theme === 'dark';

    if (!formData) {
        return (
            <View style={[styles.galleryContainer, isDarkMode && styles.darkBackground]}>
                <ActivityIndicator size="large" color="#6aaaaa" />
                <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
                    Загрузка данных...
                </Text>
            </View>
        );
    }

    if (!formData.id) {
        return (
            <View style={[styles.galleryContainer, isDarkMode && styles.darkBackground]}>
                <Text style={[styles.infoText, isDarkMode && styles.darkText]}>
                    Галерея станет доступна после сохранения путешествия.
                </Text>
            </View>
        );
    }

    const isGalleryEmpty = !formData.gallery || formData.gallery.length === 0;

    return (
        <View style={[styles.galleryContainer, isDarkMode && styles.darkBackground]}>
            {isGalleryEmpty ? (
                <Text style={[styles.emptyText, isDarkMode && styles.darkText]}>
                    Пока нет изображений в галерее.
                </Text>
            ) : (
                <ImageGalleryComponent
                    collection="gallery"
                    idTravel={formData.id}
                    initialImages={formData.gallery}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    galleryContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    darkBackground: {
        backgroundColor: '#222',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
    },
    infoText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#888',
        textAlign: 'center',
    },
    darkText: {
        color: '#ddd',
    },
});

export default GallerySection;
