import React, { useState, useEffect } from "react";
import {
    Image,
    StyleSheet,
    ImageURISource,
    View,
    useWindowDimensions,
    Platform,
} from "react-native";
import { CustomRendererProps } from "react-native-render-html";

interface CustomImageRendererProps extends CustomRendererProps {
    contentWidth: number;
}

const CustomImageRenderer = ({ tnode, contentWidth }: CustomImageRendererProps) => {
    const sourceUri = tnode.attributes?.src;
    const alt = tnode.attributes?.alt || "image";
    const [aspectRatio, setAspectRatio] = useState<number>(1);
    const { width: screenWidth } = useWindowDimensions();

    useEffect(() => {
        let isMounted = true;

        Image.getSize(
            sourceUri,
            (imgWidth, imgHeight) => {
                if (isMounted && imgHeight !== 0) {
                    setAspectRatio(imgWidth / imgHeight);
                }
            },
            (error) => {
                console.warn("Ошибка загрузки изображения:", error);
            }
        );

        return () => {
            isMounted = false;
        };
    }, [sourceUri]);

    const imageSource: ImageURISource = { uri: sourceUri };

    // Вычисляем ширину, как обычно
    const imageWidth = contentWidth * 0.9;

    // А вот высоту ограничим вручную, например, 50% от contentWidth:
    const maxHeight = contentWidth * 0.6;

    return (
        <View style={styles.imageContainer}>
            <Image
                source={imageSource}
                style={{
                    width: imageWidth,
                    height: Math.min(imageWidth / aspectRatio, maxHeight),
                    resizeMode: "contain",
                    borderRadius: 8,
                }}
                accessible
                accessibilityLabel={String(alt)}
            />
        </View>
    );
};

export default CustomImageRenderer;

const styles = StyleSheet.create({
    imageContainer: {
        alignItems: "center",
        padding: 10,
    },
});
