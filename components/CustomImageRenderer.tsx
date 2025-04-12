import React, { useState, useEffect } from "react";
import {
    Image,
    View,
    Platform,
    useWindowDimensions,
    ActivityIndicator,
} from "react-native";
import { CustomRendererProps } from "react-native-render-html";

interface CustomImageRendererProps extends CustomRendererProps {
    contentWidth: number;
}

const CustomImageRenderer = ({ tnode, contentWidth }: CustomImageRendererProps) => {
    const sourceUri = tnode.attributes?.src;
    const alt = tnode.attributes?.alt || "image";
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    const imageWidth = contentWidth * 0.96;
    const [aspectRatio, setAspectRatio] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    if (!sourceUri) return null;

    const isWeb = Platform.OS === "web";

    // 🔹 WEB: <img> с ограничением по высоте окна
    if (isWeb) {
        return (
            <div
                style={{
                    margin: "20px auto",
                    padding: 8,
                    textAlign: "center",
                    borderRadius: 16,
                    backgroundColor: "#fafafa",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                    maxWidth: "100%",
                }}
            >
                <img
                    src={sourceUri}
                    alt={alt}
                    style={{
                        maxWidth: "100%",
                        maxHeight: "80vh", // 👈 ограничиваем по высоте окна
                        height: "auto",
                        borderRadius: 12,
                        objectFit: "contain",
                    }}
                    loading="lazy"
                />
            </div>
        );
    }

    // 🔸 MOBILE: react-native Image
    useEffect(() => {
        let isMounted = true;
        Image.getSize(
            sourceUri,
            (imgWidth, imgHeight) => {
                if (isMounted && imgHeight !== 0) {
                    setAspectRatio(imgWidth / imgHeight);
                    setLoading(false);
                }
            },
            (error) => {
                console.warn("Ошибка загрузки изображения:", error);
                setLoading(false);
            }
        );
        return () => {
            isMounted = false;
        };
    }, [sourceUri]);

    const computedHeight = aspectRatio ? imageWidth / aspectRatio : 200;
    const isPortrait = aspectRatio && aspectRatio < 0.75;
    const finalHeight = isPortrait
        ? Math.min(imageWidth / aspectRatio, screenHeight * 0.8)
        : computedHeight;

    return (
        <View
            style={{
                marginVertical: 16,
                alignItems: "center",
                backgroundColor: "#f8f8f8",
                borderRadius: 16,
                padding: 8,
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 6,
            }}
        >
            {loading ? (
                <ActivityIndicator size="small" />
            ) : (
                <Image
                    source={{ uri: sourceUri }}
                    style={{
                        width: imageWidth,
                        height: finalHeight,
                        borderRadius: 12,
                        resizeMode: "contain",
                    }}
                    accessible
                    accessibilityLabel={alt}
                />
            )}
        </View>
    );
};

export default CustomImageRenderer;
