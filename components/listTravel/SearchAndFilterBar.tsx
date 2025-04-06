import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { IconButton } from 'react-native-paper';
import { SearchBar } from 'react-native-elements';

interface Props {
    search: string;
    setSearch: (value: string) => void;
    onToggleFilters?: () => void;
}

export default function SearchAndFilterBar({ search, setSearch, onToggleFilters }: Props) {
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
                    accessibilityLabel="Открыть фильтры"
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
                    searchIcon={{ color: '#333' }}
                    clearIcon={{ color: '#333' }}
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
                outlineStyle: 'none',
                outlineWidth: 0,
                boxShadow: 'none',
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
                caretColor: '#000', // Курсор чёрный вместо синего
            },
        }),
    },
});
