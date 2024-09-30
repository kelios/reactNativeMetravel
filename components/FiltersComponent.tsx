import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import MultiSelect from 'react-native-multiple-select';
import { Ionicons } from '@expo/vector-icons';

interface FiltersComponentProps {
    filters: {
        countries: any[];
        categories: any[];
        categoryTravelAddress: any[];
        companions: any[];
        complexity: any[];
        month: any[];
        over_nights_stay: any[];
        transports: any[];
    };
    filterValue: {
        countries: string[];
        categories: string[];
        categoryTravelAddress: string[];
        companions: string[];
        complexity: string[];
        month: string[];
        over_nights_stay: string[];
        transports: string[];
        year: string;
    };
    isLoadingFilters: boolean;
    onSelectedItemsChange: (field: string, selectedItems: string[]) => void;
    handleTextFilterChange: (value: string) => void;
    handleApplyFilters: () => void;
    closeMenu: () => void;
    isMobile: boolean;
    resetFilters: () => void;
}

const FiltersComponent: React.FC<FiltersComponentProps> = ({
                                                               filters,
                                                               filterValue,
                                                               isLoadingFilters,
                                                               onSelectedItemsChange,
                                                               handleTextFilterChange,
                                                               handleApplyFilters,
                                                               closeMenu,
                                                               isMobile,
                                                               resetFilters,
                                                           }) => {
    const removeSelectedItem = (field: string, value: string) => {
        const currentItems = filterValue[field];
        if (Array.isArray(currentItems)) {
            let idToRemove;
            if (field === 'countries') {
                idToRemove =
                    filters[field]?.find((item) => item.title_ru === value)?.country_id || value;
            } else {
                idToRemove =
                    filters[field]?.find((item) => item.name === value)?.id || value;
            }
            const updatedItems = currentItems.filter((item: string) => item !== idToRemove);
            onSelectedItemsChange(field, updatedItems);
        }
    };

    const renderSelectedFilters = () => {
        if (!filters) return null;

        const selectedFilters = [
            {
                label: 'Страны',
                field: 'countries',
                values: (filterValue.countries || []).map(
                    (id) =>
                        filters.countries?.find((country) => country.country_id === id)?.title_ru ||
                        id
                ),
            },
            {
                label: 'Категории',
                field: 'categories',
                values: (filterValue.categories || []).map(
                    (id) =>
                        filters.categories?.find((category) => category.id === id)?.name || id
                ),
            },
            {
                label: 'Объекты',
                field: 'categoryTravelAddress',
                values: (filterValue.categoryTravelAddress || []).map(
                    (id) =>
                        filters.categoryTravelAddress?.find((category) => category.id === id)
                            ?.name || id
                ),
            },
            {
                label: 'Транспорт',
                field: 'transports',
                values: (filterValue.transports || []).map(
                    (id) =>
                        filters.transports?.find((transport) => transport.id === id)?.name || id
                ),
            },
            {
                label: 'Уровень физической подготовки',
                field: 'complexity',
                values: (filterValue.complexity || []).map(
                    (id) =>
                        filters.complexity?.find((level) => level.id === id)?.name || id
                ),
            },
            {
                label: 'Варианты отдыха',
                field: 'companions',
                values: (filterValue.companions || []).map(
                    (id) =>
                        filters.companions?.find((companion) => companion.id === id)?.name || id
                ),
            },
            {
                label: 'Ночлег',
                field: 'over_nights_stay',
                values: (filterValue.over_nights_stay || []).map(
                    (id) =>
                        filters.over_nights_stay?.find((stay) => stay.id === id)?.name || id
                ),
            },
            {
                label: 'Месяц',
                field: 'month',
                values: (filterValue.month || []).map(
                    (id) =>
                        filters.month?.find((month) => month.id === id)?.name || id
                ),
            },
            { label: 'Год', field: 'year', values: filterValue.year ? [filterValue.year] : [] },
        ];

        return selectedFilters
            .filter((item) => item.values.length > 0)
            .map((item, index) => (
                <View key={index} style={styles.selectedFilter}>
                    <Text style={styles.selectedFilterLabel}>{item.label}:</Text>
                    <View style={styles.filterTagsContainer}>
                        {item.values.map((value, idx) => (
                            <View key={idx} style={styles.filterTag}>
                                <Text style={styles.filterTagText}>{value}</Text>
                                <TouchableOpacity onPress={() => removeSelectedItem(item.field, value)}>
                                    <Ionicons name="close-circle" size={20} color="#00796b" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>
            ));
    };

    const renderFilterSection = (
        label: string,
        field: string,
        items: any[],
        uniqueKey: string,
        displayKey: string,
        selectText: string,
        searchPlaceholder: string
    ) => (
        <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{label}</Text>
            <MultiSelect
                hideTags={false}
                items={items}
                uniqueKey={uniqueKey}
                onSelectedItemsChange={(selectedItems) => onSelectedItemsChange(field, selectedItems)}
                selectedItems={filterValue[field]}
                selectText={selectText}
                searchInputPlaceholderText={searchPlaceholder}
                styleListContainer={styles.multiSelectList}
                tagRemoveIconColor="#999"
                tagBorderColor="#ccc"
                tagTextColor="#333"
                selectedItemTextColor="#333"
                selectedItemIconColor="#333"
                itemTextColor="#666"
                displayKey={displayKey}
                searchInputStyle={styles.searchInput}
                submitButtonColor="#6aaaaa"
                submitButtonText="Выбрать"
                fixedHeight
            />
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.filterContainer}>
                {isLoadingFilters ? (
                    <ActivityIndicator size="large" color="#6aaaaa" />
                ) : (
                    <>
                        <View style={styles.header}>
                            {isMobile && (
                                <TouchableOpacity style={styles.closeButton} onPress={closeMenu}>
                                    <Ionicons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {renderSelectedFilters()}

                        {renderFilterSection(
                            'Страны',
                            'countries',
                            filters?.countries || [],
                            'country_id',
                            'title_ru',
                            'Выберите страны...',
                            'Введите страну...'
                        )}

                        {renderFilterSection(
                            'Категории',
                            'categories',
                            filters?.categories || [],
                            'id',
                            'name',
                            'Выберите категории...',
                            'Введите категорию...'
                        )}

                        {renderFilterSection(
                            'Объекты',
                            'categoryTravelAddress',
                            filters?.categoryTravelAddress || [],
                            'id',
                            'name',
                            'Выберите объекты...',
                            'Введите объект...'
                        )}

                        {renderFilterSection(
                            'Транспорт',
                            'transports',
                            filters?.transports || [],
                            'id',
                            'name',
                            'Выберите транспорт...',
                            'Введите транспорт...'
                        )}

                        {renderFilterSection(
                            'Уровень физической подготовки',
                            'complexity',
                            filters?.complexity || [],
                            'id',
                            'name',
                            'Выберите уровень...',
                            'Введите уровень...'
                        )}

                        {renderFilterSection(
                            'Варианты отдыха',
                            'companions',
                            filters?.companions || [],
                            'id',
                            'name',
                            'Выберите варианты отдыха...',
                            'Введите вариант отдыха...'
                        )}

                        {renderFilterSection(
                            'Ночлег',
                            'over_nights_stay',
                            filters?.over_nights_stay || [],
                            'id',
                            'name',
                            'Выберите варианты ночлега...',
                            'Введите вариант ночлега...'
                        )}

                        {renderFilterSection(
                            'Месяц',
                            'month',
                            filters?.month || [],
                            'id',
                            'name',
                            'Выберите месяц...',
                            'Введите месяц...'
                        )}

                        <View style={styles.filterSection}>
                            <Text style={styles.filterLabel}>Год</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Введите год"
                                value={filterValue.year || ''}
                                onChangeText={handleTextFilterChange}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.buttonContainer}>
                            {isMobile && (
                                <TouchableOpacity style={styles.applyButton} onPress={closeMenu}>
                                    <Ionicons name="search" size={12} color="white" />
                                    <Text style={styles.resetButtonText}>Поиск</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                                <Ionicons name="refresh" size={12} color="white" />
                                <Text style={styles.resetButtonText}>Очистить фильтры</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        paddingBottom: 20,
    },
    filterContainer: {
        padding: 15,
        backgroundColor: '#fafafa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    selectedFilter: {
        marginBottom: 10,
    },
    selectedFilterLabel: {
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        fontSize: 12,
    },
    filterTagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    filterTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0f7fa',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 5,
        marginBottom: 5,
    },
    filterTagText: {
        color: '#00796b',
        marginRight: 5,
    },
    filterSection: {
        marginBottom: 15,
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    searchInput: {
        color: '#333',
    },
    multiSelectList: {
        maxHeight: 150,
    },
    input: {
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: '25%',
    },
    applyButton: {
        backgroundColor: '#6aaaaa',
        padding: 12,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        marginRight: 10,
    },
    applyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 5,
        fontSize: 12,
    },
    resetButton: {
        backgroundColor: '#ff9800',
        padding: 12,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    resetButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 5,
        fontSize: 12,
    },
});

export default FiltersComponent;
