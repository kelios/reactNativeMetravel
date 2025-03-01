import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useWindowDimensions,
} from 'react-native';
import MultiSelect from 'react-native-multiple-select';

const FiltersComponent = ({
                              filters,
                              filterValue,
                              onSelectedItemsChange,
                              handleTextFilterChange,
                              handleApplyFilters,
                              resetFilters,
                              closeMenu,
                          }) => {
    const { width } = useWindowDimensions();
    const isMobile = width <= 768;

    const [yearInput, setYearInput] = useState(filterValue.year || '');

    const applyFilters = () => {
        handleApplyFilters(yearInput);
        if (isMobile) closeMenu();
    };

    const renderSelectedChips = () => {
        const allFilters = [
            { field: 'countries', items: filters.countries, label: 'Страны' },
            { field: 'categories', items: filters.categories, label: 'Категории' },
            { field: 'categoryTravelAddress', items: filters.categoryTravelAddress, label: 'Объекты' },
            { field: 'transports', items: filters.transports, label: 'Транспорт' },
            { field: 'companions', items: filters.companions, label: 'Компаньоны' },
            { field: 'complexity', items: filters.complexity, label: 'Сложность' },
            { field: 'month', items: filters.month, label: 'Месяц' },
            { field: 'over_nights_stay', items: filters.over_nights_stay, label: 'Ночлег' },
        ];

        return allFilters.flatMap(({ field, items }) => {
            const selected = filterValue[field] || [];
            return selected.map(id => {
                const item = items.find(i => i.id == id || i.country_id == id);
                if (!item) return null;
                return (
                    <View key={`${field}-${id}`} style={styles.chip}>
                        <Text style={styles.chipText}>{item.name || item.title_ru}</Text>
                        <TouchableOpacity onPress={() => onSelectedItemsChange(field, selected.filter(v => v !== id))}>
                            <Text style={styles.chipClose}>✖️</Text>
                        </TouchableOpacity>
                    </View>
                );
            });
        });
    };

    const renderMultiSelect = (label, field, items, uniqueKey, displayKey) => (
        <View style={styles.filterBlock} key={field}>
            <Text style={styles.filterLabel}>{label}</Text>
            <MultiSelect
                items={items}
                uniqueKey={uniqueKey}
                displayKey={displayKey}
                onSelectedItemsChange={(selected) => onSelectedItemsChange(field, selected)}
                selectedItems={filterValue[field] || []}
                selectText={`Выбрать ${label.toLowerCase()}...`}
                searchInputPlaceholderText={`Поиск ${label.toLowerCase()}...`}
                hideTags
                hideSubmitButton
                styleDropdownMenuSubsection={styles.multiSelectInput}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            {isMobile && (
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Фильтры</Text>
                    <TouchableOpacity onPress={closeMenu}>
                        <Text style={styles.closeButton}>Закрыть ✖️</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContainer}>
                {/* Блок чипсов — выбранных фильтров */}
                <View style={styles.chipsContainer}>
                    {renderSelectedChips()}
                </View>

                {/* Сетка фильтров */}
                <View style={styles.filtersGrid}>
                    {renderMultiSelect('Страны', 'countries', filters.countries, 'country_id', 'title_ru')}
                    {renderMultiSelect('Категории', 'categories', filters.categories, 'id', 'name')}
                    {renderMultiSelect('Объекты', 'categoryTravelAddress', filters.categoryTravelAddress, 'id', 'name')}
                    {renderMultiSelect('Транспорт', 'transports', filters.transports, 'id', 'name')}
                    {renderMultiSelect('Компаньоны', 'companions', filters.companions, 'id', 'name')}
                    {renderMultiSelect('Сложность', 'complexity', filters.complexity, 'id', 'name')}
                    {renderMultiSelect('Месяц', 'month', filters.month, 'id', 'name')}
                    {renderMultiSelect('Ночлег', 'over_nights_stay', filters.over_nights_stay, 'id', 'name')}

                    <View style={styles.filterBlock}>
                        <Text style={styles.filterLabel}>Год</Text>
                        <TextInput
                            style={styles.yearInput}
                            value={yearInput}
                            onChangeText={setYearInput}
                            placeholder="Введите год"
                            keyboardType="numeric"
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, isMobile && styles.footerMobile]}>
                <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                    <Text style={styles.buttonText}>Сбросить</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                    <Text style={styles.buttonText}>Применить</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#f8f8f8' },
    headerTitle: { fontWeight: 'bold', fontSize: 18 },
    closeButton: { color: 'tomato', fontWeight: 'bold' },
    scrollArea: { flex: 1 },
    scrollContainer: { paddingHorizontal: 12, paddingBottom: 12 },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E7F3FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
    },
    chipText: {
        marginRight: 6,
    },
    chipClose: {
        color: 'tomato',
        fontWeight: 'bold',
    },
    filtersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    filterBlock: {
        width: '100%',
        maxWidth: 360,
    },
    filterLabel: {
        fontWeight: 'bold',
        marginBottom: 6,
    },
    multiSelectInput: {
        backgroundColor: '#f9f9f9',
        paddingLeft:10
    },
    yearInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#fff',
    },
    footerMobile: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    resetButton: {
        flex: 1,
        backgroundColor: '#ccc',
        padding: 12,
        alignItems: 'center',
        marginRight: 6,
        borderRadius: 6,
    },
    applyButton: {
        flex: 1,
        backgroundColor: '#6aaaaa',
        padding: 12,
        alignItems: 'center',
        borderRadius: 6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default FiltersComponent;
