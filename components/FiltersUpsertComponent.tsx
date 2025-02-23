import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import MultiSelect from 'react-native-multiple-select';
import { Button } from 'react-native-paper';

import CheckboxComponent from '@/components/CheckboxComponent';
import ImageUploadComponent from '@/components/ImageUploadComponent';
import { TravelFormData, TravelFilters, Travel } from '@/src/types/types';

interface FiltersComponentProps {
    filters: TravelFilters | null;
    formData: TravelFormData | null;
    setFormData: (data: TravelFormData) => void;
    travelDataOld?: Travel | null;
    onClose?: () => void;
}

const FiltersUpsertComponent: React.FC<FiltersComponentProps> = ({
                                                                     filters,
                                                                     formData,
                                                                     setFormData,
                                                                     travelDataOld,
                                                                     onClose,
                                                                 }) => {
    // Если данные формы ещё не загружены, показываем индикатор загрузки
    if (!formData) {
        return (
            <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#6AAAAA" />
                <Text>Загрузка данных формы…</Text>
            </View>
        );
    }

    // Если фильтры не загружены или пусты – тоже показываем индикатор загрузки
    if (!filters || Object.keys(filters).length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#6AAAAA" />
                <Text>Загрузка панели…</Text>
            </View>
        );
    }

    const onSelectedItemsChange =
        (field: keyof TravelFormData) => (selectedItems: string[]) => {
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

    const resetFilters = () => {
        // Сброс значений формы: оставляем id, остальные поля очищаем/сбрасываем
        setFormData({
            ...formData,
            publish: false,
            countries: [],
            categories: [],
            transports: [],
            complexity: [],
            companions: [],
            over_nights_stay: [],
            month: [],
            visa: false,
            year: '',
            number_peoples: '',
            number_days: '',
            budget: '',
        });
    };

    return (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                {onClose && (
                    <Button mode="text" onPress={onClose} color="#6AAAAA">
                        Закрыть
                    </Button>
                )}
            </View>

            <View style={styles.filtersContainer}>
                {/* Скрытое поле ID */}
                {formData.id && (
                    <TextInput
                        style={styles.hiddenInput}
                        value={formData.id}
                        editable={false}
                    />
                )}

                <CheckboxComponent
                    label="Сохранить как черновик"
                    value={formData.publish}
                    onChange={(value) => setFormData({ ...formData, publish: value })}
                />

                {formData.id && (
                    <SafeAreaView style={styles.imageUploadContainer}>
                        <ImageUploadComponent
                            collection="travelMainImage"
                            idTravel={formData.id}
                            oldImage={travelDataOld?.travel_image_thumb_small_url}
                        />
                    </SafeAreaView>
                )}

                {/* Фильтр: Страны */}
                {filters.countries?.length ? (
                    <MultiSelect
                        hideTags
                        items={filters.countries}
                        uniqueKey="country_id"
                        onSelectedItemsChange={onSelectedItemsChange('countries')}
                        selectedItems={formData.countries}
                        selectText="Страны для путешествия"
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
                        styleMainWrapper={styles.multiSelectWrapper}
                    />
                ) : null}

                {/* Фильтр: Категории */}
                {filters.categories?.length ? (
                    <MultiSelect
                        hideTags
                        items={filters.categories}
                        uniqueKey="id"
                        onSelectedItemsChange={onSelectedItemsChange('categories')}
                        selectedItems={formData.categories}
                        selectText="Категории путешествий"
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
                        styleMainWrapper={styles.multiSelectWrapper}
                    />
                ) : null}

                {/* Фильтр: Транспорт */}
                {filters.transports?.length ? (
                    <MultiSelect
                        hideTags
                        items={filters.transports}
                        uniqueKey="id"
                        onSelectedItemsChange={onSelectedItemsChange('transports')}
                        selectedItems={formData.transports}
                        selectText="Средство передвижения"
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
                        styleMainWrapper={styles.multiSelectWrapper}
                    />
                ) : null}

                {/* Фильтр: Уровень физической подготовки */}
                {filters.complexity?.length ? (
                    <MultiSelect
                        hideTags
                        items={filters.complexity}
                        uniqueKey="id"
                        onSelectedItemsChange={onSelectedItemsChange('complexity')}
                        selectedItems={formData.complexity}
                        selectText="Уровень физической подготовки"
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
                        styleMainWrapper={styles.multiSelectWrapper}
                    />
                ) : null}

                {/* Фильтр: Компаньоны */}
                {filters.companions?.length ? (
                    <MultiSelect
                        hideTags
                        items={filters.companions}
                        uniqueKey="id"
                        onSelectedItemsChange={onSelectedItemsChange('companions')}
                        selectedItems={formData.companions}
                        selectText="Партнёры по путешествию"
                        searchInputPlaceholderText="Поиск партнёров..."
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
                        styleMainWrapper={styles.multiSelectWrapper}
                    />
                ) : null}

                {/* Фильтр: Варианты ночлега */}
                {filters.over_nights_stay?.length ? (
                    <MultiSelect
                        hideTags
                        items={filters.over_nights_stay}
                        uniqueKey="id"
                        onSelectedItemsChange={onSelectedItemsChange('over_nights_stay')}
                        selectedItems={formData.over_nights_stay}
                        selectText="Варианты размещения"
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
                        styleMainWrapper={styles.multiSelectWrapper}
                    />
                ) : null}

                {/* Фильтр: Месяцы путешествия */}
                {filters.month?.length ? (
                    <MultiSelect
                        hideTags
                        items={filters.month}
                        uniqueKey="id"
                        onSelectedItemsChange={onSelectedItemsChange('month')}
                        selectedItems={formData.month}
                        selectText="Месяцы путешествия"
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
                        styleMainWrapper={styles.multiSelectWrapper}
                    />
                ) : null}

                <CheckboxComponent
                    label="Требуется виза"
                    value={formData.visa}
                    onChange={(value) => setFormData({ ...formData, visa: value })}
                />

                {/* Дополнительные текстовые поля */}
                <View style={styles.textField}>
                    <Text style={styles.label}>Год путешествия</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Введите год путешествия"
                        value={formData.year}
                        onChangeText={(value) => handleTextFilterChange('year', value)}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.textField}>
                    <Text style={styles.label}>Количество участников</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Введите число участников"
                        value={formData.number_peoples}
                        onChangeText={(value) => handleTextFilterChange('number_peoples', value)}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.textField}>
                    <Text style={styles.label}>Длительность (дней)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Введите количество дней"
                        value={formData.number_days}
                        onChangeText={(value) => handleTextFilterChange('number_days', value)}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.textField}>
                    <Text style={styles.label}>Бюджет (руб.)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Введите бюджет"
                        value={formData.budget}
                        onChangeText={(value) => handleTextFilterChange('budget', value)}
                        keyboardType="numeric"
                    />
                </View>

            </View>
        </ScrollView>
    );
};

export default FiltersUpsertComponent;

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        padding: 10,
    },
    filtersContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        marginTop: 20,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hiddenInput: {
        display: 'none',
    },
    imageUploadContainer: {
        marginVertical: 10,
    },
    multiSelectWrapper: {
        marginVertical: 8,
    },
    input: {
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 6,
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#6AAAAA',
    },
    resetButton: {
        marginTop: 15,
        borderColor: '#ff9f5a',
    },
    resetButtonLabel: {
        color: '#ff9f5a',
        fontWeight: '600',
    },
});
