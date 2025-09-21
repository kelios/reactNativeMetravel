import React, { memo } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
    Platform,
} from "react-native";
import StableContent from "@/components/travel/StableContent";

interface TravelDescriptionProps {
    htmlContent: string;
    title?: string;          // ← заголовок может отсутствовать
    noBox?: boolean;
}

/**
 * Описание путешествия с адаптивной высотой и безопасной разметкой.
 * - Корректно работает без title.
 * - contentWidth никогда не уходит в отрицательные значения.
 * - Плашка-штамп не перехватывает клики и не ломает скролл.
 */
const TravelDescription: React.FC<TravelDescriptionProps> = ({
                                                                 htmlContent,
                                                                 title,
                                                                 noBox = false,
                                                             }) => {
    const { width, height } = useWindowDimensions();

    // Высота для варианта с боксом
    const pageHeight = Math.round(height * 0.7);

    // Контентная ширина для StableContent (учитываем внутренние отступы и не допускаем < 220)
    const maxContent = Math.min(width, 900);
    const contentWidth = Math.max(maxContent - 60, 220);

    const showTitle = Boolean(title && String(title).trim().length > 0);
    const isEmptyHtml =
        !htmlContent || String(htmlContent).trim().replace(/<[^>]+>/g, "").length === 0;

    const inner = (
        <View style={styles.inner} pointerEvents="box-none">
            {/* Полупрозрачный штамп в углу */}
            <Image
                source={require("@/assets/travel-stamp.webp")}
                style={styles.stamp}
                accessibilityIgnoresInvertColors
                accessible={false}
                pointerEvents="none"
            />

            {/* Плейсхолдер, когда описания нет */}
            {isEmptyHtml ? (
                <Text style={styles.placeholder}>Описание скоро появится 🙂</Text>
            ) : (
                <StableContent html={htmlContent} contentWidth={contentWidth} />
            )}
        </View>
    );

    return (
        <View style={styles.wrapper} testID="travel-description">
            {noBox ? (
                <ScrollView
                    style={styles.scrollArea}
                    contentContainerStyle={styles.scrollContent}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps="handled"
                >
                    {inner}
                </ScrollView>
            ) : (
                <View style={[styles.fixedHeightBlock, { height: pageHeight }]}>
                    <ScrollView
                        style={styles.scrollArea}
                        contentContainerStyle={styles.scrollContent}
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator
                        keyboardShouldPersistTaps="handled"
                    >
                        {inner}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

export default memo(TravelDescription);

const styles = StyleSheet.create({
    wrapper: {
        alignSelf: "center",
        width: "100%",
        maxWidth: 900,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
        backgroundColor: "transparent",
    },

    inner: {
        position: "relative",
        paddingTop: 6,
    },

    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#3B2C24",
        marginBottom: 12,
        textAlign: "center",
    },

    placeholder: {
        textAlign: "center",
        color: "#6b7280",
        fontSize: 15,
        paddingVertical: 8,
    },

    fixedHeightBlock: {
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 10,
        backgroundColor: "#FFF",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    scrollArea: {},

    scrollContent: {
        paddingBottom: 8,
    },

    stamp: {
        position: "absolute",
        top: 4,
        right: 4,
        width: 60,
        height: 60,
        opacity: 0.25,
        zIndex: 1,
    },
});
