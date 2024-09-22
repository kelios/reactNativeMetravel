import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import ImageGalleryComponent from '@/components/ImageGalleryComponent';
import {TravelFormData, Travel} from '@/src/types/types';

interface GallerySectionProps {
    formData: TravelFormData;
    travelDataOld: Travel | null;
}

const GallerySection: React.FC<GallerySectionProps> = ({formData, travelDataOld}) => {
    return (
        <View style={styles.galleryContainer}>
            {formData?.id ? (
                <ImageGalleryComponent
                    collection="gallery"
                    idTravel={formData?.id}
                    initialImages={formData?.gallery}
                />
            ) : (
                <Text>Загрузка изображений...</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    galleryContainer: {
        marginTop: 20,
    },
});

export default GallerySection;
