import React, { useCallback, useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    Dimensions,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Snackbar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';

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

    // --- ЛОГИКА СОХРАНЕНИЯ ---

    const saveFormDataWithId = async (data: TravelFormData): Promise<TravelFormData> => {
        const savedData = await saveFormData(cleanEmptyFields({ ...data, id: data.id || null }));
        return savedData;
    };

    const { resetOriginalData } = useAutoSaveForm(formData, {
        debounce: 5000,
        onSave: saveFormDataWithId,
        onSuccess: (savedData) => {
            applySavedData(savedData);
            if (isNew && savedData.id) {
                router.replace(`/travel/${savedData.id}`);
            }
            showSnackbar('Автосохранение прошло успешно!');
        },
        onError: () => {
            showSnackbar('Ошибка автосохранения');
        },
    });

    // --- ЗАГРУЗКА ДАННЫХ ---
    useEffect(() => {
        getFilters();
        getFiltersCountry();

        if (!isNew) {
            loadTravelData(id as string);
        }
    }, [id, isNew]);

    const loadTravelData = async (travelId: string) => {
        const travelData = await fetchTravel(Number(travelId));
        setTravelDataOld(travelData);

        const transformed = transformTravelToFormData(travelData);
        setFormData(transformed);
        setMarkers(transformed.coordsMeTravel || []);

        resetOriginalData(transformed);
    };

    // --- РУЧНОЕ СОХРАНЕНИЕ ---
    const handleManualSave = async () => {
        try {
            const savedData = await saveFormDataWithId(formData);
            applySavedData(savedData);

            if (isNew && savedData.id) {
                router.replace(`/travel/${savedData.id}`);
            }

            showSnackbar('Сохранение прошло успешно!');
        } catch (error) {
            showSnackbar('Ошибка сохранения');
        }
    };

    const applySavedData = (savedData: TravelFormData) => {
        setFormData(savedData);
        setMarkers(savedData.coordsMeTravel || []);
        resetOriginalData(savedData);
    };

    // --- ФИЛЬТРЫ ---
    const getFilters = async () => {
        if (isLoadingFilters) return;
        setIsLoadingFilters(true);
        const data = await fetchFilters();
        setFilters((prev) => ({ ...prev, ...data }));
        setIsLoadingFilters(false);
    };

    const getFiltersCountry = async () => {
        if (isLoadingFilters) return;
        setIsLoadingFilters(true);
        const countries = await fetchFiltersCountry();
        setFilters((prev) => ({ ...prev, countries }));
        setIsLoadingFilters(false);
    };

    // --- UI ---
    const toggleMenu = useCallback(() => {
        setMenuVisible((prev) => !prev);
    }, []);

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {isNew ? 'Создание нового путешествия' : 'Редактирование путешествия'}
                </Text>
                <Button
                    mode="contained"
                    icon="content-save"
                    onPress={handleManualSave}
                    style={styles.topSaveButton}
                >
                    Сохранить сейчас
                </Button>
            </View>

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
                        {menuVisible ? 'Скрыть фильтры' : 'Показать фильтры'}
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

            <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
                {snackbarMessage}
            </Snackbar>
        </SafeAreaView>
    );
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
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
    return { ...getEmptyFormData(String(travel.id)), ...travel };
}

function cleanEmptyFields(obj: any): any {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, value === '' ? null : value]));
}


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

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    topSaveButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        elevation: 3,
    },
    mainWrapper: {
        flex: 1,
        flexDirection: Dimensions.get('window').width <= 768 ? 'column' : 'row',
    },
    contentColumn: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    filtersColumn: {
        width: 320,
        backgroundColor: '#fff',
        borderLeftWidth: 1,
        borderColor: '#ddd',
        padding: 10,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    mobileFiltersWrapper: {
        backgroundColor: '#fff',
        padding: 10,
    },
    menuButton: {
        backgroundColor: '#6aaaaa',
        borderRadius: 8,
    },
    snackbar: {
        backgroundColor: '#323232',
    },
});

