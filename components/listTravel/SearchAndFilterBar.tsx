// components/SearchAndFilterBar.tsx
import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    useWindowDimensions,
    Pressable,
    Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Props {
    search: string;
    setSearch: (value: string) => void;
    onToggleFilters?: () => void;
}

function SearchAndFilterBar({ search, setSearch, onToggleFilters }: Props) {
    const { width } = useWindowDimensions();
    const isMobile = width <= 768;

    const [text, setText] = useState(search);
    const handleChange = useCallback((val: string) => setText(val), []);
    const handleClear = useCallback(() => {
        setText('');
        setSearch('');
    }, [setSearch]);

    useEffect(() => {
        const id = setTimeout(() => setSearch(text), 300);
        return () => clearTimeout(id);
    }, [text, setSearch]);

    const Icons = useMemo(() => ({
        search: <Feather name="search" size={18} color="#666" aria-hidden="true" />,
        clear: <Feather name="x" size={18} color="#666" aria-hidden="true" />,
        filter: <Feather name="filter" size={22} color="#333" aria-hidden="true" />,
    }), []);

    return (
        <View style={[styles.wrap, isMobile && styles.wrapMobile]}>
            {isMobile && onToggleFilters && (
                <Pressable
                    onPress={onToggleFilters}
                    accessibilityRole="button"
                    accessibilityLabel="Открыть фильтры"
                    style={styles.filterBtn}
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
                    onSubmitEditing={() => setSearch(text.trim())}
                    accessibilityLabel="Поле поиска путешествий"
                />

                {text !== '' && (
                    <Pressable
                        onPress={handleClear}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Очистить поиск"
                    >
                        {Icons.clear}
                    </Pressable>
                )}
            </View>
        </View>
    );
}

export default memo(SearchAndFilterBar, (p, n) => p.search === n.search);

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
        paddingHorizontal: 16,
    },
    wrapMobile: { paddingHorizontal: 8, paddingBottom: 8, marginBottom: 0 },
    filterBtn: {
        padding: 6,
        borderRadius: 20,
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 10,
        height: 40,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
            },
            android: { elevation: 2 },
            web: { boxShadow: '0 1px 3px rgba(0,0,0,.05)' },
        }),
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        paddingVertical: 0,
        ...Platform.select({
            web: { outlineWidth: 0, backgroundColor: 'transparent' },
        }),
    },
});
