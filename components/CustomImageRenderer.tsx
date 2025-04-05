import React, { useState, useEffect } from "react";
import {
    Image,
    StyleSheet,
    ImageURISource,
    View,
} from "react-native";
import { CustomRenderer } from "react-native-render-html";

const SingleImageRenderer: CustomRenderer = function SingleImageRenderer({ tnode }) {
    const sourceUri = tnode.attributes?.src;

    if (!sourceUri) return null;

    const [aspectRatio, setAspectRatio] = useState<number>(1);

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
                // В случае ошибки оставим aspectRatio = 1
            }
        );

        return () => {
            isMounted = false;
        };
    }, [sourceUri]);

    const imageSource: ImageURISource = { uri: sourceUri };

    return (
        <View style={styles.imageContainer}>
            <Image
                source={imageSource}
                style={[
                    styles.image,
                    {
                        width: "90%",
                        maxHeight: 500,
                        aspectRatio,
                    },
                ]}
                accessible
                accessibilityLabel={String(tnode.attributes?.alt || "image")}
            />
        </View>
    );
};

export default SingleImageRenderer;

const styles = StyleSheet.create({
    imageContainer: {
        alignItems: "center",
        padding: 10,
        position: "relative",
    },
    image: {
        resizeMode: "cover",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#5A4232",
    },
});
