import React from "react";
import {Image, ScrollView, StyleSheet, Text, useWindowDimensions, View,} from "react-native";
import StableContent from "@/components/travel/StableContent";

interface TravelDescriptionProps {
    htmlContent: string;
    title: string;
    noBox?: boolean; // ✨ Флаг для отключения внутреннего блока
}

const TravelDescription: React.FC<TravelDescriptionProps> = ({
                                                                 htmlContent,
                                                                 title,
                                                                 noBox = false,
                                                             }) => {
    const { width, height } = useWindowDimensions();
    const pageHeight = Math.round(height * 0.7);

    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>{title}</Text>

            {noBox ? (
                <ScrollView
                    style={styles.scrollArea}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={true}
                >
                    <Image
                        source={require("@/assets/travel-stamp.png")}
                        style={styles.stamp}
                    />
                    <StableContent
                        html={htmlContent}
                        contentWidth={Math.min(width, 900) - 60}
                    />
                </ScrollView>
            ) : (
                <View style={[styles.fixedHeightBlock, { height: pageHeight }]}>
                    <ScrollView
                        style={styles.scrollArea}
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator={true}
                    >
                        <Image
                            source={require("@/assets/travel-stamp.png")}
                            style={styles.stamp}
                        />
                        <StableContent
                            html={htmlContent}
                            contentWidth={Math.min(width, 900) - 60}
                        />
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

export default TravelDescription;

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
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#3B2C24",
        marginBottom: 10,
        textAlign: "center",
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    progressBackground: {
        width: 150,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#E0E0E0",
        marginRight: 12,
        overflow: "hidden",
    },
    progressBar: {
        height: 8,
        backgroundColor: "#FFA500",
        borderRadius: 4,
    },
    pageText: {
        fontSize: 14,
        color: "#666",
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
    scrollArea: {
       // padding: 20,
    },
    stamp: {
        position: "absolute",
        top: 20,
        right: 20,
        width: 60,
        height: 60,
        opacity: 0.3,
        zIndex: 10,
    },
});
