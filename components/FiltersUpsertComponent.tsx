import React from 'react';
import { View, StyleSheet, TextInput, SafeAreaView, Text } from 'react-native';
import MultiSelect from 'react-native-multiple-select';
import CheckboxComponent from '@/components/CheckboxComponent';
import ImageUploadComponent from '@/components/ImageUploadComponent';
import { TravelFormData, TravelFilters, Travel } from '@/src/types/types';

interface FiltersComponentProps {
    filters: TravelFilters;
    formData: TravelFormData;
    setFormData: (data: TravelFormData) => void;
    travelDataOld?: Travel | null;
}

const FiltersUpsertComponent: React.FC<FiltersComponentProps> = ({
                                                                     filters,
                                                                     formData,
                                                                     setFormData,
                                                                     travelDataOld
                                                                 }) => {
    const onSelectedItemsChange = (field: keyof TravelFormData) => (selectedItems: string[]) => {
        setFormData({
            ...formData,
            [field]: selectedItems,
        });
    };

    const handleTextFilterChange = (key: keyof TravelFormData, value: string) => {
        setFormData({
            ...formData,
            [key]: value,
        });
    };

    return (
        <View style={styles.filtersContainer}>
            {formData.id && (
                <TextInput
                    style={styles.hiddenInput}
                    value={formData.id}
                    editable={false}
                />
            )}

            <CheckboxComponent
                label="Черновик"
                value={formData?.publish}
                onChange={(value) => setFormData({ ...formData, publish: value })}
            />

            {formData.id && (
                <SafeAreaView style={styles.imageUploadContainer}>
                    <ImageUploadComponent
                        collection="travelMainImage"
                        idTravel={formData.id}
                        oldImage={travelDataOld?.travel_image_thumb_small_url} // проверка на старое изображение
                    />
                </SafeAreaView>
            )}

            {/* Фильтр: Страны */}
            <MultiSelect
                hideTags
                items={filters.countries}
                uniqueKey="country_id"
                onSelectedItemsChange={onSelectedItemsChange('countries')}
                selectedItems={formData.countries}
                selectText="Выберите страны..."
                searchInputPlaceholderText="Поиск стран..."
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="title_ru"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="OK"
            />

            {/* Фильтр: Категории */}
            <MultiSelect
                hideTags
                items={filters.categories}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChange('categories')}
                selectedItems={formData.categories}
                selectText="Категории..."
                searchInputPlaceholderText="Поиск категорий..."
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="OK"
            />

            {/* Фильтр: Транспорт */}
            <MultiSelect
                hideTags
                items={filters.transports}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChange('transports')}
                selectedItems={formData.transports}
                selectText="Транспорт..."
                searchInputPlaceholderText="Поиск транспорта..."
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="OK"
            />

            {/* Фильтр: Уровень физической подготовки */}
            <MultiSelect
                hideTags
                items={filters.complexity}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChange('complexity')}
                selectedItems={formData.complexity}
                selectText="Уровень подготовки..."
                searchInputPlaceholderText="Поиск уровня подготовки..."
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="OK"
            />

            {/* Фильтр: Компаньоны */}
            <MultiSelect
                hideTags
                items={filters.companions}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChange('companions')}
                selectedItems={formData.companions}
                selectText="Компаньоны..."
                searchInputPlaceholderText="Поиск компаньонов..."
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="OK"
            />

            {/* Фильтр: Варианты ночлега */}
            <MultiSelect
                hideTags
                items={filters.over_nights_stay}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChange('over_nights_stay')}
                selectedItems={formData.over_nights_stay}
                selectText="Ночлег..."
                searchInputPlaceholderText="Поиск вариантов ночлега..."
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="OK"
            />

            {/* Фильтр: Месяцы */}
            <MultiSelect
                hideTags
                items={filters.month}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChange('month')}
                selectedItems={formData.month}
                selectText="Месяцы..."
                searchInputPlaceholderText="Поиск месяцев..."
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="OK"
            />

            {/* Виза */}
            <CheckboxComponent
                label="Нужна виза"
                value={formData?.visa}
                onChange={(value) => setFormData({ ...formData, visa: value })}
            />

            {/* Дополнительные поля с метками */}
            <View style={styles.textField}>
                <Text style={styles.label}>Год</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Введите год"
                    value={formData?.year}
                    onChangeText={(value) => handleTextFilterChange('year', value)}
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.textField}>
                <Text style={styles.label}>Количество человек</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Введите количество человек"
                    value={formData?.number_peoples}
                    onChangeText={(value) => handleTextFilterChange('number_peoples', value)}
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.textField}>
                <Text style={styles.label}>Количество дней</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Введите количество дней"
                    value={formData?.number_days}
                    onChangeText={(value) => handleTextFilterChange('number_days', value)}
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.textField}>
                <Text style={styles.label}>Бюджет</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Введите бюджет"
                    value={formData?.budget}
                    onChangeText={(value) => handleTextFilterChange('budget', value)}
                    keyboardType="numeric"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    filtersContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        marginTop: 20,
    },
    hiddenInput: {
        display: 'none',
    },
    imageUploadContainer: {
        marginVertical: 10,
    },
    input: {
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        backgroundColor: 'white',
    },
    label: {
        marginBottom: 5,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    textField: {
        marginBottom: 15,
    },
});

export default FiltersUpsertComponent;
