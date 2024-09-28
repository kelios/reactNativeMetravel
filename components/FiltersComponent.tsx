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
        companion: any[];
        complexity: any[];
        month: any[];
        overNightStay: any[];
        transports: any[];
    };
    filterValue: {
        countries: string[];
        categories: string[];
        categoryTravelAddress: string[];
        companion: string[];
        complexity: string[];
        month: string[];
        overNightStay: string[];
        transports: string[];
        year: string;
    };
    isLoadingFilters: boolean;
    onSelectedItemsChange: (field: string) => (selectedItems: string[]) => void;
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
    const renderSelectedFilters = () => {
        const selectedFilters = [
            { label: 'Страны', values: filterValue.countries || [] },
            { label: 'Категории', values: filterValue.categories || [] },
            { label: 'Объекты', values: filterValue.categoryTravelAddress || [] },
            { label: 'Транспорт', values: filterValue.transports || [] },
            { label: 'Уровень физической подготовки', values: filterValue.complexity || [] },
            { label: 'Варианты отдыха', values: filterValue.companion || [] },
            { label: 'Ночлег', values: filterValue.overNightStay || [] },
            { label: 'Месяц', values: filterValue.month || [] },
            { label: 'Год', values: filterValue.year ? [filterValue.year] : [] },
        ];

        return selectedFilters
            .filter(item => item.values.length > 0)
            .map((item, index) => (
                <View key={index} style={styles.selectedFilter}>
                    <Text style={styles.selectedFilterLabel}>
                        {item.label}: {item.values.join(', ')}
                    </Text>
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
                        {/* Отображение выбранных фильтров */}
                        <View style={styles.selectedFiltersContainer}>
                            <Text style={styles.selectedFiltersTitle}>Выбранные фильтры:</Text>
                            {renderSelectedFilters().length > 0 ? (
                                renderSelectedFilters()
                            ) : (
                                <Text style={styles.noSelectedFilters}>Нет выбранных фильтров</Text>
                            )}
                        </View>

                        {/* Страны */}
                        <MultiSelect
                            hideTags
                            items={filters?.countries || []}
                            uniqueKey="country_id"
                            onSelectedItemsChange={onSelectedItemsChange('countries')}
                            selectedItems={filterValue?.countries}
                            selectText="Выберите страны..."
                            searchInputPlaceholderText="Введите страну..."
                            styleListContainer={styles.multiSelectList}
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

                        {/* Категории */}
                        <MultiSelect
                            hideTags
                            items={filters?.categories || []}
                            uniqueKey="id"
                            onSelectedItemsChange={onSelectedItemsChange('categories')}
                            selectedItems={filterValue?.categories}
                            selectText="Выберите категории..."
                            searchInputPlaceholderText="Введите категорию..."
                            styleListContainer={styles.multiSelectList}
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

                        {/* Объекты */}
                        <MultiSelect
                            hideTags
                            items={filters?.categoryTravelAddress || []}
                            uniqueKey="id"
                            onSelectedItemsChange={onSelectedItemsChange('categoryTravelAddress')}
                            selectedItems={filterValue?.categoryTravelAddress}
                            selectText="Выберите объекты..."
                            searchInputPlaceholderText="Введите объект..."
                            styleListContainer={styles.multiSelectList}
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

                        {/* Транспорт */}
                        <MultiSelect
                            hideTags
                            items={filters?.transports || []}
                            uniqueKey="id"
                            onSelectedItemsChange={onSelectedItemsChange('transports')}
                            selectedItems={filterValue?.transports}
                            selectText="Выберите транспорт..."
                            searchInputPlaceholderText="Введите транспорт..."
                            styleListContainer={styles.multiSelectList}
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

                        {/* Уровень физической подготовки */}
                        <MultiSelect
                            hideTags
                            items={filters?.complexity || []}
                            uniqueKey="id"
                            onSelectedItemsChange={onSelectedItemsChange('complexity')}
                            selectedItems={filterValue?.complexity}
                            selectText="Выберите уровень физической подготовки..."
                            searchInputPlaceholderText="Введите уровень..."
                            styleListContainer={styles.multiSelectList}
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

                        {/* Варианты отдыха */}
                        <MultiSelect
                            hideTags
                            items={filters?.companion || []}
                            uniqueKey="id"
                            onSelectedItemsChange={onSelectedItemsChange('companion')}
                            selectedItems={filterValue?.companion}
                            selectText="Выберите варианты отдыха с..."
                            searchInputPlaceholderText="Введите вариант отдыха..."
                            styleListContainer={styles.multiSelectList}
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

                        {/* Варианты ночлега */}
                        <MultiSelect
                            hideTags
                            items={filters?.overNightStay || []}
                            uniqueKey="id"
                            onSelectedItemsChange={onSelectedItemsChange('overNightStay')}
                            selectedItems={filterValue?.overNightStay}
                            selectText="Выберите варианты ночлега..."
                            searchInputPlaceholderText="Введите вариант ночлега..."
                            styleListContainer={styles.multiSelectList}
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

                        {/* Месяц */}
                        <MultiSelect
                            hideTags
                            items={filters?.month || []}
                            uniqueKey="id"
                            onSelectedItemsChange={onSelectedItemsChange('month')}
                            selectedItems={filterValue?.month}
                            selectText="Выберите месяц..."
                            searchInputPlaceholderText="Введите месяц..."
                            styleListContainer={styles.multiSelectList}
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

                        {/* Год */}
                        <TextInput
                            style={styles.input}
                            placeholder="Введите год"
                            value={filterValue?.year}
                            onChangeText={handleTextFilterChange}
                            keyboardType="numeric"
                        />

                        {/* Кнопка Закрыть и Сброс фильтров */}
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
    multiSelectList: {
        height: 200,
        borderColor: '#ddd',
    },
    searchInput: {
        color: '#333',
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
    applyButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 5,
        margin: 10,
    },
    applyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
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
    noSelectedFilters: {
        fontSize: 14,
        color: '#999',
    },
    selectedFilter: {
        backgroundColor: '#f1f1f1',
        padding: 5,
        borderRadius: 5,
        marginBottom: 5,
    },
    selectedFilterLabel: {
        color: '#333',
    },
});

export default FiltersComponent;
