import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useDropzone } from 'react-dropzone';
import { uploadImage, deleteImage } from '@/src/api/travels'; // Не забудьте добавить ваш путь к API

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

const ImageGalleryComponent: React.FC<GalleryUploadComponentProps> = ({
                                                                          collection,
                                                                          idTravel,
                                                                          initialImages,
                                                                          maxImages = 10,
                                                                      }) => {
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState<boolean[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

    // Загрузка начальных изображений
    useEffect(() => {
        if (initialImages && initialImages.length > 0) {
            setImages(initialImages);
            const initialLoadingState = initialImages.map(() => false);
            setLoading(initialLoadingState);
        }
        setIsInitialLoading(false);
    }, [initialImages]);

    // Лимит изображений
    const handleUploadImages = async (files: File[]) => {
        if (images.length + files.length > maxImages) {
            Alert.alert('Ошибка', `Максимум можно загрузить ${maxImages} изображений.`);
            return;
        }

        setIsUploading(true);
        const newLoading = [...loading];

        const uploads = files.map(async (file, index) => {
            const currentIndex = images.length + index;
            newLoading[currentIndex] = true;
            setLoading([...newLoading]);

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('collection', collection);
                formData.append('id', idTravel);

                const response = await uploadImage(formData);

                if (response.url) {
                    setImages((prev) => [...prev, { id: response.id, url: response.url }]);
                } else {
                    Alert.alert('Ошибка', 'Не удалось загрузить изображение.');
                }
            } catch (error) {
                Alert.alert('Ошибка', 'Ошибка загрузки изображения.');
            } finally {
                newLoading[currentIndex] = false;
                setLoading([...newLoading]);
            }
        });

        await Promise.all(uploads);
        setIsUploading(false);
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        multiple: true,
        onDrop: (acceptedFiles) => {
            handleUploadImages(acceptedFiles);
        },
    });

    // Удаление изображения
    const handleDeleteImage = async (imageId: string) => {
        try {
            await deleteImage(imageId);
            setImages((prevImages) => prevImages.filter((image) => image.id !== imageId));
        } catch (error) {
            Alert.alert('Ошибка', 'Ошибка удаления изображения.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Галерея</Text>
            <Text style={styles.galleryTitle}>Загружено {images.length} из {maxImages} изображений</Text>

            <div {...getRootProps()} style={styles.dropzone}>
                <input {...getInputProps()} />
                <Text style={styles.dropzoneText}>Перетащите сюда изображения или нажмите для выбора</Text>
            </div>

            {isInitialLoading ? (
                <ActivityIndicator size="large" color="#4b7c6f" style={styles.loader} />
            ) : images.length > 0 ? (
                <View style={styles.galleryWrapper}>
                    <ScrollView contentContainerStyle={styles.imageContainer}>
                        {images.map((image, index) => (
                            <View key={image.id} style={styles.imageWrapper}>
                                {loading[index] ? (
                                    <View style={styles.loadingOverlay}>
                                        <ActivityIndicator size="large" color="#ffffff" />
                                        <Text style={styles.loadingText}>Загрузка...</Text>
                                    </View>
                                ) : (
                                    <>
                                        <Image source={{ uri: image.url }} style={styles.image} />
                                        <TouchableOpacity onPress={() => handleDeleteImage(image.id)} style={styles.deleteButton}>
                                            <Text style={styles.deleteButtonText}>✖</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            ) : (
                <Text style={styles.noImagesText}>Нет загруженных изображений</Text>
            )}

            {/* Общий лоадер для загрузки изображений */}
            {isUploading && (
                <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color="#4b7c6f" />
                    <Text style={styles.uploadingText}>Загружаются изображения...</Text>
                </View>
            )}
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,  // Контейнер будет занимать всю доступную высоту экрана
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 100,  // Увеличенный отступ снизу для избежания перекрытия футера
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
        marginBottom: 20,
        color: '#4b7c6f',
        textAlign: 'center',
    },
    galleryWrapper: {
        flex: 1,
        width: '100%',
        padding: 20,
        borderWidth: 2,
        borderColor: '#4b7c6f',
        borderRadius: 10,
        backgroundColor: '#f4f4f4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        marginBottom: 30,
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    imageWrapper: {
        width: '48%',  // Ширина изображения
        aspectRatio: 1,  // Устанавливаем соотношение сторон 1:1 (квадратное изображение)
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4b7c6f',
        borderRadius: 10,
        padding: 5,
        backgroundColor: '#fff',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        resizeMode: 'cover',  // Установлено cover для масштабирования изображения по контейнеру
    },
    deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(255, 0, 0, 0.7)',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
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
        textAlign: 'center',
    },
    loadingOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 10,
    },
    loadingText: {
        marginTop: 10,
        color: '#ffffff',
        fontSize: 14,
    },
    noImagesText: {
        color: '#4b7c6f',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    loader: {
        marginTop: 20,
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    uploadingText: {
        marginTop: 10,
        color: '#ffffff',
        fontSize: 16,
    },
});


export default ImageGalleryComponent;
