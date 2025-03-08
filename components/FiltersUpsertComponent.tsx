import React, { useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Button } from 'react-native-paper';

import MultiSelectField from '@/components/MultiSelectField';
import CheckboxComponent from '@/components/CheckboxComponent';
import ImageUploadComponent from '@/components/ImageUploadComponent';
import { TravelFormData, TravelFilters, Travel } from '@/src/types/types';

const { width, height } = Dimensions.get('window');
const isMobile = width <= 768;

interface FiltersComponentProps {
    filters: TravelFilters | null;
    formData: TravelFormData | null;
    setFormData: (data: TravelFormData) => void;
    travelDataOld?: Travel | null;
    onClose?: () => void;
    isSuperAdmin?: boolean;
    onSave: () => void;
}

const FiltersUpsertComponent: React.FC<FiltersComponentProps> = ({
                                                                     filters,
                                                                     formData,
                                                                     setFormData,
                                                                     travelDataOld,
                                                                     onClose,
                                                                     isSuperAdmin = false,
                                                                     onSave
                                                                 }) => {
    if (!formData || !filters) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6AAAAA" />
                <Text>Загрузка фильтров...</Text>
            </View>
        );
    }

    useEffect(() => {
        if (!formData.id && formData.publish === false) {
            setFormData({ ...formData, publish: false });
        }
    }, [formData.id]);

    const handleResetFilters = () => {
        setFormData({
            ...formData,
            publish: false,
            moderation: false,
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
        <ScrollView contentContainerStyle={styles.container}>
            <Button
                mode="contained"
                icon="content-save"
                onPress={onSave}
                style={styles.saveButton}
            >
                Сохранить сейчас
            </Button>

            {formData.slug && (
                <Button
                    mode="outlined"
                    icon="open-in-new"
                    onPress={() => window.open(`/travels/${formData.slug}`, '_blank')}
                    style={styles.floatingIconButton}
                    >
                    Предпросмотр
                </Button>
            )}

            {onClose && (
                <Button onPress={onClose} style={styles.closeButton}>
                    Закрыть
                </Button>
            )}

            <CheckboxComponent
                label="Сохранить как черновик"
                value={!formData.publish}
                onChange={(value) => setFormData({ ...formData, publish: !value })}
            />

            {isSuperAdmin && (
                <CheckboxComponent
                    label="Прошел модерацию"
                    value={formData.moderation ?? false}
                    onChange={(value) => setFormData({ ...formData, moderation: value })}
                />
            )}

            {formData.id && (
                <View style={styles.imageUploadWrapper}>
                    <ImageUploadComponent
                        collection="travelMainImage"
                        idTravel={formData.id}
                        oldImage={travelDataOld?.travel_image_thumb_small_url}
                    />
                </View>
            )}

            <MultiSelectField
                label="Страны для путешествия"
                items={filters.countries}
                value={formData.countries ?? []}
                onChange={(countries) => setFormData({ ...formData, countries })}
                labelField="title_ru"
                valueField="country_id"
            />

            <MultiSelectField
                label="Категории путешествий"
                items={filters.categories}
                value={formData.categories ?? []}
                onChange={(categories) => setFormData({ ...formData, categories })}
                labelField="name"
                valueField="id"
            />

            <MultiSelectField
                label="Средства передвижения"
                items={filters.transports}
                value={formData.transports ?? []}
                onChange={(transports) => setFormData({ ...formData, transports })}
                labelField="name"
                valueField="id"
            />

            <MultiSelectField
                label="Физическая подготовка"
                items={filters.complexity}
                value={formData.complexity ?? []}
                onChange={(complexity) => setFormData({ ...formData, complexity })}
                labelField="name"
                valueField="id"
            />

            <CheckboxComponent
                label="Требуется виза"
                value={formData.visa ?? false}
                onChange={(visa) => setFormData({ ...formData, visa })}
            />

            {renderInput('Год путешествия', 'year')}
            {renderInput('Количество участников', 'number_peoples')}
            {renderInput('Длительность (дней)', 'number_days')}
            {renderInput('Бюджет (руб.)', 'budget')}

            <Button mode="outlined" onPress={handleResetFilters} style={styles.resetButton}>
                Сбросить фильтры
            </Button>
        </ScrollView>
    );

    function renderInput(label: string, field: keyof TravelFormData) {
        return (
            <View style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                    style={styles.input}
                    value={formData[field]?.toString() ?? ''}
                    onChangeText={(value) => setFormData({ ...formData, [field]: value })}
                    placeholder={`Введите ${label.toLowerCase()}`}
                    keyboardType="numeric"
                />
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: '#fff' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    imageUploadWrapper: { alignItems: 'center', marginVertical: 12 },
    inputGroup: { marginBottom: 12 },
    input: { borderWidth: 1, borderColor: '#d1d1d1', padding: 8, borderRadius: 6 },
    label: { fontWeight: 'bold', marginBottom: 4 },
    resetButton: { marginTop: 16, borderColor: '#f57c00' },
    closeButton: { alignSelf: 'flex-end', marginBottom: 12 },
    saveButton: {
        backgroundColor: '#f5a623',
        borderRadius: 12,
        marginBottom: 12,
    },
    floatingIconButton: {
        minWidth: 40, // Уменьшаем размер кнопки
        borderRadius: 20, // Делаем кнопку круглой
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        elevation: 3,
        marginBottom: 12,
    },
});

export default FiltersUpsertComponent;