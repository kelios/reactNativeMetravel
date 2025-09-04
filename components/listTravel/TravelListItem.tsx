// src/components/listTravel/TravelListItem.tsx
import React, { memo, useCallback, useMemo } from "react";
import { View, Pressable, Text, StyleSheet, Platform } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Небольшой blurhash-плейсхолдер, чтобы не мигало чёрным.
 * Можно заменить на реальный, если у вас есть per-image blurhash.
 */
const PLACEHOLDER_BLURHASH =
    "LEHL6nWB2yk8pyo0adR*.7kCMdnj"; // короткий универсальный

const WebImage = memo(function WebImage({
                                            src,
                                            alt,
                                            isPriority = false,
                                        }: {
    src: string;
    alt: string;
    isPriority?: boolean;
}) {
    return (
        <img
            src={src}
            alt={alt}
            width={800}
            height={600}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            decoding="async"
            loading={isPriority ? "eager" : "lazy"}
            fetchpriority={isPriority ? ("high" as any) : ("low" as any)}
            crossOrigin="anonymous"
        />
    );
});

const NativeImage = memo(function NativeImage({ uri, priority }: { uri: string; priority?: "low" | "high" }) {
    return (
        <ExpoImage
            source={{ uri }}
            style={styles.img}
            contentFit="cover"
            transition={200}
            // memory-disk: быстрее на последующих заходах; избегаем «чёрного» при ререндере
            cachePolicy="memory-disk"
            placeholder={{ blurhash: PLACEHOLDER_BLURHASH }}
            // приоритет загрузки: первая карточка может быть «high»
            priority={priority}
            recyclingKey={uri} // снижает перерасход памяти при рециклинге
        />
    );
});

type Props = {
    travel: any;
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
                            isFirst,
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
        updated_at,
    } = travel;

    const canEdit = isSuperuser || isMetravel;

    const imgUrl = useMemo(() => {
        if (!travel_image_thumb_url) return null;
        const v = updated_at ? Date.parse(updated_at) : id;
        // На мобиле делаем поменьше дефолт, чтобы быстрее грузилось
        const targetW = isSingle ? 800 : 480;
        return `${travel_image_thumb_url}?v=${v}&w=${targetW}&q=80&fit=crop&auto=format`;
    }, [travel_image_thumb_url, updated_at, id, isSingle]);

    const countries = useMemo(
        () => countryName.split(",").map((c: string) => c.trim()).filter(Boolean),
        [countryName]
    );

    const open = useCallback(() => router.push(`/travels/${slug}`), [slug]);
    const edit = useCallback(() => router.push(`/travel/${id}`), [id]);
    const remove = useCallback(() => onDeletePress && onDeletePress(id), [id, onDeletePress]);

    const handlePress = useCallback(() => {
        if (selectable) {
            onToggle && onToggle();
        } else {
            open();
        }
    }, [selectable, onToggle, open]);

    return (
        <View style={styles.wrap}>
            <Pressable
                onPress={handlePress}
                android_ripple={Platform.OS === "android" ? { color: "rgba(255,255,255,0.08)" } : undefined}
                style={[
                    styles.card,
                    isSingle && styles.single,
                    selectable && isSelected && styles.selected,
                    // Android: избегаем overflow:hidden+radius артефактов («чёрные» картинки)
                    Platform.OS === "android" ? styles.cardAndroid : styles.cardNonAndroid,
                ]}
                accessibilityLabel={`Путешествие: ${name}`}
                accessibilityRole="button"
            >
                {imgUrl ? (
                    Platform.OS === "web" ? (
                        <WebImage src={imgUrl} alt={name} isPriority={!!isFirst} />
                    ) : (
                        <NativeImage uri={imgUrl} priority={isFirst ? "high" : "low"} />
                    )
                ) : (
                    <View style={styles.imgStub}>
                        <Feather name="image" size={40} color="#666" />
                    </View>
                )}

                {/* Лёгкий градиент, не перекрываем всё — меньше овердроу */}
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.85)"]}
                    locations={[0.55, 1]}
                    style={styles.grad}
                    pointerEvents="none"
                />

                <View style={styles.overlay} pointerEvents="none">
                    {countries.length > 0 && (
                        <View style={styles.tags}>
                            {countries.map((c) => (
                                <View key={c} style={styles.tag}>
                                    <Text style={styles.tagTxt}>{c}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <Text style={styles.title} numberOfLines={2}>
                        {name}
                    </Text>

                    <View style={styles.metaRow}>
                        {!!userName && (
                            <View style={styles.metaBox}>
                                <Feather name="user" size={14} color="#eee" />
                                <Text style={styles.metaTxt}>{userName}</Text>
                            </View>
                        )}
                        <View style={styles.metaBox}>
                            <Feather name="eye" size={14} color="#eee" />
                            <Text style={styles.metaTxt}>{countUnicIpView}</Text>
                        </View>
                    </View>
                </View>

                {selectable && (
                    <View style={styles.checkWrap} pointerEvents="none">
                        <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                            {isSelected && <Feather name="check" size={14} color="#fff" />}
                        </View>
                    </View>
                )}

                {canEdit && !selectable && (
                    <View style={styles.actions} pointerEvents="box-none">
                        <Pressable onPress={edit} hitSlop={10} style={styles.btn} android_ripple={{ color: "rgba(255,255,255,0.12)" }}>
                            <Feather name="edit" size={18} color="#fff" />
                        </Pressable>
                        <Pressable onPress={remove} hitSlop={10} style={styles.btn} android_ripple={{ color: "rgba(255,255,255,0.12)" }}>
                            <Feather name="trash-2" size={18} color="#fff" />
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
        aspectRatio: 1, // квадратная карточка экономнее по высоте на мобиле
        borderRadius: 14,
        backgroundColor: "#111", // тёмный фон, если картинка не прогрузилась
        // Лёгкие тени без тяжёлых эффектов (экономим overdraw)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 1.5,
    },
    cardAndroid: {
        overflow: "visible" as const, // критично для Android: иначе бывает «чёрный» прямоугольник
    },
    cardNonAndroid: {
        overflow: "hidden" as const,
    },

    selected: { borderWidth: 3, borderColor: "#4a7c59" },
    single: { maxWidth: 600, alignSelf: "center" },

    img: { width: "100%", height: "100%", backgroundColor: "#161616" },
    imgStub: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#202020",
    },

    grad: { position: "absolute", left: 0, right: 0, bottom: 0, height: "62%" },

    overlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: 14, // компактнее на мобиле
    },

    tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
    tag: {
        backgroundColor: "rgba(255,255,255,0.16)",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    tagTxt: { fontSize: 12, color: "#fff", fontWeight: "500" },

    title: { fontSize: 16, fontWeight: "600", color: "#fff", marginBottom: 8 },

    metaRow: { flexDirection: "row", gap: 10 },
    metaBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    metaTxt: { fontSize: 13, color: "#eee", marginLeft: 6 },

    actions: { position: "absolute", top: 10, right: 10, flexDirection: "row", gap: 8 },
    btn: {
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 18,
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
    },

    checkWrap: { position: "absolute", top: 10, left: 10 },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    checkboxChecked: { backgroundColor: "#4a7c59", borderColor: "#4a7c59" },
});

/**
 * Мемо-компаратор: перерисовываем карточку только когда это реально нужно.
 */
function areEqual(prev: Props, next: Props) {
    const prevT = prev.travel;
    const nextT = next.travel;
    const sameId = prevT?.id === nextT?.id;

    // Важные поля, влияющие на вёрстку/изображение:
    const sameImg =
        prevT?.travel_image_thumb_url === nextT?.travel_image_thumb_url &&
        prevT?.updated_at === nextT?.updated_at;

    const sameMeta =
        prevT?.name === nextT?.name &&
        prevT?.countryName === nextT?.countryName &&
        prevT?.userName === nextT?.userName &&
        prevT?.countUnicIpView === nextT?.countUnicIpView;

    const sameFlags =
        prev.isSuperuser === next.isSuperuser &&
        prev.isMetravel === next.isMetravel &&
        prev.isFirst === next.isFirst &&
        prev.isSingle === next.isSingle &&
        prev.selectable === next.selectable &&
        prev.isSelected === next.isSelected;

    return sameId && sameImg && sameMeta && sameFlags;
}

export default memo(TravelListItem, areEqual);
