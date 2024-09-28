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
                idToRemove = filters[field]?.find(item => item.title_ru === value)?.country_id || value;
            } else {
                idToRemove = filters[field]?.find(item => item.name === value)?.id || value;
            }
            const updatedItems = currentItems.filter((item: string) => item !== idToRemove);
            onSelectedItemsChange(field, updatedItems);
        }
    };

    const renderSelectedFilters = () => {
        if (!filters) return null;

        const selectedFilters = [
            { label: 'Страны', field: 'countries', values: (filterValue.countries || []).map(id => filters.countries?.find(country => country.country_id === id)?.title_ru || id) },
            { label: 'Категории', field: 'categories', values: (filterValue.categories || []).map(id => filters.categories?.find(category => category.id === id)?.name || id) },
            { label: 'Объекты', field: 'categoryTravelAddress', values: (filterValue.categoryTravelAddress || []).map(id => filters.categoryTravelAddress?.find(category => category.id === id)?.name || id) },
            { label: 'Транспорт', field: 'transports', values: (filterValue.transports || []).map(id => filters.transports?.find(transport => transport.id === id)?.name || id) },
            { label: 'Уровень физической подготовки', field: 'complexity', values: (filterValue.complexity || []).map(id => filters.complexity?.find(level => level.id === id)?.name || id) },
            { label: 'Варианты отдыха', field: 'companions', values: (filterValue.companions || []).map(id => filters.companions?.find(companion => companion.id === id)?.name || id) },
            { label: 'Ночлег', field: 'over_nights_stay', values: (filterValue.over_nights_stay || []).map(id => filters.over_nights_stay?.find(stay => stay.id === id)?.name || id) },
            { label: 'Месяц', field: 'month', values: (filterValue.month || []).map(id => filters.month?.find(month => month.id === id)?.name || id) },
            { label: 'Год', field: 'year', values: filterValue.year ? [filterValue.year] : [] },
        ];

        return selectedFilters
            .filter(item => item.values.length > 0)
            .map((item, index) => (
                <View key={index} style={styles.selectedFilter}>
                    <Text style={styles.selectedFilterLabel}>{item.label}:</Text>
                    {item.values.map((value, idx) => (
                        <View key={idx} style={styles.filterTag}>
                            <Text>{value}</Text>
                            <TouchableOpacity onPress={() => removeSelectedItem(item.field, value)}>
                                <Text style={styles.removeIcon}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            ));
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.filterContainer}>
                {isLoadingFilters ? (
                    <ActivityIndicator size="large" color="#007bff" />
                ) : (
                    <>
                        <View style={styles.selectedFiltersContainer}>
                            <Text style={styles.selectedFiltersTitle}>Выбранные фильтры:</Text>
                            {renderSelectedFilters()}
                        </View>

                        <MultiSelect
                            hideTags={false}
                            items={filters?.countries || []}
                            uniqueKey="country_id"
                            onSelectedItemsChange={(selectedItems) => onSelectedItemsChange('countries', selectedItems)}
                            selectedItems={filterValue?.countries}
                            selectText="Выберите страны..."
                            searchInputPlaceholderText="Введите страну..."
                            styleListContainer={{ ...styles.multiSelectList, height: 400 }}
                            tagRemoveIconColor="#999"
                            tagBorderColor="#999"
                            tagTextColor="#666"
                            selectedItemTextColor="#333"
                            selectedItemIconColor="#333"
                            itemTextColor="#666"
                            displayKey="title_ru"
                            searchInputStyle={styles.searchInput}
                            fixedHeight
                        />

                        <MultiSelect
                            hideTags={false}
                            items={filters?.categories || []}
                            uniqueKey="id"
                            onSelectedItemsChange={(selectedItems) => onSelectedItemsChange('categories', selectedItems)}
                            selectedItems={filterValue?.categories}
                            selectText="Выберите категории..."
                            searchInputPlaceholderText="Введите категорию..."
                            styleListContainer={{ ...styles.multiSelectList, height: 400 }}
                            tagRemoveIconColor="#999"
                            tagBorderColor="#999"
                            tagTextColor="#666"
                            selectedItemTextColor="#333"
                            selectedItemIconColor="#333"
                            itemTextColor="#666"
                            displayKey="name"
                            searchInputStyle={styles.searchInput}
                            fixedHeight
                        />

                        <MultiSelect
                            hideTags
                            items={filters?.categoryTravelAddress || []}
                            uniqueKey="id"
                            onSelectedItemsChange={(selectedItems) => onSelectedItemsChange('categoryTravelAddress', selectedItems)}
                            selectedItems={filterValue?.categoryTravelAddress}
                            selectText="Выберите объекты..."
                            searchInputPlaceholderText="Введите объект..."
                            styleListContainer={{ ...styles.multiSelectList, height: 400 }}
                            tagRemoveIconColor="#999"
                            tagBorderColor="#999"
                            tagTextColor="#666"
                            selectedItemTextColor="#333"
                            selectedItemIconColor="#333"
                            itemTextColor="#666"
                            displayKey="name"
                            searchInputStyle={styles.searchInput}
                            fixedHeight
                        />

                        <MultiSelect
                            hideTags={false}
                            items={filters?.transports || []}
                            uniqueKey="id"
                            onSelectedItemsChange={(selectedItems) => onSelectedItemsChange('transports', selectedItems)}
                            selectedItems={filterValue?.transports}
                            selectText="Выберите транспорт..."
                            searchInputPlaceholderText="Введите транспорт..."
                            styleListContainer={{ ...styles.multiSelectList, height: 300 }}
                            tagRemoveIconColor="#999"
                            tagBorderColor="#999"
                            tagTextColor="#666"
                            selectedItemTextColor="#333"
                            selectedItemIconColor="#333"
                            itemTextColor="#666"
                            displayKey="name"
                            searchInputStyle={styles.searchInput}
                            fixedHeight
                        />

                        <MultiSelect
                            hideTags={false}
                            items={filters?.complexity || []}
                            uniqueKey="id"
                            onSelectedItemsChange={(selectedItems) => onSelectedItemsChange('complexity', selectedItems)}
                            selectedItems={filterValue?.complexity}
                            selectText="Выберите уровень физической подготовки..."
                            searchInputPlaceholderText="Введите уровень..."
                            styleListContainer={{ ...styles.multiSelectList, height: 300 }}
                            tagRemoveIconColor="#999"
                            tagBorderColor="#999"
                            tagTextColor="#666"
                            selectedItemTextColor="#333"
                            selectedItemIconColor="#333"
                            itemTextColor="#666"
                            displayKey="name"
                            searchInputStyle={styles.searchInput}
                            fixedHeight
                        />

                        <MultiSelect
                            hideTags={false}
                            items={filters?.companions || []}
                            uniqueKey="id"
                            onSelectedItemsChange={(selectedItems) => onSelectedItemsChange('companions', selectedItems)}
                            selectedItems={filterValue?.companions}
                            selectText="Выберите варианты отдыха с..."
                            searchInputPlaceholderText="Введите вариант отдыха..."
                            styleListContainer={{ ...styles.multiSelectList, height: 300 }}
                            tagRemoveIconColor="#999"
                            tagBorderColor="#999"
                            tagTextColor="#666"
                            selectedItemTextColor="#333"
                            selectedItemIconColor="#333"
                            itemTextColor="#666"
                            displayKey="name"
                            searchInputStyle={styles.searchInput}
                            fixedHeight
                        />

                        <MultiSelect
                            hideTags={false}
                            items={filters?.over_nights_stay || []}
                            uniqueKey="id"
                            onSelectedItemsChange={(selectedItems) => onSelectedItemsChange('over_nights_stay', selectedItems)}
                            selectedItems={filterValue?.over_nights_stay}
                            selectText="Выберите варианты ночлега..."
                            searchInputPlaceholderText="Введите вариант ночлега..."
                            styleListContainer={{ ...styles.multiSelectList, height: 300 }}
                            tagRemoveIconColor="#999"
                            tagBorderColor="#999"
                            tagTextColor="#666"
                            selectedItemTextColor="#333"
                            selectedItemIconColor="#333"
                            itemTextColor="#666"
                            displayKey="name"
                            searchInputStyle={styles.searchInput}
                            fixedHeight
                        />

                        <MultiSelect
                            hideTags={false}
                            items={filters?.month || []}
                            uniqueKey="id"
                            onSelectedItemsChange={(selectedItems) => onSelectedItemsChange('month', selectedItems)}
                            selectedItems={filterValue?.month}
                            selectText="Выберите месяц..."
                            searchInputPlaceholderText="Введите месяц..."
                            styleListContainer={{ ...styles.multiSelectList, height: 300 }}
                            tagRemoveIconColor="#999"
                            tagBorderColor="#999"
                            tagTextColor="#666"
                            selectedItemTextColor="#333"
                            selectedItemIconColor="#333"
                            itemTextColor="#666"
                            displayKey="name"
                            searchInputStyle={styles.searchInput}
                            fixedHeight
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Введите год"
                            value={filterValue?.year}
                            onChangeText={handleTextFilterChange}
                            keyboardType="numeric"
                        />

                        {/* Для мобильных и планшетов */}
                        {isMobile && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.closeButton} onPress={closeMenu}>
                                    <Text style={styles.closeButtonText}>Закрыть</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                                    <Text style={styles.resetButtonText}>Сбросить фильтры</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Для десктопов - всегда отображать кнопку сброса фильтров */}
                        {!isMobile && (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                                    <Text style={styles.resetButtonText}>Сбросить фильтры</Text>
                                </TouchableOpacity>
                            </View>
                        )}
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
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        margin: 10,
    },
    selectedFiltersContainer: {
        marginBottom: 15,
    },
    selectedFiltersTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
        fontSize: 16,
        color: '#333',
    },
    selectedFilter: {
        marginBottom: 10,
    },
    selectedFilterLabel: {
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    filterTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f1f1',
        padding: 5,
        borderRadius: 5,
        marginRight: 5,
        marginBottom: 5,
    },
    removeIcon: {
        marginLeft: 5,
        color: '#ff0000',
        fontWeight: 'bold',
    },
    searchInput: {
        color: '#333',
    },
    multiSelectList: {
        borderColor: '#ddd',
    },
    input: {
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    closeButton: {
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 5,
        flex: 1,
        marginRight: 10,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    resetButton: {
        backgroundColor: '#f44336',
        padding: 12,
        borderRadius: 5,
        flex: 1,
    },
    resetButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default FiltersComponent;