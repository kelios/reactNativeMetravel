import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { IconButton } from 'react-native-paper';
import { SearchBar } from 'react-native-elements';

interface Props {
    search: string;
    setSearch: (value: string) => void;
    onToggleFilters?: () => void;
}

export default function SearchAndFilterBar({ search, setSearch, onToggleFilters }: Props) {
    // Хук вызываем только на верхнем уровне
    const { width } = useWindowDimensions();
    const isMobile = width <= 768;

    return (
        <View style={[styles.container, isMobile && styles.mobileContainer]}>
            {isMobile && onToggleFilters && (
                <IconButton
                    icon="filter-variant"
                    size={24}
                    onPress={onToggleFilters}
                    style={styles.filterIcon}
                />
            )}

            <View style={{ flex: 1 }}>
                <SearchBar
                    placeholder="Найти путешествие..."
                    onChangeText={setSearch}
                    value={search}
                    lightTheme
                    containerStyle={styles.searchBar}
                    inputContainerStyle={styles.searchInputContainer}
                    inputStyle={styles.searchInput}
                    searchIcon={{ color: '#333' }}  // Цвет иконки поиска
                    clearIcon={{ color: '#333' }}   // Цвет иконки очистки
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 6,
        paddingRight: 16,
        paddingLeft: 16,
    },
    mobileContainer: {
        paddingHorizontal: 8,
        paddingBottom: 8,
        marginBottom: 0,
    },
    filterIcon: {
        margin: 0,
        padding: 0,
    },
    searchBar: {
        backgroundColor: 'transparent',
        marginBottom: 0,
        padding: 0,
        height: 42,
        borderBottomColor: 'transparent',
        borderTopColor: 'transparent',
    },
    searchInputContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        height: 38,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    searchInput: {
        color: '#333',
        fontSize: 14,
        padding: 0,
    },
});
