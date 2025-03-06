import React, { useCallback, useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    Dimensions,
    Alert,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Snackbar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    fetchFilters,
    fetchFiltersCountry,
    fetchTravel,
    saveFormData,
} from '@/src/api/travels';
import { TravelFormData, MarkerData, Travel } from '@/src/types/types';

import FiltersUpsertComponent from '@/components/FiltersUpsertComponent';
import ContentUpsertSection from '@/components/ContentUpsertSection';
import GallerySection from '@/components/GallerySection';

import { useAutoSaveForm } from '@/hooks/useAutoSaveForm';

export default function UpsertTravel() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isNew = !id;

    const windowWidth = Dimensions.get('window').width;
    const isMobile = windowWidth <= 768;

    const [menuVisible, setMenuVisible] = useState(!isMobile);
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [travelDataOld, setTravelDataOld] = useState<Travel | null>(null);
    const [filters, setFilters] = useState(initFilters());
    const [formData, setFormData] = useState<TravelFormData>(getEmptyFormData(isNew ? null : String(id)));
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    const saveFormDataWithId = async (data: TravelFormData) => {
        return await saveFormData(cleanEmptyFields({ ...data, id: data.id || null }));
    };

    const applySavedData = (savedData: TravelFormData) => {
        setFormData(savedData);
        setMarkers(savedData.coordsMeTravel || []);
        resetOriginalData(savedData);
    };

    const { resetOriginalData } = useAutoSaveForm(formData, {
        debounce: 5000,
        onSave: saveFormDataWithId,
        onSuccess: applySavedData,
        onError: () => showSnackbar('Ошибка автосохранения'),
    });

    useEffect(() => {
        const loadSuperuserFlag = async () => {
            const flag = await AsyncStorage.getItem('isSuperuser');
            setIsSuperAdmin(flag === 'true');
        };
        loadSuperuserFlag();
        fetchFilters().then(setFilters);
        fetchFiltersCountry().then(countries => setFilters(prev => ({ ...prev, countries })));
        if (!isNew) loadTravelData(id as string);
    }, [id, isNew]);

    const validateYear = (year: string) => {
        const currentYear = new Date().getFullYear();
        const parsedYear = parseInt(year, 10);
        return parsedYear >= 1900 && parsedYear <= currentYear + 1;
    };

    const validateForm = () => {
        if (!validateYear(formData.year)) {
            showSnackbar('Год должен быть от 1900 до ' + (new Date().getFullYear() + 1));
            return false;
        }
        if (formData.number_days && Number(formData.number_days) > 365) {
            showSnackbar('Максимальная длительность — 365 дней');
            return false;
        }
        return true;
    };

    const handleManualSave = async () => {
        if (!validateForm()) return;
        try {
            const savedData = await saveFormDataWithId(formData);
            applySavedData(savedData);
            if (isNew && savedData.id) router.replace(`/travel/${savedData.id}`);
            showSnackbar('Сохранено успешно!');
        } catch {
            showSnackbar('Ошибка сохранения');
        }
    };

    const loadTravelData = async (travelId: string) => {
        const travelData = await fetchTravel(Number(travelId));
        const transformed = transformTravelToFormData(travelData);
        setTravelDataOld(travelData);
        setFormData(transformed);
        setMarkers(transformed.coordsMeTravel || []);
        resetOriginalData(transformed);
    };

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


    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={[styles.mainWrapper, isMobile && styles.mainWrapperMobile]}>
                <ScrollView style={styles.contentColumn}>
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

                {isMobile ? (
                    <View style={styles.mobileFiltersWrapper}>
                        <Button onPress={() => setMenuVisible(!menuVisible)}>Фильтры</Button>
                        {menuVisible && <ScrollView style={{ maxHeight: '60vh' }}><FiltersUpsertComponent {...{ filters, travelDataOld, formData, setFormData, isSuperAdmin, onSave: handleManualSave }} /></ScrollView>}
                    </View>
                ) : (
                    <View style={styles.filtersColumn}><FiltersUpsertComponent {...{ filters, travelDataOld, formData, setFormData, isSuperAdmin, onSave: handleManualSave }} /></View>
                )}
            </View>

            {isMobile && (
                <View style={styles.mobileActionBar}>
                    <Button
                        mode="contained"
                        icon="content-save"
                        onPress={handleManualSave}
                        style={styles.saveButtonMobile}
                    >
                        Сохранить
                    </Button>
                </View>
            )}

            <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)}>{snackbarMessage}</Snackbar>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: '#f9f9f9' },
    header: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#ddd' },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    brandPlaceholder: { flex: 1 }, // Здесь может быть логотип или меню
    saveButtonDesktop: { backgroundColor: '#f5a623' },
    saveButtonMobile: { backgroundColor: '#f5a623', width: '100%' },
    mainWrapper: { flex: 1, flexDirection: 'row' },
    mainWrapperMobile: { flexDirection: 'column' },
    contentColumn: { flex: 1 },
    filtersColumn: { width: 320, borderLeftWidth: 1, padding: 12, borderColor: '#ddd' },
    mobileFiltersWrapper: { padding: 12 },
    mobileActionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 8,
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
});

function initFilters() {
    return {
        countries: [],
        categories: [],
        companions: [],
        complexity: [],
        month: [],
        over_nights_stay: [],
        transports: [],
        categoryTravelAddress: [],
    };
}

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
        moderation: false,
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
    return { ...getEmptyFormData(String(travel.id)), ...travel };
}

function cleanEmptyFields(obj: any): any {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, value === '' ? null : value]));
}
