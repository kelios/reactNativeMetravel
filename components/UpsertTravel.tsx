import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Dimensions, ActivityIndicator, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchFilters, fetchFiltersCountry, fetchTravel, saveFormData } from "@/src/api/travels";
import { TravelFormData, MarkerData, Travel } from "@/src/types/types";
import { useLocalSearchParams } from "expo-router";
import FiltersUpsertComponent from '@/components/FiltersUpsertComponent';
import ContentUpsertSection from '@/components/ContentUpsertSection';
import GallerySection from '@/components/GallerySection';
import { Button, Snackbar } from 'react-native-paper';

export default function UpsertTravel() {
    const windowWidth = Dimensions.get('window').width;
    const isMobile = windowWidth <= 768;
    const styles = getStyles(windowWidth);
    const { id } = useLocalSearchParams();
    const travelId = id || null;

    const [menuVisible, setMenuVisible] = useState(!isMobile);
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
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
        companions: []
    });
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

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

    const handleAutoSave = async () => {
        try {
            setIsSaving(true);
            const savedData = await saveFormDataWithId(formData);
            if (!formData.id && savedData.id) {
                setFormData(prevData => ({ ...prevData, id: savedData.id }));
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

    const saveFormDataWithId = async (data: TravelFormData): Promise<TravelFormData> => {
        const updatedData = { ...data, id: data.id || null };
        return await saveFormData(cleanEmptyFields(updatedData));
    };

    const getFilters = useCallback(async () => {
        if (isLoadingFilters) return;
        setIsLoadingFilters(true);
        const newData = await fetchFilters();
        setFilters(prevFilters => ({
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

    const getFiltersCountry = useCallback(async () => {
        if (isLoadingFilters) return;
        setIsLoadingFilters(true);
        const country = await fetchFiltersCountry();
        setFilters(prevFilters => ({
            ...prevFilters,
            countries: country,
        }));
        setIsLoadingFilters(false);
    }, [isLoadingFilters]);

    function cleanEmptyFields(obj: any): any {
        const cleanedObj: any = {};
        Object.keys(obj).forEach(key => {
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
        const countriesFromMarkers = markers.map(marker => marker.country).filter(Boolean);
        const updatedCountries = [
            ...formData.countries,
            ...countriesFromMarkers.filter(countryId => !formData.countries.includes(countryId)),
        ];
        setFormData(prevFormData => ({ ...prevFormData, countries: updatedCountries }));
    };

    const toggleMenu = useCallback(() => {
        setMenuVisible(prev => !prev);
    }, []);

    const handleCountrySelect = (countryId) => {
        if (countryId) {
            setFormData(prevData => {
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

    const handleCountryDeselect = (countryId) => {
        setFormData(prevData => ({
            ...prevData,
            countries: prevData.countries.filter(id => id !== countryId),
        }));
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.formSection}>
                    {isSaving && (
                        <View style={styles.savingIndicator}>
                            <ActivityIndicator size="small" color="#ff6347" />
                            <Text style={styles.savingText}>Сохранение...</Text>
                        </View>
                    )}
                    <View style={styles.formRow}>
                        <ContentUpsertSection
                            formData={formData}
                            setFormData={setFormData}
                            markers={markers}
                            setMarkers={setMarkers}
                            filters={filters}
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
                            <Button mode="contained" onPress={toggleMenu} style={styles.menuButton}>
                                {menuVisible ? 'Скрыть фильтры' : 'Показать фильтры'}
                            </Button>
                            {menuVisible && (
                                <View style={styles.mobileFilters}>
                                    <FiltersUpsertComponent
                                        filters={filters}
                                        formData={formData}
                                        setFormData={setFormData}
                                    />
                                </View>
                            )}
                        </>
                    )}
                    <GallerySection formData={formData} travelDataOld={travelDataOld} />
                </View>
            </ScrollView>
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

const getStyles = (windowWidth: number) => {
    const isMobile = windowWidth <= 768;
    return StyleSheet.create({
        container: {
            flexGrow: 1,
            padding: 20,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f9f9f9',
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
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
        },
        menuButton: {
            marginTop: 20,
            backgroundColor: '#6aaaaa',
        },
        mobileFilters: {
            marginTop: 10,
        },
        savingIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
        },
        savingText: {
            marginLeft: 10,
            color: '#ff6347',
            fontSize: 14,
        },
        snackbar: {
            backgroundColor: '#323232',
        }
    });
};
