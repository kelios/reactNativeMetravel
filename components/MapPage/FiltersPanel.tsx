import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import MultiSelectField from '../MultiSelectField';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RadiusSelect from "@/components/MapPage/RadiusSelect";

const FiltersPanel = ({
                          filters,
                          filterValue,
                          onFilterChange,
                          onTextFilterChange,
                          resetFilters,
                          travelsData,
                          isMobile,
                          closeMenu,
                      }) => {
    const travelCategoriesCount = React.useMemo(() => {
        const count = {};
        travelsData?.forEach(travel => {
            travel.categoryName?.split(',').map(s => s.trim()).forEach(cat => {
                count[cat] = (count[cat] || 0) + 1;
            });
        });
        return count;
    }, [travelsData]);

    const categoriesWithCount = React.useMemo(() =>
            filters.categories
                .map(cat => {
                    const name = cat.name.trim();
                    return travelCategoriesCount[name]
                        ? {
                            ...cat,
                            label: `${name} (${travelCategoriesCount[name]})`,
                            value: name,
                        }
                        : null;
                })
                .filter(Boolean),
        [filters.categories, travelCategoriesCount]
    );

    return (
        <View style={[styles.filters, isMobile ? styles.mobileFilters : styles.desktopFilters]}>
            {/* Категории */}
            {!!categoriesWithCount.length && (
                <View style={styles.filterField}>
                    <MultiSelectField
                        label="Категория"
                        items={categoriesWithCount}
                        value={filterValue.categories}
                        onChange={value => onFilterChange('categories', value)}
                        labelField="label"
                        valueField="value"
                        compact
                        showsSelectedItems={false}
                    />
                    {!!filterValue.categories.length && (
                        <ScrollView horizontal style={styles.selectedCategoriesContainer}>
                            {filterValue.categories.map(catName => (
                                <View key={catName} style={styles.categoryBadge}>
                                    <Text style={styles.categoryBadgeText}>{catName}</Text>
                                    <TouchableOpacity
                                        onPress={() =>
                                            onFilterChange(
                                                'categories',
                                                filterValue.categories.filter(c => c !== catName)
                                            )
                                        }
                                    >
                                        <Icon name="close" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>
            )}

            {/* Радиус */}
            {!!filters.radius.length && (
                <View style={styles.filterField}>
                    <RadiusSelect
                        value={filterValue.radius}
                        options={filters.radius}
                        onChange={val => onFilterChange('radius', val)}
                    />
                </View>
            )}

            {/* Адрес */}
            <View style={styles.filterField}>
                <Text style={styles.label}>Адрес</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Адрес"
                    value={filterValue.address}
                    onChangeText={onTextFilterChange}
                    accessibilityLabel="Address input"
                />
            </View>

            {/* Кнопка очистки */}
            <View style={styles.resetButtonContainer}>
                <Button
                    title="Очистить"
                    onPress={resetFilters}
                    buttonStyle={styles.resetButton}
                    titleStyle={styles.resetButtonText}
                    icon={<Icon name="clear" size={16} color="white" />}
                    iconRight
                    accessibilityLabel="Clear filters"
                />
            </View>

            {/* Закрыть (мобильная версия) */}
            {isMobile && (
                <View style={styles.filterField}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeMenu}
                        accessibilityLabel="Close menu"
                    >
                        <Icon name="close" size={16} color="white" />
                        <Text style={styles.closeButtonText}>Закрыть</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    filters: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 10,
    },
    desktopFilters: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    mobileFilters: {
        flexDirection: 'column',
        gap: 10,
    },
    filterField: {
        flex: 1,
        minWidth: 200,
    },
    resetButtonContainer: {
        minWidth: 200,
        alignSelf: 'flex-end',
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#d1d1d1',
        paddingHorizontal: 12,
        backgroundColor: 'white',
        borderRadius: 6,
        fontSize: 14,
    },
    resetButton: {
        backgroundColor: '#ff9f5a',
        borderRadius: 5,
        height: 48,
        width: '100%',
    },
    resetButtonText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    closeButton: {
        backgroundColor: '#aaa',
        padding: 8,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    selectedCategoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        marginTop: 4,
        paddingVertical: 4,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6aaaaa',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 16,
        marginRight: 6,
    },
    categoryBadgeText: {
        color: '#fff',
        marginRight: 4,
        fontSize: 13,
    },
});

export default React.memo(FiltersPanel);
