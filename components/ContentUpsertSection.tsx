import React from 'react';
import {View, SafeAreaView, StyleSheet} from 'react-native';
import {TravelFormData, MarkerData} from '@/src/types/types';
import TextInputComponent from '@/components/TextInputComponent';
import YoutubeLinkComponent from '@/components/YoutubeLinkComponent';
import WebMapComponent from '@/components/WebMapComponent';
import ArticleEditor from '@/components/ArticleEditor';
import {UPLOAD_IMAGE} from '@/src/api/travels';

interface ContentUpsertSectionProps {
    formData: TravelFormData;
    setFormData: (data: TravelFormData) => void;
    markers: MarkerData[];
    setMarkers: (data: MarkerData[]) => void;
}

const ContentUpsertSection: React.FC<ContentUpsertSectionProps> = ({formData, setFormData, markers, setMarkers}) => {
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
            coordsMeTravel: updatedMarkers.map(marker => ({
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

    return (
        <View style={styles.contentContainer}>
            <TextInputComponent
                label="Название"
                value={formData.name}
                onChange={(value) => handleChange('name', value)}
            />
            <YoutubeLinkComponent
                label="Ссылка на Youtube"
                value={formData.youtubeLink}
                onChange={(value) => handleChange('youtubeLink', value)}
            />
            <WebMapComponent
                markers={markers}
                onMarkersChange={handleMarkersChange}
                categoryTravelAddress={formData.coordsMeTravel}
                countrylist={formData.countries}
            />
            <SafeAreaView>
                <ArticleEditor
                    label="Описание"
                    height={400}
                    content={formData.description}
                    onChange={(newContent: any) => handleChange('description', newContent)}
                    uploadUrl={UPLOAD_IMAGE}
                />
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 10,
    },
});

export default ContentUpsertSection;
