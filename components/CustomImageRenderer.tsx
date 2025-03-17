import React from 'react';
import {Image, useWindowDimensions, View} from 'react-native';
import { CustomRenderer } from 'react-native-render-html';

const CustomImageRenderer: CustomRenderer = function CustomImageRenderer({ tnode }) {
    const { width } = useWindowDimensions();
    const imageWidth = width * 0.5;

    return (
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <Image
                source={{ uri: tnode.attributes.src }}
                style={{
                    width: imageWidth,
                    height: imageWidth * 0.75,
                    resizeMode: 'cover',
                    borderRadius: 10,
                }}
            />
        </View>
    );
};

export default CustomImageRenderer;
