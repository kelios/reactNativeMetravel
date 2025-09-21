// src/components/listTravel/TravelListItem.tsx
import React, { memo, useCallback, useMemo } from "react";
import { View, Pressable, Text, StyleSheet, Platform } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import type { Travel } from "@/src/types/types";

/** LQIP-плейсхолдер — чтобы не мигало чёрным на native */
const PLACEHOLDER_BLURHASH = "LEHL6nWB2yk8pyo0adR*.7kCMdnj";
const ICON_COLOR = "#111827"; // тёмные иконки под светлое стекло

const WebImageOptimized = memo(function WebImageOptimized({
                                                              src,
                                                              alt,
                                                          }: {
    src: string;
    alt: string;
}) {
    // RN Web допускает нативный <img>, TS может ругаться в некоторых конфигурациях — это безопасно.
    // eslint-disable-next-line jsx-a11y/alt-text
    return (
        // @ts-expect-error — допустимо для RN Web
        <img
            src={src}
            alt={alt}
            style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
            }}
            loading="lazy"
            decoding="async"
        />
    );
});

const NativeImageOptimized = memo(function NativeImageOptimized({
                                                                    uri,
                                                                }: {
    uri: string;
}) {
    return (
        <ExpoImage
            source={{ uri }}
            style={styles.img}
            contentFit="cover"
            transition={180}
            cachePolicy="memory-disk"
            placeholder={{ blurhash: PLACEHOLDER_BLURHASH }}
            priority="low"
            recyclingKey={uri}
            accessibilityIgnoresInvertColors
        />
    );
});

const CountriesList = memo(function CountriesList({ countries }: { countries: string[] }) {
    if (!countries.length) return null;
    return (
        <View style={styles.tags}>
            {countries.slice(0, 2).map((c) => (
                <View key={c} style={styles.tag}>
                    <Feather name="map-pin" size={11} color={ICON_COLOR} />
                    <Text style={styles.tagTxt}>{c}</Text>
                </View>
            ))}
            {countries.length > 2 && (
                <View style={styles.tag}>
                    <Text style={styles.tagTxt}>+{countries.length - 2}</Text>
                </View>
            )}
        </View>
    );
});

type Props = {
    travel: Travel;
    isSuperuser?: boolean;
    isMetravel?: boolean;
    onDeletePress?: (id: number) => void;
    isFirst?: boolean;
    isSingle?: boolean;
    selectable?: boolean;
    isSelected?: boolean;
    onToggle?: () => void;
};

function TravelListItem({
                            travel,
                            isSuperuser,
                            isMetravel,
                            onDeletePress,
                            isSingle = false,
                            selectable = false,
                            isSelected = false,
                            onToggle,
                        }: Props) {
    if (!travel) return null;

    const {
        id,
        slug,
        travel_image_thumb_url,
        name,
        countryName = "",
        userName,
        countUnicIpView = 0,
    } = travel;

    // Оптимизируем превью под карточку
    const imgUrl = useMemo(() => {
        if (!travel_image_thumb_url) return null;
        const targetW = isSingle ? 600 : 400;
        const targetH = Math.floor(targetW * 0.75);
        return `${travel_image_thumb_url}?w=${targetW}&h=${targetH}&q=75&fit=crop&auto=format`;
    }, [travel_image_thumb_url, isSingle]);

    const countries = useMemo(
        () => (countryName || "").split(",").map((c) => c.trim()).filter(Boolean),
        [countryName]
    );

    const canEdit = !!(isSuperuser || isMetravel);

    const handlePress = useCallback(() => {
        if (selectable) {
            onToggle?.();
        } else {
            // На всякий: если слуг нет — откроем по ID
            router.push(`/travels/${slug ?? id}`);
        }
    }, [selectable, onToggle, slug, id]);

    const handleEdit = useCallback(() => {
        router.push(`/travel/${id}`);
    }, [id]);

    const handleDelete = useCallback(() => {
        onDeletePress?.(id);
    }, [id, onDeletePress]);

    return (
        <View style={styles.wrap}>
            <Pressable
                onPress={handlePress}
                android_ripple={
                    Platform.OS === "android" ? { color: "rgba(17,24,39,0.06)" } : undefined
                }
                style={[
                    styles.card,
                    Platform.OS === "android" && styles.androidOptimized,
                    isSingle && styles.single,
                    selectable && isSelected && styles.selected,
                ]}
                accessibilityLabel={`Путешествие: ${name}`}
                accessibilityRole="button"
            >
                {/* Изображение */}
                {imgUrl ? (
                    Platform.OS === "web" ? (
                        <WebImageOptimized src={imgUrl} alt={name} />
                    ) : (
                        <NativeImageOptimized uri={imgUrl} />
                    )
                ) : (
                    <View style={styles.imgStub}>
                        <Feather name="image" size={40} color="#94a3b8" />
                    </View>
                )}

                {/* Градиент для читаемости текста */}
                <LinearGradient
                    colors={["transparent", "rgba(255,255,255,0.6)", "rgba(255,255,255,0.78)"]}
                    locations={[0.55, 0.85, 1]}
                    style={styles.grad}
                    pointerEvents="none"
                />

                {/* Контент поверх изображения */}
                <View style={styles.overlay} pointerEvents="none">
                    <CountriesList countries={countries} />

                    <View style={styles.titleBox}>
                        <Text style={styles.title} numberOfLines={2}>
                            {name}
                        </Text>
                    </View>

                    <View style={styles.metaRow}>
                        {!!userName && (
                            <View style={styles.metaBox}>
                                <Feather name="user" size={12} color={ICON_COLOR} />
                                <Text style={styles.metaTxt} numberOfLines={1}>
                                    {userName}
                                </Text>
                            </View>
                        )}
                        <View style={styles.metaBox}>
                            <Feather name="eye" size={12} color={ICON_COLOR} />
                            <Text style={styles.metaTxt}>{countUnicIpView}</Text>
                        </View>
                    </View>
                </View>

                {/* Индикатор выбора */}
                {selectable && (
                    <View style={styles.checkWrap} pointerEvents="none">
                        <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                            {isSelected && <Feather name="check" size={14} color="#fff" />}
                        </View>
                    </View>
                )}

                {/* Кнопки действий (редактирование/удаление) */}
                {canEdit && !selectable && (
                    <View style={styles.actions} pointerEvents="box-none">
                        <Pressable onPress={handleEdit} hitSlop={10} style={styles.btn} accessibilityLabel="Редактировать">
                            <Feather name="edit-2" size={16} color={ICON_COLOR} />
                        </Pressable>
                        <Pressable onPress={handleDelete} hitSlop={10} style={styles.btn} accessibilityLabel="Удалить">
                            <Feather name="trash-2" size={16} color={ICON_COLOR} />
                        </Pressable>
                    </View>
                )}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { padding: 8, width: "100%" },

    card: {
        position: "relative",
        width: "100%",
        aspectRatio: 1,
        borderRadius: 16,
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 2,
        overflow: "hidden",
    },

    androidOptimized: {
        shadowColor: undefined,
        shadowOffset: undefined,
        shadowOpacity: undefined,
        shadowRadius: undefined,
    },

    selected: {
        borderWidth: 2,
        borderColor: "#60a5fa",
    },

    single: {
        maxWidth: 600,
        alignSelf: "center",
    },

    img: {
        width: "100%",
        height: "100%",
        backgroundColor: "#f3f4f6",
    },

    imgStub: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f1f5f9",
    },

    grad: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "58%",
    },

    overlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: 14,
        gap: 8,
    },

    tags: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },

    tag: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(255,255,255,0.55)",
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: "rgba(17,24,39,0.06)",
    },

    tagTxt: {
        fontSize: 12,
        color: "#111827",
        fontWeight: "600",
    },

    titleBox: {
        backgroundColor: "rgba(255,255,255,0.65)",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: "rgba(17,24,39,0.06)",
    },

    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },

    metaRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },

    metaBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255,255,255,0.5)",
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: "rgba(17,24,39,0.06)",
    },

    metaTxt: {
        fontSize: 13,
        color: "#111827",
        fontWeight: "500",
    },

    actions: {
        position: "absolute",
        top: 10,
        right: 10,
        flexDirection: "row",
        gap: 6,
        backgroundColor: "rgba(255,255,255,0.75)",
        borderRadius: 20,
        padding: 5,
        borderWidth: 1,
        borderColor: "rgba(17,24,39,0.08)",
    },

    btn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.9)",
    },

    checkWrap: {
        position: "absolute",
        top: 10,
        left: 10,
    },

    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#60a5fa",
        backgroundColor: "rgba(96,165,250,0.15)",
        justifyContent: "center",
        alignItems: "center",
    },

    checkboxChecked: {
        backgroundColor: "#60a5fa",
        borderColor: "#60a5fa",
    },
});

/** Компаратор: учитываем все поля, влияющие на рендер */
function areEqual(prev: Props, next: Props) {
    // Если объект поменялся по ссылке — почти всегда есть смысл перерендерить.
    if (prev.travel !== next.travel) {
        // Но можно быстро отсечь, если не изменились критичные поля (частый кейс)
        const a = prev.travel;
        const b = next.travel;
        const sameCore =
            a.id === b.id &&
            a.travel_image_thumb_url === b.travel_image_thumb_url &&
            a.name === b.name &&
            a.countryName === b.countryName &&
            a.userName === b.userName &&
            a.countUnicIpView === b.countUnicIpView;
        if (!sameCore) return false;
    }

    // Флаги, влияющие на оформление/обработчики
    if (
        prev.isSuperuser !== next.isSuperuser ||
        prev.isMetravel !== next.isMetravel ||
        prev.isSingle !== next.isSingle ||
        prev.selectable !== next.selectable ||
        prev.isSelected !== next.isSelected
    ) {
        return false;
    }

    return true;
}

export default memo(TravelListItem, areEqual);
