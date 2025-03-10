import React from 'react';
import { Image, useWindowDimensions } from 'react-native';
import { CustomRenderer } from 'react-native-render-html';

const CustomImageRenderer: CustomRenderer = function CustomImageRenderer({ tnode }) {
    const { width } = useWindowDimensions();
    const imageWidth = width * 0.5;

    return (
        <Image
            source={{ uri: tnode.attributes.src }}
            style={{
                width: imageWidth,
                height: imageWidth * 0.75,
                resizeMode: 'cover',
                borderRadius: 10,
                marginVertical: 10,
            }}
        />
    );
};

export default CustomImageRenderer;
