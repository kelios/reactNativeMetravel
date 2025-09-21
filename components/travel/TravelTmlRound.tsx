// components/travel/TravelTmlRound.tsx
import React, { memo, useMemo, useRef, useState } from "react";
import {
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { Paragraph } from "react-native-paper";
import { router } from "expo-router";
import type { Travel } from "@/src/types/types";

type Props = { travel: Travel };

const PLACEHOLDER = require("@/assets/placeholder.webp");

const TravelTmlRound: React.FC<Props> = ({ travel }) => {
    const { width } = useWindowDimensions();
    const isLarge = width > 768;

    const {
        name = "Без названия",
        slug,
        travel_image_thumb_small_url,
        countryName = "Страна не указана",
    } = travel;

    // Диаметр круга в зависимости от экрана
    const size = isLarge ? 200 : 140;
    const radius = size / 2;

    // fallback, если изображение не загрузилось
    const [failed, setFailed] = useState(false);
    const canOpen = Boolean(slug);

    const onPress = () => {
        if (!canOpen) return;
        router.push(`/travels/${slug}`);
    };

    // избегаем лишних перерисовок стилей
    const circleStyle = useMemo(
        () => ({ width: size, height: size, borderRadius: radius }),
        [size, radius]
    );
    const imgStyle = useMemo(
        () => ({ width: size, height: size }),
        [size, radius]
    );

    return (
        <View style={styles.container}>
            <Pressable
                onPress={onPress}
                disabled={!canOpen}
                android_ripple={{ color: "#dcdcdc", borderless: false }}
                style={({ pressed }) => [
                    styles.card,
                    pressed && styles.cardPressed,
                    !canOpen && styles.cardDisabled,
                ]}
                accessibilityRole="link"
                accessibilityLabel={name}
            >
                <View style={[styles.imageWrapper, circleStyle]}>
                    <Image
                        source={
                            failed || !travel_image_thumb_small_url
                                ? PLACEHOLDER
                                : { uri: travel_image_thumb_small_url }
                        }
                        onError={() => setFailed(true)}
                        style={[styles.image, imgStyle]}
                        resizeMode="cover"
                        {...(Platform.OS === "web" ? { loading: "lazy" } : {})}
                    />
                </View>

                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
                    {name}
                </Text>
                <Paragraph numberOfLines={1} ellipsizeMode="tail" style={styles.subtitle}>
                    {countryName}
                </Paragraph>
            </Pressable>
        </View>
    );
};

export default memo(TravelTmlRound);

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, alignItems: "center" },

    card: {
        alignItems: "center",
        padding: 10,
        borderRadius: 16,
        backgroundColor: "#fff",
        // тени
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        ...(Platform.OS === "android" ? { elevation: 3 } : null),
        ...(Platform.OS === "web" ? { cursor: "pointer" } : null),
    },
    cardPressed: { opacity: 0.85 },
    cardDisabled: {
        opacity: 0.6,
        ...(Platform.OS === "web" ? { cursor: "default" } : null),
    },

    imageWrapper: {
        overflow: "hidden",
        backgroundColor: "#eee",
    },
    image: { width: "100%", height: "100%" },

    title: {
        paddingTop: 10,
        color: "#4b7c6f",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
        maxWidth: 220,
    },
    subtitle: {
        fontSize: 14,
        color: "#555",
        textAlign: "center",
        maxWidth: 220,
    },
});
