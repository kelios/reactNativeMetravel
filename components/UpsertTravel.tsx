import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Dimensions, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { fetchFilters, fetchFiltersCountry, fetchTravel, saveFormData } from "@/src/api/travels";
import { TravelFormData, MarkerData, Travel } from "@/src/types/types";
import { useLocalSearchParams } from "expo-router";
import FiltersUpsertComponent from '@/components/FiltersUpsertComponent';
import ContentUpsertSection from '@/components/ContentUpsertSection';
import GallerySection from '@/components/GallerySection';

export default function UpsertTravel() {
    const windowWidth = Dimensions.get('window').width;
    const styles = getStyles(windowWidth);
    const isMobile = windowWidth <= 768;
    const [menuVisible, setMenuVisible] = useState(!isMobile);
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null); // Для хранения таймера автосохранения

    const { id } = useLocalSearchParams();
    const travelId = id || null;
    const [travelDataOld, setTravelDataOld] = useState<Travel | null>(null);

    const [filters, setFilters] = useState({
        countries: [],
        categories: [],
        companion: [],
        complexity: [],
        month: [],
        overNightStay: [],
        transports: [],
        categoryTravelAddress: [],  // Добавлено для категорий маркеров
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
        youtubeLink: '',
    });

    // Загружаем фильтры и данные путешествия
    useEffect(() => {
        getFilters();
        getFiltersCountry();
        if (travelId) {
            loadTravelData(travelId);
        }
    }, [travelId]);

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
                youtubeLink: travelData.youtubeLink || [],
            });

            // Устанавливаем маркеры и обновляем страны, если они пришли из маркеров
            setMarkers(travelData.coordsMeTravel || []);
            updateCountriesFromMarkers(travelData.coordsMeTravel || []);
        } catch (error) {
            console.error('Ошибка при загрузке данных путешествия:', error);
        }
    };

    // Автосохранение
    useEffect(() => {
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout); // Очищаем таймер перед установкой нового
        }

        // Устанавливаем новый таймер автосохранения
        const timeout = setTimeout(() => {
            handleAutoSave();
        }, 5000); // 5 секунд после изменения

        setAutoSaveTimeout(timeout);

        return () => {
            clearTimeout(timeout); // Очищаем таймер при демонтировании
        };
    }, [formData]); // Автосохранение срабатывает при каждом изменении `formData`

    const handleAutoSave = async () => {
        try {
            setIsSaving(true);
            const savedData = await saveFormDataWithId(formData);
            if (!formData.id && savedData.id) {
                setFormData((prevData) => ({ ...prevData, id: savedData.id }));
            }
            setMarkers(savedData.coordsMeTravel || []);
            console.log('Автосохранение прошло успешно!');
        } catch (error) {
            console.error('Ошибка при автосохранении:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const saveFormDataWithId = async (data: TravelFormData): Promise<TravelFormData> => {
        const updatedData = {...data, id: data.id || null}; // Добавляем recordId в данные

        return await saveFormData(cleanEmptyFields(updatedData));
    };

    const getFilters = useCallback(async () => {
        if (isLoadingFilters) return;
        setIsLoadingFilters(true);
        const newData = await fetchFilters();
        setFilters((prevFilters) => ({
            ...prevFilters,
            categories: newData?.categories || [],
            categoryTravelAddress: newData?.categoryTravelAddress || [],  // Категории для маркеров
            companion: newData?.companion || [],
            complexity: newData?.complexity || [],
            month: newData?.month || [],
            overNightStay: newData?.overNightStay || [],
            transports: newData?.transports || [],
        }));
        setIsLoadingFilters(false);
    }, [isLoadingFilters]);

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

    function cleanEmptyFields(obj: any): any {
        const cleanedObj: any = {};

        Object.keys(obj).forEach(key => {
            const value = obj[key];

            // Проверяем, является ли значение массивом
            if (Array.isArray(value)) {
                cleanedObj[key] = value;
            } else if (value === '') {
                // Заменяем пустые строки на null
                cleanedObj[key] = null;
            } else if (typeof value === 'object' && value !== null) {
                // Рекурсивно очищаем вложенные объекты
                cleanedObj[key] = cleanEmptyFields(value);
            } else {
                cleanedObj[key] = value;
            }
        });

        return cleanedObj;
    }

    // Обновляем выбранные страны на основе маркеров
    const updateCountriesFromMarkers = (markers: MarkerData[]) => {
        const countriesFromMarkers = markers.map(marker => marker.country).filter(Boolean);
        const updatedCountries = [
            ...formData.countries,
            ...countriesFromMarkers.filter(countryId => !formData.countries.includes(countryId)),
        ];
        setFormData(prevFormData => ({ ...prevFormData, countries: updatedCountries }));
    };

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    const handleCountrySelect = (countryId) => {
        if (countryId) {
            setFormData(prevData => {
                // Проверяем, есть ли страна уже в списке стран
                if (!prevData.countries.includes(countryId)) {
                    return {
                        ...prevData,
                        countries: [...prevData.countries, countryId],
                    };
                }
                return prevData; // Если страна уже есть, ничего не делаем
            });
        }
    };

    const handleCountryDeselect = (countryId) => {
        setFormData(prevData => {
            return {
                ...prevData,
                countries: prevData.countries.filter(id => id !== countryId),
            };
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.formSection}>
                {isSaving && <ActivityIndicator size="small" color="#ff6347" />}
                <View style={styles.formRow}>
                    <ContentUpsertSection
                        formData={formData}
                        setFormData={setFormData}
                        markers={markers}
                        setMarkers={setMarkers}
                        filters={filters}  // Передаем фильтры в компонент
                        handleCountrySelect={handleCountrySelect}
                        handleCountryDeselect={handleCountryDeselect}
                    />
                    {!isMobile && (
                        <FiltersUpsertComponent
                            filters={filters}
                            travelDataOld={travelDataOld}
                            formData={formData}
                            setFormData={setFormData}
                        />
                    )}
                </View>
                {isMobile && (
                    <>
                        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
                            <Text style={styles.menuButtonText}>
                                {menuVisible ? 'Скрыть фильтры' : 'Показать фильтры'}
                            </Text>
                        </TouchableOpacity>
                        {menuVisible && <FiltersUpsertComponent filters={filters} formData={formData} setFormData={setFormData} />}
                    </>
                )}
                <GallerySection formData={formData} travelDataOld={travelDataOld} />
            </View>
            {isSaving && <ActivityIndicator size="small" color="#ff6347" />}
        </ScrollView>
    );
}

const getStyles = (windowWidth: number) => {
    return StyleSheet.create({
        container: {
            flexGrow: 1,
            padding: 20,
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: windowWidth > 500 ? '7%' : '20%',
        },
        formSection: {
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
        },
        formRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        menuButton: {
            backgroundColor: '#6aaaaa',
            padding: 10,
            alignItems: 'center',
            borderRadius: 5,
            marginTop: 20,
        },
        menuButtonText: {
            color: 'white',
            fontWeight: 'bold',
        },
    });
};
