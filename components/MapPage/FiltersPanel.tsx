import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
} from 'react-native';
import MultiSelectField from '../MultiSelectField';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RadiusSelect from '@/components/MapPage/RadiusSelect';

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
    const styles = getStyles(isMobile);

    const travelCategoriesCount = React.useMemo(() => {
        const count = {};
        travelsData?.forEach(travel => {
            travel.categoryName?.split(',').map(s => s.trim()).forEach(cat => {
                count[cat] = (count[cat] || 0) + 1;
            });
        });
        return count;
    }, [travelsData]);

    const categoriesWithCount = React.useMemo(
        () =>
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
        <View
            style={[
                styles.filtersContainer,
                isMobile ? styles.mobileLayout : styles.desktopLayout,
            ]}
        >
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
                        renderSelectedItem={() => <></>}
                    />
                    {!!filterValue.categories.length && (
                        <View style={styles.selectedCategoriesWrapper}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={true}
                                style={styles.selectedCategoriesScroll}
                                contentContainerStyle={styles.selectedCategories}
                            >
                                {filterValue.categories.map(catName => (
                                    <View key={catName} style={styles.categoryChip}>
                                        <Text style={styles.categoryChipText}>{catName}</Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                                onFilterChange(
                                                    'categories',
                                                    filterValue.categories.filter(c => c !== catName)
                                                )
                                            }
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Icon name="close" size={16} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
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
                    placeholder="Введите адрес"
                    value={filterValue.address}
                    onChangeText={onTextFilterChange}
                />
            </View>

            {/* Кнопки */}
            <View style={styles.actions}>
                <Button
                    title="Очистить"
                    onPress={resetFilters}
                    buttonStyle={styles.clearButton}
                    titleStyle={styles.clearButtonText}
                    icon={<Icon name="delete-outline" size={18} color="white" />}
                    iconRight
                />
                {isMobile && (
                    <TouchableOpacity onPress={closeMenu} style={styles.closeBtn}>
                        <Icon name="close" size={18} color="white" />
                        <Text style={styles.closeBtnText}>Закрыть</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const getStyles = isMobile =>
    StyleSheet.create({
        filtersContainer: {
            backgroundColor: '#fff',
            padding: 12,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
            gap: 12,
        },
        desktopLayout: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
        },
        mobileLayout: {
            flexDirection: 'column',
        },
        filterField: {
            flex: 1,
            minWidth: 200,
        },
        selectedCategoriesWrapper: {
            marginTop: 6,
            marginBottom: 50,
        },
        selectedCategoriesScroll: {
            maxWidth: '100%',
            overflow: 'scroll',
        },
        selectedCategories: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 8,
            paddingVertical: 4,
        },
        categoryChip: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#6aaaaa',
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderRadius: 20,
            marginRight: 6,
            marginBottom: 6,
        },
        categoryChipText: {
            color: 'white',
            fontSize: 13,
            marginRight: 6,
        },
        input: {
            height: 44,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            paddingHorizontal: 12,
            fontSize: 14,
            backgroundColor: '#fff',
        },
        label: {
            fontSize: 13,
            fontWeight: '600',
            marginBottom: 8,
            color: '#333',
        },
        actions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginTop: isMobile ? 0 : 22,
        },
        clearButton: {
            backgroundColor: '#ff9f5a',
            borderRadius: 8,
            paddingHorizontal: 16,
            height: 44,
        },
        clearButtonText: {
            fontSize: 14,
            fontWeight: 'bold',
            marginRight: 6,
        },
        closeBtn: {
            backgroundColor: '#999',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            height: 44,
        },
        closeBtnText: {
            color: 'white',
            fontSize: 14,
            marginLeft: 6,
        },
    });

export default React.memo(FiltersPanel);
