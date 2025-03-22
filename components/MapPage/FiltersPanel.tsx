import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
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
    // 🔍 Логируем входящие данные
    console.log('▶️ filters.categories:', filters.categories);
    console.log('▶️ travelsData:', travelsData);

    // Подсчёт количества по categoryName из travelsData
    const travelCategoriesCount = React.useMemo(() => {
        const count = {};
        if (travelsData?.length) {
            travelsData.forEach(travel => {
                const catName = travel.categoryName?.trim();
                if (catName) {
                    count[catName] = (count[catName] || 0) + 1;
                }
            });
        }
        console.log('▶️ travelCategoriesCount:', count);
        return count;
    }, [travelsData]);

    // Только те категории, которые реально есть в travelsData
    const categoriesWithCount = React.useMemo(() => {
        const filtered = filters.categories
            .filter(cat => {
                const name = cat.name?.trim();
                return travelCategoriesCount.hasOwnProperty(name);
            })
            .map(cat => {
                const name = cat.name?.trim();
                return {
                    ...cat,
                    label: `${name} (${travelCategoriesCount[name] || 0})`,
                    value: name,
                };
            });

        console.log('✅ categoriesWithCount:', filtered);
        return filtered;
    }, [filters.categories, travelCategoriesCount]);

    // 🔍 Логим значение фильтра
    console.log('📦 filterValue.categories (selected):', filterValue.categories);

    return (
        <View style={[styles.filters, isMobile ? styles.mobileFilters : styles.desktopFilters]}>
            {/* Категории */}
            <View style={styles.filterField}>
                <MultiSelectField
                    label="Категория"
                    items={categoriesWithCount}
                    value={filterValue.categories}
                    onChange={value => onFilterChange('categories', value)}
                    labelField="label"
                    valueField="value"
                    compact
                />
            </View>

            {/* Радиус */}
                <View style={styles.filterField}>
                    <RadiusSelect
                        value={filterValue.radius}
                        options={filters.radius}
                        onChange={(value) => onFilterChange('radius', value)}
                    />
                </View>

            {/* Адрес */}
            <View style={styles.filterField}>
                <TextInput
                    style={styles.input}
                    placeholder="Адрес"
                    value={filterValue.address}
                    onChangeText={onTextFilterChange}
                    accessibilityLabel="Address input"
                />
            </View>

            {/* Кнопка очистки */}
            <View style={styles.filterField}>
                <Button
                    title="Очистить"
                    onPress={resetFilters}
                    buttonStyle={styles.resetButton}
                    titleStyle={styles.resetButtonText}
                    icon={<Icon name="clear" size={16} color="white" style={styles.icon} />}
                    iconRight
                    accessibilityLabel="Clear filters"
                />
            </View>

            {/* Закрыть (моб) */}
            {isMobile && (
                <View style={styles.filterField}>
                    <TouchableOpacity style={styles.closeButton} onPress={closeMenu} accessibilityLabel="Close menu">
                        <Icon name="close" size={16} color="white" style={styles.icon} />
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
        minWidth: 120,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 5,
        fontSize: 14,
    },
    resetButton: {
        backgroundColor: '#ff9f5a',
        borderRadius: 5,
        paddingHorizontal: 10,
        height: 40,
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
    icon: {
        marginRight: 5,
    },
});

export default React.memo(FiltersPanel);