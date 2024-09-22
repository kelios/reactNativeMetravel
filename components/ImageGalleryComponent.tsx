import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useDropzone } from 'react-dropzone';
import { uploadImage, deleteImage } from '@/src/api/travels';

interface Image {
    id: string;
    url: string;
}

interface GalleryUploadComponentProps {
    collection: string;
    idTravel: string;
    initialImages: Image[];
    maxImages?: number;
}

const ImageGalleryComponent: React.FC<GalleryUploadComponentProps> = ({ collection, idTravel, initialImages, maxImages = 10 }) => {
    const [images, setImages] = useState<Image[]>(initialImages);
    const [loading, setLoading] = useState<boolean[]>(Array(maxImages).fill(false));
    const [uploadMessages, setUploadMessages] = useState<string[]>(Array(maxImages).fill(''));

    // Функция загрузки нескольких изображений
    const handleUploadImages = async (files: File[]) => {
        const newLoading = [...loading];
        const newUploadMessages = [...uploadMessages];

        // Обрабатываем каждое изображение по отдельности
        const uploads = files.map(async (file, index) => {
            try {
                newLoading[images.length + index] = true;
                setLoading(newLoading);

                const formData = new FormData();
                formData.append('file', file);
                formData.append('collection', collection);
                formData.append('id', idTravel);

                const response = await uploadImage(formData);

                if (response.url) {
                    newUploadMessages[images.length + index] = 'Upload successful!';
                    setImages((prev) => [...prev, { id: response.id, url: response.url }]);
                } else {
                    newUploadMessages[images.length + index] = 'Upload failed.';
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                newUploadMessages[images.length + index] = 'An error occurred during upload.';
            } finally {
                newLoading[images.length + index] = false;
                setLoading(newLoading);
                setUploadMessages(newUploadMessages);
            }
        });

        // Выполняем загрузку всех изображений
        await Promise.all(uploads);
    };

    // Используем useDropzone для загрузки файлов
    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        multiple: true, // Позволяем выбрать несколько файлов
        onDrop: (acceptedFiles) => {
            handleUploadImages(acceptedFiles); // Загружаем выбранные файлы
        },
    });

    // Функция для удаления изображения
    const handleDeleteImage = async (imageId: string) => {
        try {
            await deleteImage(imageId); // Удаляем изображение с сервера
            setImages((prevImages) => prevImages.filter((image) => image.id !== imageId)); // Убираем изображение из состояния
        } catch (error) {
            console.error('Ошибка при удалении изображения:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Галерея</Text>
            <Text style={styles.galleryTitle}>Загружено {images.length} из {maxImages} изображений</Text>

            {/* Область для перетаскивания изображений */}
            <div {...getRootProps()} style={styles.dropzone}>
                <input {...getInputProps()} />
                <Text style={styles.dropzoneText}>Перетащите сюда изображения или нажмите для выбора</Text>
            </div>

            <View style={styles.galleryWrapper}>
                {images.length === 0 ? (
                    <Text style={styles.noImagesText}>Нет загруженных изображений</Text>
                ) : (
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
                )}
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
    dropzone: {
        width: '100%',
        padding: 40,
        borderWidth: 2,
        borderRadius: 5,
        borderColor: '#4b7c6f',
        backgroundColor: '#f0f0f0',
        textAlign: 'center',
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropzoneText: {
        color: '#4b7c6f',
        fontSize: 16,
    },
    noImagesText: {
        color: '#4b7c6f',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default ImageGalleryComponent;
