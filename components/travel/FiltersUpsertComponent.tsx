import React, { useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
    Platform,
    Linking,
} from 'react-native';
import { Button } from 'react-native-paper';

import MultiSelectField from '@/components/MultiSelectField';
import CheckboxComponent from '@/components/CheckboxComponent';
import ImageUploadComponent from '@/components/imageUpload/ImageUploadComponent';
import { TravelFormData, TravelFilters, Travel } from '@/src/types/types';

const { width } = Dimensions.get('window');
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
                                                                     onSave,
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
        // если новая запись — явно фиксируем publish=false,
        // чтобы избежать случайной публикации до модерации
        if (!formData.id && formData.publish !== false) {
            setFormData({ ...formData, publish: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            travel_image_thumb_small_url: '', // очищаем картинку
        });
    };

    const openPreview = () => {
        if (!formData.slug) return;
        const url = `/travels/${formData.slug}`;
        if (Platform.OS === 'web') {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            Linking.openURL(`https://metravel.by${url}`).catch(() => {});
        }
    };

    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            style={[styles.container, isMobile && { minHeight: '100%' }]}
            keyboardShouldPersistTaps="handled"
        >
            {onClose && isMobile && (
                <TouchableOpacity onPress={() => onClose()} style={styles.closeIcon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.closeButtonText}>✖</Text>
                </TouchableOpacity>
            )}

            <Button
                mode="contained"
                icon="content-save"
                onPress={onSave}
                style={styles.saveButton}
                accessibilityRole="button"
                accessibilityLabel="Сохранить изменения"
            >
                Сохранить сейчас
            </Button>

            {formData.slug ? (
                <Button
                    mode="outlined"
                    icon="open-in-new"
                    onPress={openPreview}
                    style={styles.floatingIconButton}
                    accessibilityRole="link"
                    accessibilityLabel="Открыть предпросмотр маршрута"
                >
                    Предпросмотр
                </Button>
            ) : null}

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
                        oldImage={
                            formData.travel_image_thumb_small_url?.length
                                ? formData.travel_image_thumb_small_url
                                : travelDataOld?.travel_image_thumb_small_url ?? null
                        }
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

            <MultiSelectField
                label="Путешествуете с..."
                items={filters.companions}
                value={formData.companions ?? []}
                onChange={(companions) => setFormData({ ...formData, companions })}
                labelField="name"
                valueField="id"
            />

            <MultiSelectField
                label="Ночлег..."
                items={filters.over_nights_stay}
                value={formData.over_nights_stay ?? []}
                onChange={(over_nights_stay) => setFormData({ ...formData, over_nights_stay })}
                labelField="name"
                valueField="id"
            />

            <MultiSelectField
                label="Месяц путешествия"
                items={filters.month}
                value={formData.month ?? []}
                onChange={(month) => setFormData({ ...formData, month })}
                labelField="name"
                valueField="id"
            />

            {renderNumericInput('Год путешествия', 'year')}
            <CheckboxComponent
                label="Требуется виза"
                value={formData.visa ?? false}
                onChange={(visa) => setFormData({ ...formData, visa })}
            />
            {renderNumericInput('Количество участников', 'number_peoples')}
            {renderNumericInput('Длительность (дней)', 'number_days')}
            {renderNumericInput('Бюджет (руб.)', 'budget')}

            <Button mode="outlined" onPress={handleResetFilters} style={styles.resetButton} accessibilityRole="button">
                Очистить
            </Button>
        </ScrollView>
    );

    // Поле, принимающее только цифры
    function renderNumericInput(label: string, field: keyof TravelFormData) {
        return (
            <View style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                    style={styles.input}
                    value={(formData[field] as any)?.toString?.() ?? ''}
                    onChangeText={(value) => {
                        // только цифры (чтобы не разъезжались типы на бэке)
                        const digits = value.replace(/[^\d]/g, '');
                        setFormData({ ...formData, [field]: digits } as TravelFormData);
                    }}
                    placeholder={`Введите ${label.toLowerCase()}`}
                    keyboardType={Platform.select({ ios: 'number-pad', android: 'numeric', default: 'numeric' })}
                    inputMode="numeric"
                />
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        flex: 1,
    },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    imageUploadWrapper: { alignItems: 'center', marginVertical: 12 },

    inputGroup: { marginBottom: 12 },
    input: { borderWidth: 1, borderColor: '#d1d1d1', padding: 8, borderRadius: 6 },
    label: { fontWeight: 'bold', marginBottom: 4 },

    resetButton: { marginTop: 16, borderColor: '#f57c00' },

    closeIcon: {
        position: 'absolute',
        top: -16,
        right: -14,
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        borderRadius: 12,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 12,
        lineHeight: 12,
    },

    saveButton: {
        backgroundColor: '#f5a623',
        borderRadius: 12,
        marginBottom: 12,
    },
    floatingIconButton: {
        minWidth: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        elevation: 3,
        marginBottom: 12,
    },
});

export default FiltersUpsertComponent;
