import React from 'react';
import { View, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { TravelFormData, MarkerData } from '@/src/types/types';
import TextInputComponent from '@/components/TextInputComponent';
import YoutubeLinkComponent from '@/components/YoutubeLinkComponent';
import WebMapComponent from '@/components/WebMapComponent';
import ArticleEditor from '@/components/ArticleEditor';
import { UPLOAD_IMAGE } from '@/src/api/travels';

interface ContentUpsertSectionProps {
    formData: TravelFormData;
    setFormData: (data: TravelFormData) => void;
    markers: MarkerData[];
    setMarkers: (data: MarkerData[]) => void;
    filters: any;
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
    const handleChange = (name: keyof TravelFormData, value: any) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleMarkersChange = (updatedMarkers: MarkerData[]) => {
        setMarkers(updatedMarkers);
        setFormData((prevData) => ({
            ...prevData,
            coordsMeTravel: updatedMarkers.map((marker) => ({
                id: marker.id,
                lat: marker.lat,
                lng: marker.lng,
                country: marker.country,
                city: marker.city,
                address: marker.address,
                categories: marker.categories,
                image: marker.image,
            })),
        }));
    };

    // Функция для рендеринга ArticleEditor
    const renderArticleEditor = (label: string, content: string, onChange: (content: string) => void) => {
        return (
            <View style={styles.editorContainer}>
                <ArticleEditor
                    label={label}
                    height={400}
                    content={content}
                    idTravel={formData?.id}
                    onChange={onChange}
                    uploadUrl={UPLOAD_IMAGE}
                />
            </View>
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
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
                    countrylist={filters.countries}
                />
            </View>

            <View style={styles.section}>
                {renderArticleEditor('Описание', formData.description, (newContent) =>
                    handleChange('description', newContent))
                }
            </View>

            <View style={styles.section}>
                {renderArticleEditor('Плюсы', formData.plus, (newContent) =>
                    handleChange('plus', newContent))
                }
            </View>

            <View style={styles.section}>
                {renderArticleEditor('Минусы', formData.minus, (newContent) =>
                    handleChange('minus', newContent))
                }
            </View>

            <View style={styles.section}>
                {renderArticleEditor('Рекомендации', formData.recommendation, (newContent) =>
                    handleChange('recommendation', newContent))
                }
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    section: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    editorContainer: {
        marginTop: 10,
    },
});

export default ContentUpsertSection;