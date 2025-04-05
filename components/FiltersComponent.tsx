// ✅ FiltersComponent.tsx
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
import MultiSelectField from '@/components/MultiSelectField';
import { CheckBox } from 'react-native-elements';
import { useRoute } from '@react-navigation/native';

const FiltersComponent = ({
                              filters = {},
                              filterValue = {},
                              onSelectedItemsChange,
                              handleTextFilterChange,
                              handleApplyFilters,
                              resetFilters,
                              closeMenu,
                              isSuperuser,
                          }) => {
    const { width } = useWindowDimensions();
    const route = useRoute();

    const isMobile = width <= 768;
    const isTravelsByPage = route.name === 'travelsby';

    const [yearInput, setYearInput] = useState(filterValue.year || '');
    const [showModerationPending, setShowModerationPending] = useState(
        filterValue.showModerationPending || false
    );
    const [isFocused, setIsFocused] = useState(false);

    const applyFilters = () => {
        const updatedFilters = {
            ...filterValue,
            year: yearInput.trim() !== '' ? yearInput : undefined,
            showModerationPending,
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
            { field: 'countries', items: filters.countries || [], label: 'Страны' },
            { field: 'categories', items: filters.categories || [], label: 'Категории' },
            { field: 'categoryTravelAddress', items: filters.categoryTravelAddress || [], label: 'Объекты' },
            { field: 'transports', items: filters.transports || [], label: 'Транспорт' },
            { field: 'companions', items: filters.companions || [], label: 'Компаньоны' },
            { field: 'complexity', items: filters.complexity || [], label: 'Сложность' },
            { field: 'month', items: filters.month || [], label: 'Месяц' },
            { field: 'over_nights_stay', items: filters.over_nights_stay || [], label: 'Ночлег' },
        ];

        return allFilters
            .flatMap(({ field, items }) => {
                const selected = filterValue[field] || [];
                return selected.map((id) => {
                    const item = items.find((i) => i.id == id || i.country_id == id);
                    if (!item) return null;
                    return (
                        <View key={`${field}-${id}`} style={styles.chip}>
                            <Text style={styles.chipText}>{item.name || item.title_ru}</Text>
                            <TouchableOpacity
                                onPress={() =>
                                    onSelectedItemsChange(
                                        field,
                                        selected.filter((v) => v !== id)
                                    )
                                }
                            >
                                <Text style={styles.chipClose}>✖</Text>
                            </TouchableOpacity>
                        </View>
                    );
                });
            })
            .filter(Boolean);
    };

    const renderMultiSelect = (label, field, items, uniqueKey, displayKey) => (
        <MultiSelectField
            key={field}
            label={label}
            items={items}
            value={filterValue[field] || []}
            onChange={(selected) =>
                onSelectedItemsChange(field, Array.isArray(selected) ? selected : [])
            }
            labelField={displayKey}
            valueField={uniqueKey}
            renderSelectedItem={() => <></>}
        />
    );

    return (
        <View style={[styles.container, width > 1200 ? { maxWidth: 400 } : width > 768 ? { maxWidth: 360 } : {}]}>
            {isMobile && (
                <View style={styles.mobileCloseRow}>
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
                                checkedColor="#a8c2a8"
                                uncheckedColor="#a8c2a8"
                            />
                        </View>
                    </View>
                )}

                <View style={styles.chipsContainer}>{renderSelectedChips()}</View>

                <View style={styles.filtersGrid}>
                    {!isTravelsByPage && renderMultiSelect('Страны', 'countries', filters.countries || [], 'country_id', 'title_ru')}
                    {renderMultiSelect('Категории', 'categories', filters.categories || [], 'id', 'name')}
                    {renderMultiSelect('Объекты', 'categoryTravelAddress', filters.categoryTravelAddress || [], 'id', 'name')}
                    {renderMultiSelect('Транспорт', 'transports', filters.transports || [], 'id', 'name')}
                    {renderMultiSelect('Компаньоны', 'companions', filters.companions || [], 'id', 'name')}
                    {renderMultiSelect('Сложность', 'complexity', filters.complexity || [], 'id', 'name')}
                    {renderMultiSelect('Месяц', 'month', filters.month || [], 'id', 'name')}
                    {renderMultiSelect('Ночлег', 'over_nights_stay', filters.over_nights_stay || [], 'id', 'name')}

                    <View style={styles.filterBlock}>
                        <Text style={styles.filterLabel}>Год</Text>
                        <TextInput
                            style={[styles.yearInput, isFocused && { borderColor: 'gray' }]}
                            value={yearInput}
                            onChangeText={(text) => setYearInput(text.replace(/[^0-9]/g, ''))}
                            placeholder="Введите год"
                            keyboardType="numeric"
                            maxLength={4}
                            underlineColorAndroid="transparent"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, isMobile && styles.footerMobile]}>
                <TouchableOpacity
                    style={[styles.resetButton, isMobile && styles.buttonMobile]}
                    onPress={handleResetFilters}
                >
                    <Text style={styles.buttonText}>Сбросить</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.applyButton, isMobile && styles.buttonMobile]}
                    onPress={applyFilters}
                >
                    <Text style={styles.buttonText}>Применить</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default FiltersComponent;

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollArea: { flex: 1 },
    scrollContainer: { paddingHorizontal: 16, paddingBottom: 180 },
    mobileCloseRow: { alignItems: 'flex-end', padding: 12 },
    closeButton: { fontSize: 20, color: '#7D7368' },
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6aaaaa',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        cursor: 'pointer',
    },
    chipClose: { color: '#FFF', fontWeight: 'bold', cursor: 'pointer' },
    chipText: { color: '#FFF', marginRight: 6 },
    filtersGrid: { gap: 20 },
    filterBlock: { width: '100%' },
    filterLabel: { fontWeight: '600', fontSize: 13, color: '#5A5149', marginBottom: 6 },
    yearInput: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        outlineStyle: 'none',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#F2F1EF',
        borderTopWidth: 1,
        borderTopColor: '#DAD7D2',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 8,
    },
    footerMobile: { position: 'absolute', bottom: 60, left: 0, right: 0 },
    resetButton: {
        flex: 1,
        backgroundColor: '#DAD7D2',
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 8,
        marginRight: 8,
    },
    applyButton: {
        flex: 1,
        backgroundColor: '#6aaaaa',
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 8,
    },
    buttonMobile: { paddingVertical: 10 },
    buttonText: { color: '#FFF', fontWeight: '600' },
    checkboxContainer: { backgroundColor: 'transparent', borderWidth: 0, padding: 0 },
    checkboxText: { fontSize: 14, color: '#5A5149', fontWeight: '500' },
});
