import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
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
                                                           }) => {
    return (
        <View style={styles.filterContainer}>
            {/* Страны */}
            <MultiSelect
                hideTags
                items={filters?.countries || []}
                uniqueKey="country_id"
                onSelectedItemsChange={onSelectedItemsChange('countries')}
                selectedItems={filterValue?.countries}
                isLoading={isLoadingFilters}
                selectText="Выберите страны..."
                searchInputPlaceholderText="Выберите страны..."
                styleListContainer={{ height: 200 }}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="title_ru"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="Применить"
            />

            {/* Категории */}
            <MultiSelect
                hideTags
                items={filters?.categories || []}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChange('categories')}
                selectedItems={filterValue?.categories}
                isLoading={isLoadingFilters}
                selectText="Категории..."
                searchInputPlaceholderText="Категории..."
                styleListContainer={{ height: 200 }}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="Применить"
            />

            {/* Объекты */}
            <MultiSelect
                hideTags
                items={filters?.categoryTravelAddress || []}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChange('categoryTravelAddress')}
                selectedItems={filterValue?.categoryTravelAddress}
                isLoading={isLoadingFilters}
                selectText="Объекты..."
                searchInputPlaceholderText="Объекты..."
                styleListContainer={{ height: 200 }}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="Применить"
            />

            {/* Транспорт */}
            <MultiSelect
                hideTags
                items={filters?.transports || []}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChange('transports')}
                selectedItems={filterValue?.transports}
                isLoading={isLoadingFilters}
                selectText="Транспорт..."
                searchInputPlaceholderText="Транспорт..."
                styleListContainer={{ height: 200 }}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="Применить"
            />

            {/* Уровень физической подготовки */}
            <MultiSelect
                hideTags
                items={filters?.complexity || []}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChange('complexity')}
                selectedItems={filterValue?.complexity}
                isLoading={isLoadingFilters}
                selectText="Уровень физической подготовки..."
                searchInputPlaceholderText="Уровень физической подготовки..."
                styleListContainer={{ height: 200 }}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="Применить"
            />

            {/* Варианты отдыха */}
            <MultiSelect
                hideTags
                items={filters?.companion || []}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChange('companion')}
                selectedItems={filterValue?.companion}
                isLoading={isLoadingFilters}
                selectText="Варианты отдыха с..."
                searchInputPlaceholderText="Варианты отдыха с..."
                styleListContainer={{ height: 200 }}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="Применить"
            />

            {/* Варианты ночлега */}
            <MultiSelect
                hideTags
                items={filters?.overNightStay || []}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChange('overNightStay')}
                selectedItems={filterValue?.overNightStay}
                isLoading={isLoadingFilters}
                selectText="Варианты ночлега..."
                searchInputPlaceholderText="Варианты ночлега..."
                styleListContainer={{ height: 200 }}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="Применить"
            />

            {/* Месяц */}
            <MultiSelect
                hideTags
                items={filters?.month || []}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChange('month')}
                selectedItems={filterValue?.month}
                isLoading={isLoadingFilters}
                selectText="Месяц..."
                searchInputPlaceholderText="Месяц..."
                styleListContainer={{ height: 200 }}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="Применить"
            />

            {/* Год */}
            <TextInput
                style={styles.input}
                placeholder="Год"
                value={filterValue?.year}
                onChangeText={handleTextFilterChange}
                keyboardType="numeric"
            />

            {/* Кнопка Применить */}
            <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}
            >
                <Text style={styles.applyButtonText}>Поиск</Text>
            </TouchableOpacity>

            {/* Кнопка Закрыть для мобильных устройств */}
            {isMobile && (
                <TouchableOpacity style={styles.closeButton} onPress={closeMenu}>
                    <Text style={styles.closeButtonText}>Закрыть</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    filterContainer: {
        backgroundColor: 'white',
        padding: 20,
    },
    input: {
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        backgroundColor: 'white',
    },
    applyButton: {
        backgroundColor: '#6aaaaa',
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
    },
    applyButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: 'gray',
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

export default FiltersComponent;
