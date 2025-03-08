import React, { useCallback, useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    Dimensions,
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
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [travelDataOld, setTravelDataOld] = useState<Travel | null>(null);
    const [filters, setFilters] = useState(initFilters());
    const [formData, setFormData] = useState<TravelFormData>(getEmptyFormData(isNew ? null : String(id)));
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    const saveFormDataWithId = async (data: TravelFormData) => {
        const cleanedData = cleanEmptyFields({ ...data, id: data.id || null });
        return await saveFormData(cleanedData);
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
        let isMounted = true;

        const loadData = async () => {
            try {
                const flag = await AsyncStorage.getItem('isSuperuser');
                if (isMounted) setIsSuperAdmin(flag === 'true');

                const [filtersData, countryData] = await Promise.all([
                    fetchFilters(),
                    fetchFiltersCountry()
                ]);

                if (isMounted) {
                    setFilters(prev => ({
                        ...filtersData,
                        countries: countryData
                    }));
                }
            } catch (error) {
                console.error('Ошибка загрузки фильтров:', error);
            }
        };

        loadData();

        if (!isNew) {
            loadTravelData(id as string);
        }

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleManualSave = async () => {
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
                        {menuVisible && (
                            <ScrollView style={styles.filtersScroll}>
                                <FiltersUpsertComponent
                                    filters={filters}
                                    formData={formData}
                                    setFormData={setFormData}
                                    travelDataOld={travelDataOld}
                                    onClose={() => setMenuVisible(false)} // Закрываем боковую панель
                                    isSuperAdmin={isSuperAdmin}
                                    onSave={handleManualSave}
                                />
                            </ScrollView>
                        )}
                    </View>
                ) : (
                    <View style={styles.filtersColumn}>
                        <FiltersUpsertComponent
                            filters={filters}
                            formData={formData}
                            setFormData={setFormData}
                            travelDataOld={travelDataOld}
                            onClose={() => setMenuVisible(false)}
                            isSuperAdmin={isSuperAdmin}
                            onSave={handleManualSave}
                        />
                    </View>
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

                    <Button
                        mode="outlined"
                        icon="filter-outline"
                        onPress={() => setMenuVisible(!menuVisible)}
                        style={styles.filterButton}
                    >
                        Боковая панель
                    </Button>
                </View>
            )}

            <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)}>
                {snackbarMessage}
            </Snackbar>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: '#f9f9f9' },
    mainWrapper: { flex: 1, flexDirection: 'row' },
    mainWrapperMobile: { flexDirection: 'column' },
    contentColumn: { flex: 1 },
    filtersColumn: { width: 320, borderLeftWidth: 1, padding: 12, borderColor: '#ddd' },
    filtersScroll: { maxHeight: '80vh' },
    mobileFiltersWrapper: { padding: 12 },
    mobileActionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 12,
        borderTopWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    saveButtonMobile: {
        backgroundColor: '#f5a623',
        borderRadius: 50,
        minWidth: 150,
    },
    filterButton: {
        borderColor: '#007AFF',
        borderRadius: 50,
        minWidth: 100,
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
    return {
        ...getEmptyFormData(String(travel.id)),
        ...travel,
        moderation: travel.moderation ?? false,
        publish: travel.publish ?? false,
        visa: travel.visa ?? false,
    };
}

function cleanEmptyFields(obj: any): any {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
            if (value === '') return [key, null];
            if (value === false) return [key, false]; // специально сохраняем false
            return [key, value];
        })
    );
}
