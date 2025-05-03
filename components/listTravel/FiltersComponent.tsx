import React, { useState, useMemo, useCallback } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
    Keyboard,
    Platform,
} from 'react-native';
import MultiSelectField from '@/components/MultiSelectField';
import { CheckBox } from 'react-native-elements';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { debounce } from 'lodash';

const FiltersComponent = React.memo(({
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
    const insets = useSafeAreaInsets();
    const isMobile = width <= 768;
    const isTravelsByPage = route.name === 'travelsby';

    // State
    const [yearInput, setYearInput] = useState(filterValue.year || '');
    const [showModerationPending, setShowModerationPending] = useState(
        filterValue.showModerationPending || false
    );
    const [isFocused, setIsFocused] = useState(false);

    // Memoized values
    const containerStyle = useMemo(() => ({
        maxWidth: width > 1200 ? 400 : width > 768 ? 360 : undefined,
    }), [width]);

    const footerStyle = useMemo(() => ({
        paddingBottom: Math.max(insets.bottom, 20),
    }), [insets.bottom]);

    // Handlers
    const applyFilters = useCallback(() => {
        Keyboard.dismiss();

        const updatedFilters = {
            ...filterValue,
            year: yearInput.trim() || undefined,
            showModerationPending,
            ...(showModerationPending ? { publish: 1, moderation: 0 } : {}),
        };

        handleApplyFilters(updatedFilters);
        if (isMobile) closeMenu();
    }, [filterValue, yearInput, showModerationPending, isMobile]);

    const debouncedApplyFilters = useMemo(
        () => debounce(applyFilters, 300),
        [applyFilters]
    );

    const handleResetFilters = useCallback(() => {
        setYearInput('');
        setShowModerationPending(false);
        resetFilters();
        if (isMobile) closeMenu();
    }, [isMobile]);

    const handleYearChange = useCallback((text) => {
        const cleanedText = text.replace(/[^0-9]/g, '');
        setYearInput(cleanedText);
        if (cleanedText.length === 4) {
            debouncedApplyFilters();
        }
    }, [debouncedApplyFilters]);

    const renderSelectedChips = useCallback(() => {
        const filterGroups = [
            { field: 'countries', items: filters.countries || [] },
            { field: 'categories', items: filters.categories || [] },
            { field: 'categoryTravelAddress', items: filters.categoryTravelAddress || [] },
            { field: 'transports', items: filters.transports || [] },
            { field: 'companions', items: filters.companions || [] },
            { field: 'complexity', items: filters.complexity || [] },
            { field: 'month', items: filters.month || [] },
            { field: 'over_nights_stay', items: filters.over_nights_stay || [] },
        ];

        return filterGroups.flatMap(({ field, items }) => {
            const selected = filterValue[field] || [];
            return selected.map((id) => {
                const item = items.find((i) => i.id == id || i.country_id == id);
                return item ? (
                    <View key={`${field}-${id}`} style={styles.chip}>
                        <Text style={styles.chipText}>{item.name || item.title_ru}</Text>
                        <TouchableOpacity
                            onPress={() => onSelectedItemsChange(
                                field,
                                selected.filter((v) => v !== id)
                            )}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={styles.chipClose}>✖</Text>
                        </TouchableOpacity>
                    </View>
                ) : null;
            });
        }).filter(Boolean);
    }, [filters, filterValue]);

    const renderMultiSelect = useCallback((placeholder, field, items, uniqueKey, displayKey) => (
        <MultiSelectField
            key={field}
            items={items}
            value={filterValue[field] || []}
            onChange={(selected) => onSelectedItemsChange(field, Array.isArray(selected) ? selected : [])}
            labelField={displayKey}
            valueField={uniqueKey}
            placeholder={placeholder}
            searchPlaceholder={`Поиск ${placeholder.toLowerCase()}`}
            renderSelectedItem={() => <></>}
            autoFocus={false}
        />
    ), [filterValue]);

    return (
        <View style={[styles.container, containerStyle]}>
            {isMobile && (
                <View style={styles.header}>
                    <Text style={styles.title}>Фильтры</Text>
                    <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                        <Text style={styles.closeIcon}>✖</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                <View style={styles.content}>
                    {isSuperuser && (
                        <View style={styles.filterBlock}>
                            <CheckBox
                                title="Показать статьи на модерации"
                                checked={showModerationPending}
                                onPress={() => setShowModerationPending(!showModerationPending)}
                                containerStyle={styles.checkbox}
                                textStyle={styles.checkboxText}
                                checkedColor="#4a7c59"
                                uncheckedColor="#4a7c59"
                            />
                        </View>
                    )}

                    <View style={styles.chipsContainer}>
                        {renderSelectedChips()}
                    </View>

                    <View style={styles.filtersGrid}>
                        {!isTravelsByPage && renderMultiSelect(
                            'Страны...',
                            'countries',
                            filters.countries || [],
                            'country_id',
                            'title_ru'
                        )}

                        {renderMultiSelect('Категории...', 'categories', filters.categories || [], 'id', 'name')}
                        {renderMultiSelect('Объекты...', 'categoryTravelAddress', filters.categoryTravelAddress || [], 'id', 'name')}
                        {renderMultiSelect('Транспорт...', 'transports', filters.transports || [], 'id', 'name')}
                        {renderMultiSelect('Компаньоны...', 'companions', filters.companions || [], 'id', 'name')}
                        {renderMultiSelect('Сложность...', 'complexity', filters.complexity || [], 'id', 'name')}
                        {renderMultiSelect('Месяц...', 'month', filters.month || [], 'id', 'name')}
                        {renderMultiSelect('Ночлег...', 'over_nights_stay', filters.over_nights_stay || [], 'id', 'name')}

                        <View style={styles.filterBlock}>
                            <Text style={styles.inputLabel}>Год путешествия</Text>
                            <TextInput
                                style={[styles.input, isFocused && styles.inputFocused]}
                                value={yearInput}
                                onChangeText={handleYearChange}
                                placeholder="Например: 2023"
                                keyboardType="numeric"
                                maxLength={4}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onSubmitEditing={applyFilters}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, footerStyle]}>
                <TouchableOpacity
                    style={[styles.button, styles.resetButton]}
                    onPress={handleResetFilters}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonText}>Сбросить</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.applyButton]}
                    onPress={applyFilters}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonText}>Применить</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    closeButton: {
        padding: 8,
    },
    closeIcon: {
        fontSize: 20,
        color: '#666',
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4a7c59',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    chipText: {
        color: '#fff',
        fontSize: 14,
        marginRight: 6,
    },
    chipClose: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    filtersGrid: {
        gap: 16,
    },
    filterBlock: {
        marginBottom: 8,
    },
    checkbox: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 0,
    },
    checkboxText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    inputLabel: {
        fontSize: 14,
        color: '#555',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: '#333',
    },
    inputFocused: {
        borderColor: '#4a7c59',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 8,
        justifyContent: 'center',
    },
    resetButton: {
        backgroundColor: '#e0e0e0',
        marginRight: 8,
    },
    applyButton: {
        backgroundColor: '#4a7c59',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
});

export default FiltersComponent;