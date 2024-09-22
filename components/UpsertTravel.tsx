import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View, Dimensions, ActivityIndicator, TouchableOpacity, Text} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {fetchFilters, fetchFiltersCountry, fetchTravel, saveFormData} from "@/src/api/travels";
import {TravelFormData, MarkerData, Travel} from "@/src/types/types";
import {useLocalSearchParams} from "expo-router";
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

    const {id} = useLocalSearchParams();
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
    });

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
                ...travelData,
            });
            setMarkers(travelData.coordsMeTravel || []);
        } catch (error) {
            console.error('Ошибка при загрузке данных путешествия:', error);
        }
    };

    const handleAutoSave = async () => {
        try {
            setIsSaving(true);
            const savedData = await saveFormDataWithId(formData);
            if (!formData.id && savedData.id) {
                setFormData((prevData) => ({...prevData, id: savedData.id}));
            }
            setMarkers(savedData.coordsMeTravel);
        } catch (error) {
            console.error('Ошибка при автосохранении:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const saveFormDataWithId = async (data: TravelFormData): Promise<TravelFormData> => {
        return await saveFormData({...data, id: data.id || null});
    };

    const getFilters = useCallback(async () => {
        if (isLoadingFilters) return;
        setIsLoadingFilters(true);
        const newData = await fetchFilters();
        setFilters((prevFilters) => ({
            ...prevFilters,
            ...newData,
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

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.formSection}>
                {isSaving && <ActivityIndicator size="small" color="#ff6347" />}
                <View style={styles.formRow}>
                    <ContentUpsertSection formData={formData} setFormData={setFormData} markers={markers} setMarkers={setMarkers} />
                    {!isMobile && <FiltersUpsertComponent filters={filters} travelDataOld={travelDataOld} formData={formData} setFormData={setFormData} />}
                </View>
                {isMobile && (
                    <>
                        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
                            <Text style={styles.menuButtonText}>{menuVisible ? 'Скрыть фильтры' : 'Показать фильтры'}</Text>
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
            shadowOffset: {width: 0, height: 2},
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
