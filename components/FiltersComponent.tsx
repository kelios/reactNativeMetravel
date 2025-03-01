import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useWindowDimensions
} from 'react-native';
import MultiSelect from 'react-native-multiple-select';

const FiltersComponent = ({
                              filters,
                              filterValue,
                              isLoadingFilters,
                              onSelectedItemsChange,
                              handleTextFilterChange,
                              handleApplyFilters,
                              resetFilters,
                              closeMenu,
                              isMobile,
                          }) => {
    const { width } = useWindowDimensions();
    const [yearInput, setYearInput] = useState(filterValue.year || '');

    const isDesktop = width > 768;

    const applyFilters = () => {
        handleApplyFilters(yearInput);
        if (isMobile) closeMenu();
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
                tagRemoveIconColor="#6AAAAA"
                tagBorderColor="#6AAAAA"
                tagTextColor="#333"
                selectedItemTextColor="#6AAAAA"
                selectedItemIconColor="#6AAAAA"
                itemTextColor="#000"
                submitButtonColor="#6AAAAA"
                submitButtonText="ОК"
                styleDropdownMenuSubsection={styles.multiSelectInput}
            />
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.filtersContainer}>
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
                        onChangeText={(text) => {
                            setYearInput(text);
                            handleTextFilterChange(text);
                        }}
                        placeholder="Введите год"
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.buttonsRow}>
                    <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetFilters}>
                        <Text style={styles.buttonText}>Сбросить</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.applyButton]} onPress={applyFilters}>
                        <Text style={styles.buttonText}>Применить</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: { padding: 10 },
    filtersContainer: { backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
    filterBlock: { marginBottom: 8 },
    filterLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 4, color: '#333' },
    multiSelectInput: { minHeight: 40, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 5, paddingHorizontal: 10 },
    yearInput: { height: 40, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 10, borderRadius: 5, backgroundColor: '#f9f9f9' },
    buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    button: { flex: 1, paddingVertical: 10, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
    resetButton: { backgroundColor: '#ccc', marginRight: 5 },
    applyButton: { backgroundColor: '#6AAAAA', marginLeft: 5 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default FiltersComponent;
