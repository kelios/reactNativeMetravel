import React from 'react';
import { Image, useWindowDimensions, View, StyleSheet } from 'react-native';
import { CustomRenderer } from 'react-native-render-html';

const CustomImageRenderer: CustomRenderer = function CustomImageRenderer({ tnode }) {
    const { width } = useWindowDimensions();

    // Определяем размер изображения в зависимости от ширины экрана
    let imageWidth;
    if (width < 768) {
        imageWidth = width * 0.7; // Для мобильных
    } else if (width < 1024) {
        imageWidth = width * 0.5; // Для планшетов
    } else {
        imageWidth = width * 0.3; // Для десктопа
    }

    return (
        <View style={[styles.imageContainer]}>
                <Image
                    source={{ uri: tnode.attributes.src }}
                    style={[styles.image, { width: imageWidth, height: imageWidth * 0.75 }]} // Сохраняем соотношение 4:3
                />
          </View>
    );
};

const styles = StyleSheet.create({
    imageContainer: {
        alignItems: 'center',
        marginVertical: 15,
        padding: 10,
        position: 'relative',
    },
    image: {
        resizeMode: 'cover',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#5A4232', // Тонкий контур в стиле винтажного фото
    },

});

export default CustomImageRenderer;
