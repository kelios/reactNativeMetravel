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
import { MultiSelect } from 'react-native-element-dropdown';
import { CheckBox } from 'react-native-elements';

const FiltersComponent = ({
                              filters,
                              filterValue,
                              onSelectedItemsChange,
                              handleTextFilterChange,
                              handleApplyFilters,
                              resetFilters,
                              closeMenu,
                              isSuperuser,
                          }) => {
    const { width } = useWindowDimensions();
    const isMobile = width <= 768;

    const [yearInput, setYearInput] = useState(filterValue.year || '');
    const [showModerationPending, setShowModerationPending] = useState(false);

    const applyFilters = () => {
        const updatedFilters = {
            ...filterValue,
            year: yearInput,
            showModerationPending: showModerationPending ?? false,
        };

        if (showModerationPending) {
            updatedFilters.publish = 1;
            updatedFilters.moderation = 0;
        } else {
            delete updatedFilters.publish;
            delete updatedFilters.moderation;
        }

        handleApplyFilters(updatedFilters);
        if (isMobile) closeMenu();
    };

    const handleResetFilters = () => {
        setYearInput('');
        setShowModerationPending(false);
        resetFilters();
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
                            <Text style={styles.chipClose}>✖</Text>
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
                data={items}
                labelField={displayKey}
                valueField={uniqueKey}
                placeholder={`Выбрать ${label.toLowerCase()}...`}
                search
                searchPlaceholder={`Поиск ${label.toLowerCase()}...`}
                value={filterValue[field] || []}
                onChange={(selected) => onSelectedItemsChange(field, selected)}
                style={styles.dropdown}
                selectedStyle={styles.selectedStyle}
                itemTextStyle={styles.itemText}
                selectedTextStyle={styles.selectedText}
                containerStyle={styles.dropdownContainer}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            {isMobile && (
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Фильтры</Text>
                    <TouchableOpacity onPress={closeMenu}>
                        <Text style={styles.closeButton}>✖</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContainer}>
                {isSuperuser && (
                    <View style={styles.filterBlock}>
                        <View style={styles.checkboxContainer}>
                            <CheckBox
                                title="Показать статьи, ожидающие модерации"
                                checked={showModerationPending}
                                onPress={() => setShowModerationPending(!showModerationPending)}
                                containerStyle={styles.checkboxContainer}
                                textStyle={styles.checkboxText}
                                checkedColor="#a8c2a8" // Приглушенный зеленый
                                uncheckedColor="#a8c2a8" // Приглушенный зеленый
                            />
                        </View>
                    </View>
                )}

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
                <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
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
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: { fontWeight: 'bold', fontSize: 20, color: '#333' },
    closeButton: { fontSize: 20, color: '#666' },
    scrollArea: { flex: 1 },
    scrollContainer: { paddingHorizontal: 16, paddingBottom: 16 },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d4c8b8', // Приглушенный бежевый
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    chipText: {
        color: '#333',
        marginRight: 6,
    },
    chipClose: {
        color: '#333',
        fontWeight: 'bold',
    },
    filtersGrid: {
        gap: 16,
    },
    filterBlock: {
        width: '100%',
    },
    filterLabel: {
        fontWeight: '600',
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
    },
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    dropdownContainer: {
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    selectedStyle: {
        borderRadius: 8,
        backgroundColor: '#a8c2a8', // Приглушенный зеленый
    },
    itemText: {
        color: '#333',
    },
    selectedText: {
        color: '#333',
    },
    yearInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    footerMobile: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    resetButton: {
        flex: 1,
        backgroundColor: '#e0e0e0', // Серый
        padding: 12,
        alignItems: 'center',
        borderRadius: 8,
        marginRight: 8,
    },
    applyButton: {
        flex: 1,
        backgroundColor: '#d4c8b8', // Приглушенный бежевый
        padding: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    buttonText: {
        color: '#333',
        fontWeight: '600',
    },
    checkboxContainer: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
    },
    checkboxText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
});

export default FiltersComponent;