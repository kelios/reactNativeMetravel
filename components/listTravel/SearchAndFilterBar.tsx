// components/SearchAndFilterBar.tsx
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    TextInput,
    StyleSheet,
    useWindowDimensions,
    Pressable,
    Platform,
    Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface Props {
    search: string;
    setSearch: (value: string) => void;
    onToggleFilters?: () => void;
}

function SearchAndFilterBar({ search, setSearch, onToggleFilters }: Props) {
    const { width } = useWindowDimensions();
    const isMobile = width <= 768;

    // Локальное состояние с синхронизацией от внешнего пропса
    const [text, setText] = useState(search);
    const lastAppliedRef = useRef(search);

    // Если внешний search поменялся (сброс фильтров/поиска извне) — обновляем инпут
    useEffect(() => {
        if (search !== lastAppliedRef.current) {
            setText(search);
            lastAppliedRef.current = search;
        }
    }, [search]);

    const handleChange = useCallback((val: string) => {
        setText(val);
    }, []);

    const applySearch = useCallback(
        (val: string) => {
            const next = val.trim();
            lastAppliedRef.current = next;
            setSearch(next);
        },
        [setSearch]
    );

    const handleClear = useCallback(() => {
        setText("");
        applySearch("");
    }, [applySearch]);

    // Более короткий дебаунс на мобиле (ощутимо отзывчивее)
    useEffect(() => {
        const delay = isMobile ? 250 : 300;
        const id = setTimeout(() => {
            if (text !== lastAppliedRef.current) {
                applySearch(text);
            }
        }, delay);
        return () => clearTimeout(id);
    }, [text, isMobile, applySearch]);

    const Icons = useMemo(
        () => ({
            search: <Feather name="search" size={18} color="#666" aria-hidden="true" />,
            clear: <Feather name="x" size={18} color="#666" aria-hidden="true" />,
            filter: <Feather name="filter" size={22} color="#333" aria-hidden="true" />,
        }),
        []
    );

    const onSubmit = useCallback(() => {
        applySearch(text);
        Keyboard.dismiss();
    }, [applySearch, text]);

    return (
        <View style={[styles.wrap, isMobile && styles.wrapMobile]}>
            {isMobile && onToggleFilters && (
                <Pressable
                    onPress={onToggleFilters}
                    accessibilityRole="button"
                    accessibilityLabel="Открыть фильтры"
                    style={styles.filterBtn}
                    hitSlop={10}
                >
                    {Icons.filter}
                </Pressable>
            )}

            <View style={styles.searchBox}>
                {Icons.search}

                <TextInput
                    value={text}
                    onChangeText={handleChange}
                    placeholder="Найти путешествие…"
                    placeholderTextColor="#999"
                    style={styles.input}
                    returnKeyType="search"
                    onSubmitEditing={onSubmit}
                    accessibilityLabel="Поле поиска путешествий"
                    autoCapitalize="none"
                    autoCorrect={false}
                    underlineColorAndroid="transparent"
                    clearButtonMode={Platform.OS === "ios" ? "while-editing" : "never"}
                    maxLength={120}
                />

                {text !== "" && (
                    <Pressable
                        onPress={handleClear}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel="Очистить поиск"
                        style={styles.clearBtn}
                    >
                        {Icons.clear}
                    </Pressable>
                )}
            </View>
        </View>
    );
}

export default memo(
    SearchAndFilterBar,
    (prev, next) =>
        prev.search === next.search &&
        // Изменение наличия кнопки фильтров влияет на разметку
        (!!prev.onToggleFilters === !!next.onToggleFilters)
);

const styles = StyleSheet.create({
    wrap: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
        paddingHorizontal: 16,
    },
    wrapMobile: { paddingHorizontal: 8, paddingBottom: 8, marginBottom: 0 },
    filterBtn: {
        padding: 8, // чуть больше тач-таргет
        borderRadius: 20,
        ...Platform.select({ web: { cursor: "pointer" } }),
    },
    searchBox: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: Platform.OS === "web" ? 1 : 0.5,
        borderColor: "#d9d9d9",
        paddingHorizontal: 10,
        height: 40,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 1.5,
            },
            android: {
                elevation: 1.5, // поменьше, чтобы не было лишнего овердроу
            },
            web: {
                boxShadow: "0 1px 2px rgba(0,0,0,.06)",
            },
        }),
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: "#333",
        paddingVertical: 0,
        ...Platform.select({
            web: {
                outlineWidth: 0,
                backgroundColor: "transparent",
            },
        }),
    },
    clearBtn: {
        padding: 6,
        borderRadius: 16,
        ...Platform.select({ web: { cursor: "pointer" } }),
    },
});
