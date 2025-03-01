import React from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import ImageGalleryComponent from '@/components/ImageGalleryComponent';
import { TravelFormData, Travel } from '@/src/types/types';

interface GallerySectionProps {
    formData: TravelFormData | null;
    travelDataOld?: Travel | null;
}

const GallerySection: React.FC<GallerySectionProps> = ({ formData }) => {
    if (!formData) {
        return (
            <View style={styles.galleryContainer}>
                <ActivityIndicator size="large" color="#6aaaaa" />
                <Text>Загрузка данных...</Text>
            </View>
        );
    }

    if (!formData.id) {
        return (
            <View style={styles.galleryContainer}>
                <Text>Галерея станет доступна после сохранения путешествия.</Text>
            </View>
        );
    }

    const isGalleryEmpty = !formData.gallery || formData.gallery.length === 0;

    return (
        <View style={styles.galleryContainer}>
            {isGalleryEmpty && (
                <Text>Пока нет изображений в галерее.</Text>
            )}

            <ImageGalleryComponent
                collection="gallery"
                idTravel={formData.id}
                initialImages={formData.gallery}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    galleryContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
    },
});

export default GallerySection;
