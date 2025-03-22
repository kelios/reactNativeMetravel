import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import MultiSelectField from '../MultiSelectField';
import { Button } from 'react-native-elements';

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
    // Подсчёт количества точек по каждой категории
    const travelCategoriesCount = {};

    if (travelsData && travelsData.data) {
        travelsData.data.forEach(travel => {
            // Предполагаем, что travel.categoryName содержит название категории, совпадающее с cat.name
            const catName = travel.categoryName?.trim();
            if (catName) {
                travelCategoriesCount[catName] = (travelCategoriesCount[catName] || 0) + 1;
            }
        });
    }

    // 1. Фильтруем список категорий, оставляя только те, что встречаются в данных путешествий
    //    Сравнение идёт по cat.name → travelCategoriesCount[cat.name]
    const availableCategories = filters.categories.filter(
        cat => travelCategoriesCount[cat.name]
    );

    // 2. Добавляем в название каждой категории количество найденных объектов
    const categoriesWithCount = availableCategories.map(cat => ({
        ...cat,
        // Например: "Аптека (3)"
        name: `${cat.name} (${travelCategoriesCount[cat.name]})`,
    }));

    return (
        <View style={styles.filters}>
            <Text style={styles.filtersHeader}>Фильтры</Text>

            {/* Фильтр категорий */}
            <MultiSelectField
                label="Категория объекта"
                items={categoriesWithCount}
                value={filterValue.categories}
                onChange={value => onFilterChange('categories', value)}
                labelField="name"
                valueField="id"
            />

            {/* Радиус (одновыбор) */}
            <MultiSelectField
                label="Искать в радиусе (км)"
                items={filters.radius}
                value={filterValue.radius}
                onChange={value => onFilterChange('radius', value)}
                labelField="name"
                valueField="id"
                single={true}
            />

            {/* Поле ввода адреса */}
            <TextInput
                style={styles.input}
                placeholder="Адрес места"
                value={filterValue.address}
                onChangeText={onTextFilterChange}
                keyboardType="default"
            />

            <Button
                title="Очистить фильтры"
                onPress={resetFilters}
                containerStyle={styles.resetButtonContainer}
                buttonStyle={styles.resetButton}
                titleStyle={styles.resetButtonText}
            />

            {isMobile && (
                <TouchableOpacity style={styles.closeButton} onPress={closeMenu}>
                    <Text style={styles.closeButtonText}>Закрыть</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    filters: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 10,
    },
    filtersHeader: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'left',
    },
    input: {
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 5,
    },
    resetButtonContainer: {
        marginBottom: 10,
        marginTop: 5,
        alignSelf: 'center',
        width: '100%',
    },
    resetButton: {
        backgroundColor: '#ff9f5a',
        borderRadius: 5,
        height: 40,
    },
    resetButtonText: {
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: '#aaa',
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default FiltersPanel;
