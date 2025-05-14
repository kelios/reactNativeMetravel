import React, { useCallback } from 'react';
import { View, SafeAreaView, StyleSheet, ScrollView, Text } from 'react-native';
import { TravelFormData, MarkerData } from '@/src/types/types';
import TextInputComponent from '@/components/TextInputComponent';
import YoutubeLinkComponent from '@/components/YoutubeLinkComponent';
import WebMapComponent from '@/components/travel/WebMapComponent';
import ArticleEditor from '@/components/ArticleEditor';
import { UPLOAD_IMAGE } from '@/src/api/travels';

interface Filters {
    categoryTravelAddress: any[];
    countries: any[];
}

interface ContentUpsertSectionProps {
    formData: TravelFormData;
    setFormData: (data: TravelFormData) => void;
    markers: MarkerData[];
    setMarkers: (data: MarkerData[]) => void;
    filters: Filters;
    handleCountrySelect: (countryId: string) => void;
    handleCountryDeselect: (countryId: string) => void;
}

const ContentUpsertSection: React.FC<ContentUpsertSectionProps> = ({
                                                                       formData,
                                                                       setFormData,
                                                                       markers,
                                                                       setMarkers,
                                                                       filters,
                                                                       handleCountrySelect,
                                                                       handleCountryDeselect,
                                                                   }) => {
    const handleChange = useCallback(<T extends keyof TravelFormData>(
        name: T,
        value: TravelFormData[T]
    ) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    }, [setFormData]);

    const handleMarkersChange = useCallback((updatedMarkers: MarkerData[]) => {
        setMarkers(updatedMarkers);
        setFormData(prevData => ({
            ...prevData,
            coordsMeTravel: updatedMarkers.map(marker => ({
                id: marker.id,
                lat: marker.lat,
                lng: marker.lng,
                country: marker.country,
                address: marker.address,
                categories: marker.categories,
                image: marker.image,
            })),
        }));
    }, [setMarkers, setFormData]);

    const renderEditorSection = useCallback((
        title: string,
        content: string,
        onChange: (val: string) => void
    ) => (
        <View style={styles.sectionEditor}>

            <ArticleEditor
                key={`${title}-${formData.id}`}
                content={content ?? ''}
                onChange={onChange}
                uploadUrl={UPLOAD_IMAGE}
                idTravel={formData.id}
                label={title}
            />
        </View>
    ), [formData.id]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <TextInputComponent
                        label="Название"
                        value={formData.name}
                        onChange={(value) => handleChange('name', value)}
                    />
                </View>

                <View style={styles.section}>
                    <YoutubeLinkComponent
                        label="Ссылка на Youtube"
                        value={formData.youtube_link}
                        onChange={(value) => handleChange('youtube_link', value)}
                    />
                </View>

                <View style={styles.section}>
                    <WebMapComponent
                        markers={markers || []}
                        onMarkersChange={handleMarkersChange}
                        onCountrySelect={handleCountrySelect}
                        onCountryDeselect={handleCountryDeselect}
                        categoryTravelAddress={filters.categoryTravelAddress}
                        countrylist={filters.countries || []}
                    />
                </View>

                {renderEditorSection('Описание', formData.description, (val) => handleChange('description', val))}
                {renderEditorSection('Плюсы', formData.plus, (val) => handleChange('plus', val))}
                {renderEditorSection('Минусы', formData.minus, (val) => handleChange('minus', val))}
                {renderEditorSection('Рекомендации', formData.recommendation, (val) => handleChange('recommendation', val))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#eee',
    },
    sectionEditor: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#eee',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
});

export default React.memo(ContentUpsertSection);