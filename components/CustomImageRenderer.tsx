import React, { useState, useEffect } from "react";
import {Image, StyleSheet, ImageURISource, useWindowDimensions, View} from "react-native";
import { CustomRenderer } from "react-native-render-html";

const SingleImageRenderer: CustomRenderer = function SingleImageRenderer({ tnode }) {
    // Достаём URL картинки
    const sourceUri = tnode.attributes?.src;
    // Если нет ссылки, ничего не рендерим
    if (!sourceUri) {
        return null;
    }

    // Состояние для пропорции (ширина / высота)
    const [aspectRatio, setAspectRatio] = useState<number>(1);

    // При первом рендере (или изменении sourceUri), получаем реальную ширину/высоту
    useEffect(() => {
        Image.getSize(
            sourceUri,
            (imgWidth, imgHeight) => {
                // Устанавливаем отношение ширины к высоте
                setAspectRatio(imgWidth / imgHeight);
            },
            (error) => {
                // Если возникла ошибка (битая ссылка или недоступно), можно залогировать
                console.warn("Ошибка загрузки изображения:", error);
                // По умолчанию останется aspectRatio = 1
            }
        );
    }, [sourceUri]);

    // Готовим объект с URI для <Image />
    const imageSource: ImageURISource = { uri: sourceUri };

    return (
        <View style={[styles.imageContainer]}>
        <Image
            source={imageSource}
            style={[
                styles.image,
                {
                    // Ширина 100% внутри родителя (RenderHTML сам решит, какая область доступна)
                    width: "90%",
                    maxHeight:500,
                    // Трик для адаптивности: высота будет вычислена автоматически
                    // по реальному отношению ширина/высота исходной картинки.
                    aspectRatio,
                },
            ]}
            accessible
            // Accessibility-метка для скринридеров
            accessibilityLabel={tnode.attributes?.alt || "image"}
        />
        </View>
    );
};

export default SingleImageRenderer;

const styles = StyleSheet.create({
    imageContainer: {
        alignItems: 'center',
        padding: 10,
        position: 'relative',
    },
    image: {
        resizeMode: "cover",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#5A4232",
        // Можно добавить margin / padding по вкусу
    },
});
