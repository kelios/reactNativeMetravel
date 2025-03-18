import React from 'react';
import { Image, useWindowDimensions, View } from 'react-native';
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
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <Image
                source={{ uri: tnode.attributes.src }}
                style={{
                    width: imageWidth,
                    height: imageWidth * 0.75, // Сохраняем соотношение 4:3
                    resizeMode: 'cover',
                    borderRadius: 10,
                }}
            />
        </View>
    );
};

export default CustomImageRenderer;
