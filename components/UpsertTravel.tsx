import React, { useCallback, useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    Dimensions,
    ActivityIndicator,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Snackbar } from 'react-native-paper';

import {
    fetchFilters,
    fetchFiltersCountry,
    fetchTravel,
    saveFormData,
} from '@/src/api/travels';
import { TravelFormData, MarkerData, Travel } from '@/src/types/types';
import { useLocalSearchParams } from 'expo-router';

import FiltersUpsertComponent from '@/components/FiltersUpsertComponent';
import ContentUpsertSection from '@/components/ContentUpsertSection';
import GallerySection from '@/components/GallerySection';

export default function UpsertTravel() {
    const windowWidth = Dimensions.get('window').width;
    const isMobile = windowWidth <= 768;

    // Стили (с учётом mobile / desktop)
    const styles = getStyles(isMobile);

    // Параметры из URL
    const { id } = useLocalSearchParams();
    const travelId = id || null;

    // Локальные состояния
    const [menuVisible, setMenuVisible] = useState(!isMobile);
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(
        null
    );
    const [travelDataOld, setTravelDataOld] = useState<Travel | null>(null);
    const [filters, setFilters] = useState({
        countries: [],
        categories: [],
        companions: [],
        complexity: [],
        month: [],
        over_nights_stay: [],
        transports: [],
        categoryTravelAddress: [],
    });
    const [formData, setFormData] = useState<TravelFormData>({
        id: travelId,
        name: '',
        categories: [],
        transports: [],
        month: [],
        complexity: [],
        over_nights_stay: [],
        cities: [],
        countries: [],
        budget: '',
        year: '',
        number_peoples: '',
        number_days: '',
        minus: '',
        plus: '',
        recommendation: '',
        description: '',
        publish: false,
        visa: false,
        coordsMeTravel: [],
        thumbs200ForCollectionArr: [],
        travelImageThumbUrlArr: [],
        travelImageAddress: [],
        gallery: [],
        youtube_link: '',
        companions: [],
    });
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Загружаем фильтры и данные путешествия
    useEffect(() => {
        getFilters();
        getFiltersCountry();
        if (travelId) {
            loadTravelData(travelId);
        }
    }, [travelId]);

    // Функция загрузки данных путешествия
    const loadTravelData = async (id: string) => {
        try {
            const travelData = await fetchTravel(Number(id));
            setTravelDataOld(travelData);
            setFormData({
                id: travelData.id || '',
                name: travelData.name || '',
                categories: travelData.categories || [],
                transports: travelData.transports || [],
                month: travelData.month || [],
                complexity: travelData.complexity || [],
                over_nights_stay: travelData.over_nights_stay || [],
                cities: travelData.cities || [],
                countries: travelData.countries || [],
                budget: travelData.budget || '',
                year: travelData.year || '',
                number_peoples: travelData.number_peoples || '',
                number_days: travelData.number_days || '',
                minus: travelData.minus || null,
                plus: travelData.plus || null,
                recommendation: travelData.recommendation || '',
                description: travelData.description || null,
                publish: travelData.publish || false,
                visa: travelData.visa || false,
                coordsMeTravel: travelData?.coordsMeTravel || [],
                thumbs200ForCollectionArr: travelData.thumbs200ForCollectionArr || [],
                travelImageThumbUrlArr: travelData.travelImageThumbUrlArr || [],
                travelImageAddress: travelData.travelImageAddress || [],
                gallery: travelData.gallery || [],
                youtube_link: travelData.youtube_link || null,
                companions: travelData.companions || [],
            });
            setMarkers(travelData.coordsMeTravel || []);
            updateCountriesFromMarkers(travelData.coordsMeTravel || []);
        } catch (error) {
            console.error('Ошибка при загрузке данных путешествия:', error);
        }
    };

    // Автосохранение через 5 секунд после изменения formData
    useEffect(() => {
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }
        const timeout = setTimeout(() => {
            handleAutoSave();
        }, 5000);
        setAutoSaveTimeout(timeout);
        return () => clearTimeout(timeout);
    }, [formData]);

    // Логика автосохранения
    const handleAutoSave = async () => {
        try {
            setIsSaving(true);
            const savedData = await saveFormDataWithId(formData);
            if (!formData.id && savedData.id) {
                setFormData((prevData) => ({ ...prevData, id: savedData.id }));
            }
            setMarkers(savedData.coordsMeTravel || []);
            setSnackbarMessage('Автосохранение прошло успешно!');
            setSnackbarVisible(true);
        } catch (error) {
            console.error('Ошибка при автосохранении:', error);
            setSnackbarMessage('Ошибка автосохранения');
            setSnackbarVisible(true);
        } finally {
            setIsSaving(false);
        }
    };

    const saveFormDataWithId = async (
        data: TravelFormData
    ): Promise<TravelFormData> => {
        const updatedData = { ...data, id: data.id || null };
        return await saveFormData(cleanEmptyFields(updatedData));
    };

    // Загрузка общих фильтров
    const getFilters = useCallback(async () => {
        if (isLoadingFilters) return;
        setIsLoadingFilters(true);
        const newData = await fetchFilters();
        setFilters((prevFilters) => ({
            ...prevFilters,
            categories: newData?.categories || [],
            categoryTravelAddress: newData?.categoryTravelAddress || [],
            companions: newData?.companions || [],
            complexity: newData?.complexity || [],
            month: newData?.month || [],
            over_nights_stay: newData?.over_nights_stay || [],
            transports: newData?.transports || [],
        }));
        setIsLoadingFilters(false);
    }, [isLoadingFilters]);

    // Загрузка фильтров стран
    const getFiltersCountry = useCallback(async () => {
        if (isLoadingFilters) return;
        setIsLoadingFilters(true);
        const country = await fetchFiltersCountry();
        setFilters((prevFilters) => ({
            ...prevFilters,
            countries: country,
        }));
        setIsLoadingFilters(false);
    }, [isLoadingFilters]);

    // Очистка пустых полей
    function cleanEmptyFields(obj: any): any {
        const cleanedObj: any = {};
        Object.keys(obj).forEach((key) => {
            const value = obj[key];
            if (Array.isArray(value)) {
                cleanedObj[key] = value;
            } else if (value === '') {
                cleanedObj[key] = null;
            } else if (typeof value === 'object' && value !== null) {
                cleanedObj[key] = cleanEmptyFields(value);
            } else {
                cleanedObj[key] = value;
            }
        });
        return cleanedObj;
    }

    // Обновление стран на основе маркеров
    const updateCountriesFromMarkers = (markers: MarkerData[]) => {
        const countriesFromMarkers = markers.map((marker) => marker.country).filter(Boolean);
        const updatedCountries = [
            ...formData.countries,
            ...countriesFromMarkers.filter(
                (countryId) => !formData.countries.includes(countryId)
            ),
        ];
        setFormData((prevFormData) => ({
            ...prevFormData,
            countries: updatedCountries,
        }));
    };

    // Показ/скрытие боковой панели на мобильном
    const toggleMenu = useCallback(() => {
        setMenuVisible((prev) => !prev);
    }, []);

    // Пример: добавление страны
    const handleCountrySelect = (countryId: string) => {
        if (countryId) {
            setFormData((prevData) => {
                if (!prevData.countries.includes(countryId)) {
                    return {
                        ...prevData,
                        countries: [...prevData.countries, countryId],
                    };
                }
                return prevData;
            });
        }
    };

    // Пример: удаление страны
    const handleCountryDeselect = (countryId: string) => {
        setFormData((prevData) => ({
            ...prevData,
            countries: prevData.countries.filter((id) => id !== countryId),
        }));
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            {/* Если идёт автосохранение, показываем индикатор */}
            {isSaving && (
                <View style={styles.savingIndicator}>
                    <ActivityIndicator size="small" color="#ff6347" />
                    <Text style={styles.savingText}>Сохранение...</Text>
                </View>
            )}

            {/* Основная обёртка: две колонки на desktop, одна на mobile */}
            <View style={styles.mainWrapper}>
                {/* Левая колонка: контент (форма, карта, галерея) */}
                <View style={styles.contentColumn}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <ContentUpsertSection
                            formData={formData}
                            setFormData={setFormData}
                            markers={markers}
                            setMarkers={setMarkers}
                            filters={filters}
                            handleCountrySelect={handleCountrySelect}
                            handleCountryDeselect={handleCountryDeselect}
                        />

                        <GallerySection formData={formData} travelDataOld={travelDataOld} />
                    </ScrollView>
                </View>

                {/* Правая колонка: боковая панель (фильтры) - показываем только на desktop/tablet */}
                {!isMobile && (
                    <View style={styles.filtersColumn}>
                        <FiltersUpsertComponent
                            filters={filters}
                            travelDataOld={travelDataOld}
                            formData={formData}
                            setFormData={setFormData}
                        />
                    </View>
                )}
            </View>

            {/* На мобильном выводим кнопку + панель внизу контента */}
            {isMobile && (
                <View style={styles.mobileFiltersWrapper}>
                    <Button
                        mode="contained"
                        onPress={toggleMenu}
                        style={styles.menuButton}
                    >
                        {menuVisible ? 'Скрыть боковую панель' : 'Показать боковую панель'}
                    </Button>
                    {menuVisible && (
                        <View style={styles.mobileFilters}>
                            <FiltersUpsertComponent
                                filters={filters}
                                formData={formData}
                                setFormData={setFormData}
                                travelDataOld={travelDataOld}
                            />
                        </View>
                    )}
                </View>
            )}

            {/* Snackbar для уведомлений (автосохранение и т.п.) */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={styles.snackbar}
            >
                {snackbarMessage}
            </Snackbar>
        </SafeAreaView>
    );
}

/** Стили, адаптированные под mobile/desktop */
function getStyles(isMobile: boolean) {
    return StyleSheet.create({
        safeContainer: {
            flex: 1,
            backgroundColor: '#f9f9f9',
        },
        mainWrapper: {
            flex: 1,
            flexDirection: isMobile ? 'column' : 'row', // на desktop -> 2 колонки
        },
        contentColumn: {
            flex: 1,
            backgroundColor: '#fff',
            padding: 10,
        },
        filtersColumn: {
            width: 320, // фиксированная ширина панели
            backgroundColor: '#fff',
            borderLeftWidth: 1,
            borderColor: '#ddd',
            padding: 10,
        },
        scrollContent: {
            paddingBottom: 100,
        },
        // Мобильные фильтры (кнопка + панель)
        mobileFiltersWrapper: {
            backgroundColor: '#fff',
            padding: 10,
        },
        menuButton: {
            backgroundColor: '#6aaaaa',
        },
        mobileFilters: {
            marginTop: 10,
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 8,
        },
        // Сохранение
        savingIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
        },
        savingText: {
            marginLeft: 10,
            color: '#ff6347',
            fontSize: 14,
        },
        snackbar: {
            backgroundColor: '#323232',
        },
    });
}
