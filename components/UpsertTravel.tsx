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

import { useAutoSaveForm } from '@/hooks/useAutoSaveForm';

export default function UpsertTravel() {
    const windowWidth = Dimensions.get('window').width;
    const isMobile = windowWidth <= 768;

    const styles = getStyles(isMobile);

    const { id } = useLocalSearchParams();
    const travelId = id || null;

    const [menuVisible, setMenuVisible] = useState(!isMobile);
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);
    const [markers, setMarkers] = useState<MarkerData[]>([]);
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
    const [formData, setFormData] = useState<TravelFormData>(getEmptyFormData(travelId));
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const saveFormDataWithId = async (data: TravelFormData): Promise<TravelFormData> => {
        const savedData = await saveFormData(cleanEmptyFields({ ...data, id: data.id || null }));
        return savedData;
    };

    const { resetOriginalData } = useAutoSaveForm(formData, {
        debounce: 5000,
        onSave: saveFormDataWithId,
        onSuccess: () => {
            setSnackbarMessage('Автосохранение прошло успешно!');
            setSnackbarVisible(true);
        },
        onError: (error) => {
            console.error('Ошибка при автосохранении:', error);
            setSnackbarMessage('Ошибка автосохранения');
            setSnackbarVisible(true);
        },
    });

    useEffect(() => {
        getFilters();
        getFiltersCountry();
        if (travelId) {
            loadTravelData(travelId);
        }
    }, [travelId]);

    const loadTravelData = async (id: string) => {
        const travelData = await fetchTravel(Number(id));
        setTravelDataOld(travelData);

        const transformed = transformTravelToFormData(travelData);
        setFormData(transformed);
        resetOriginalData(transformed);
        setMarkers(travelData.coordsMeTravel || []);
        updateCountriesFromMarkers(travelData.coordsMeTravel || []);
    };

    const handleManualSave = async () => {
        try {
            const savedData = await saveFormDataWithId(formData);
            setFormData(savedData);
            resetOriginalData(savedData);
            setMarkers(savedData.coordsMeTravel || []);
            setSnackbarMessage('Сохранение прошло успешно!');
            setSnackbarVisible(true);
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            setSnackbarMessage('Ошибка сохранения');
            setSnackbarVisible(true);
        }
    };

    const getFilters = useCallback(async () => {
        if (isLoadingFilters) return;
        setIsLoadingFilters(true);
        const data = await fetchFilters();
        setFilters((prev) => ({ ...prev, ...data }));
        setIsLoadingFilters(false);
    }, [isLoadingFilters]);

    const getFiltersCountry = useCallback(async () => {
        if (isLoadingFilters) return;
        setIsLoadingFilters(true);
        const countries = await fetchFiltersCountry();
        setFilters((prev) => ({ ...prev, countries }));
        setIsLoadingFilters(false);
    }, [isLoadingFilters]);

    const updateCountriesFromMarkers = (markers: MarkerData[]) => {
        const countriesFromMarkers = markers.map((marker) => marker.country).filter(Boolean);
        setFormData((prev) => ({
            ...prev,
            countries: Array.from(new Set([...prev.countries, ...countriesFromMarkers])),
        }));
    };

    const toggleMenu = useCallback(() => {
        setMenuVisible((prev) => !prev);
    }, []);

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.mainWrapper}>
                <View style={styles.contentColumn}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <ContentUpsertSection
                            formData={formData}
                            setFormData={setFormData}
                            markers={markers}
                            setMarkers={setMarkers}
                            filters={filters}
                        />

                        <GallerySection formData={formData} travelDataOld={travelDataOld} />

                        <Button
                            mode="contained"
                            onPress={handleManualSave}
                            style={styles.manualSaveButton}
                        >
                            Сохранить сейчас
                        </Button>
                    </ScrollView>
                </View>

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

            {isMobile && (
                <View style={styles.mobileFiltersWrapper}>
                    <Button mode="contained" onPress={toggleMenu} style={styles.menuButton}>
                        {menuVisible ? 'Скрыть боковую панель' : 'Показать боковую панель'}
                    </Button>
                    {menuVisible && (
                        <FiltersUpsertComponent
                            filters={filters}
                            travelDataOld={travelDataOld}
                            formData={formData}
                            setFormData={setFormData}
                        />
                    )}
                </View>
            )}

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
            >
                {snackbarMessage}
            </Snackbar>
        </SafeAreaView>
    );
}

// Вспомогательные функции

function getEmptyFormData(id: string | null): TravelFormData {
    return {
        id: id || null,
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
    };
}

function transformTravelToFormData(travel: Travel): TravelFormData {
    return {
        ...getEmptyFormData(travel.id),
        ...travel,
    };
}

function cleanEmptyFields(obj: any): any {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [
        key, value === '' ? null : value
    ]));
}

function getStyles(isMobile: boolean) {
    return StyleSheet.create({
        safeContainer: { flex: 1 },
        mainWrapper: { flex: 1, flexDirection: isMobile ? 'column' : 'row' },
        contentColumn: { flex: 1, padding: 10 },
        filtersColumn: { width: 320, borderLeftWidth: 1 },
        scrollContent: { paddingBottom: 100 },
        manualSaveButton: { marginTop: 20, backgroundColor: '#4CAF50' },
        menuButton: { backgroundColor: '#6aaaaa' },
    });
}
