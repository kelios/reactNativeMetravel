import React, { memo, useCallback } from 'react';
import {
    StyleSheet,
    View,
    useWindowDimensions,
    Pressable,
    Platform,
} from 'react-native';
import { SearchBar } from 'react-native-elements';
import { Feather } from '@expo/vector-icons';

interface Props {
    search: string;
    setSearch: (value: string) => void;
    onToggleFilters?: () => void;
}

/**
 * Оптимизированный Search‑bar: собственная кнопка фильтра (Pressable + Feather)
 * вместо react‑native‑paper IconButton → меньше зависимостей и ререндеров.
 * Исправлена очистка через onClear + кастомный clearIcon, у которого
 * собственный onPress сбрасывает текст.
 */
function SearchAndFilterBar({ search, setSearch, onToggleFilters }: Props) {
    const { width } = useWindowDimensions();
    const isMobile = width <= 768;

    /* ----------------------------- handlers ------------------------------ */
    const handleChange = useCallback((text: string) => setSearch(text), [setSearch]);
    const handleClear = useCallback(() => setSearch(''), [setSearch]);

    return (
        <View style={[styles.container, isMobile && styles.mobileContainer]}>
            {isMobile && onToggleFilters && (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Открыть фильтры"
                    onPress={onToggleFilters}
                    style={styles.filterButton}
                >
                    <Feather name="filter" size={22} color="#333" />
                </Pressable>
            )}

            <View style={{ flex: 1 }}>
                <SearchBar
                    placeholder="Найти путешествие..."
                    value={search}
                    onChangeText={handleChange}
                    onClear={handleClear}
                    lightTheme
                    containerStyle={styles.searchBar}
                    inputContainerStyle={styles.searchInputContainer}
                    inputStyle={styles.searchInput}
                    searchIcon={{ type: 'feather', name: 'search', color: '#333' }}
                    clearIcon={{ type: 'feather', name: 'x', color: '#333', onPress: handleClear }}
                />
            </View>
        </View>
    );
}

export default memo(SearchAndFilterBar, (prev, next) => prev.search === next.search);

/* -------------------------------------------------------------------------- */
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 6,
        paddingHorizontal: 16,
    },
    mobileContainer: {
        paddingHorizontal: 8,
        paddingBottom: 8,
        marginBottom: 0,
    },
    filterButton: {
        padding: 6,
        borderRadius: 20,
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    searchBar: {
        backgroundColor: 'transparent',
        padding: 0,
        borderBottomColor: 'transparent',
        borderTopColor: 'transparent',
    },
    searchInputContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        height: 38,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 4,

        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
                border: '1px solid #ccc',
            },
        }),
    },
    searchInput: {
        color: '#333',
        fontSize: 14,
        padding: 0,
        ...Platform.select({
            web: {
                outlineStyle: 'none',
                outlineWidth: 0,
                outlineColor: 'transparent',
                boxShadow: 'none',
                caretColor: '#000',
            },
        }),
    },
});
