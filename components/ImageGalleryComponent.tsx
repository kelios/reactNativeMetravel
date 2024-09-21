import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { uploadImage, deleteImage } from '@/src/api/travels';

interface Image {
    id: string;
    url: string;
}

interface GalleryUploadComponentProps {
    collection: string;
    idTravel: string;
    initialImages: Image[]; // Передаем уже загруженные изображения
    maxImages?: number;
}

const ImageGalleryComponent: React.FC<GalleryUploadComponentProps> = ({ collection, idTravel, initialImages, maxImages = 10 }) => {
    const [images, setImages] = useState<Image[]>(initialImages);
    const [loading, setLoading] = useState<boolean[]>(Array(maxImages).fill(false));
    const [uploadMessages, setUploadMessages] = useState<string[]>(Array(maxImages).fill(''));

    console.log(images);

    const handleUploadImage = async (file: any, index: number) => {
        try {
            setLoading((prev) => {
                const newLoading = [...prev];
                newLoading[index] = true;
                return newLoading;
            });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('collection', collection);
            formData.append('id', idTravel);

            const response = await uploadImage(formData);

            if (response.url) {
                setUploadMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[index] = 'Upload successful!';
                    return newMessages;
                });
                setImages((prev) => [...prev, { id: response.data.id, url: response.data.url }]);
            } else {
                setUploadMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[index] = 'Upload failed.';
                    return newMessages;
                });
            }
        } catch (error) {
            console.error(error);
            setUploadMessages((prev) => {
                const newMessages = [...prev];
                newMessages[index] = 'An error occurred during upload.';
                return newMessages;
            });
        } finally {
            setLoading((prev) => {
                const newLoading = [...prev];
                newLoading[index] = false;
                return newLoading;
            });
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        try {
            await deleteImage(imageId); // Отправляем запрос на удаление изображения по id
            setImages((prevImages) => prevImages.filter((image) => image.id !== imageId)); // Удаляем изображение из состояния
        } catch (error) {
            console.error('Ошибка при удалении изображения:', error);
        }
    };

    const screenWidth = Dimensions.get('window').width;
    const isMobile = screenWidth <= 768;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Галерея</Text>
            <Text style={styles.galleryTitle}>Загружено {images.length} из {maxImages} изображений</Text>
            <View style={styles.galleryWrapper}>
                <ScrollView contentContainerStyle={styles.imageContainer}>
                    {images.map((image, index) => (
                        <View key={image.id} style={styles.imageWrapper}>
                            {loading[index] ? (
                                <ActivityIndicator size="small" color="#0000ff" />
                            ) : (
                                <>
                                    <Image source={{ uri: image.url }} style={styles.image} />
                                    <TouchableOpacity onPress={() => handleDeleteImage(image.id)} style={styles.deleteButton}>
                                        <Text style={styles.deleteButtonText}>Удалить</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        width: '100%',
    },
    label: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#4b7c6f',
        textAlign: 'left',
        width: '100%',
    },
    galleryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#4b7c6f',
    },
    galleryWrapper: {
        width: '100%',
        padding: 15,
        borderWidth: 2,
        borderColor: '#4b7c6f',
        borderRadius: 10,
        backgroundColor: '#f4f4f4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        marginBottom: 20,
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginTop: 20,
    },
    imageWrapper: {
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4b7c6f',
        borderRadius: 10,
        padding: 5,
        backgroundColor: '#fff',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    deleteButton: {
        backgroundColor: '#ff6347',
        padding: 5,
        borderRadius: 5,
        marginTop: 5,
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ImageGalleryComponent;
