import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { useDropzone } from 'react-dropzone';
import { uploadImage, deleteImage } from '@/src/api/travels';

// Тип для одного изображения в галерее
interface GalleryItem {
    id: string;
    url: string;
}

interface ImageGalleryComponentProps {
    collection: string;      // Название коллекции (например, "gallery")
    idTravel: string;        // ID путешествия
    initialImages: GalleryItem[];  // Начальные изображения
    maxImages?: number;      // Максимальное число изображений (по умолч. 10)
}

const ImageGalleryComponent: React.FC<ImageGalleryComponentProps> = ({
                                                                         collection,
                                                                         idTravel,
                                                                         initialImages,
                                                                         maxImages = 10,
                                                                     }) => {
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState<boolean[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

    /**
     * -------------------------
     *  1. ЗАГРУЗКА НАЧАЛЬНЫХ ИЗОБРАЖЕНИЙ
     * -------------------------
     */
    useEffect(() => {
        if (initialImages && initialImages.length > 0) {
            setImages(initialImages);
            // Массив "loading" для каждого изображения
            const initialLoadingState = initialImages.map(() => false);
            setLoading(initialLoadingState);
        }
        setIsInitialLoading(false);
    }, [initialImages]);

    /**
     * -------------------------
     *  2. UPLOAD ЧЕРЕЗ REACT-DROPZONE (WEB)
     * -------------------------
     * Принимаем файлы и отправляем их на сервер.
     */
    const handleUploadImages = useCallback(
        async (files: File[]) => {
            // Проверка лимита
            if (images.length + files.length > maxImages) {
                Alert.alert(
                    'Ошибка',
                    `Максимум можно загрузить ${maxImages} изображений.`
                );
                return;
            }

            setIsUploading(true);

            const newLoading = [...loading];

            // Загружаем файлы последовательно или параллельно
            const uploads = files.map(async (file, index) => {
                const currentIndex = images.length + index;
                newLoading[currentIndex] = true;
                setLoading([...newLoading]);

                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('collection', collection);
                    formData.append('id', idTravel);

                    // uploadImage должен вернуть { id: string, url: string } при успехе
                    const response = await uploadImage(formData);

                    if (response?.url) {
                        setImages((prev) => [
                            ...prev,
                            { id: response.id, url: response.url },
                        ]);
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
        },
        [images, loading, collection, idTravel, maxImages]
    );

    /**
     * -------------------------
     *  3. ИНИЦИАЛИЗАЦИЯ useDropzone (ТОЛЬКО WEB)
     * -------------------------
     * На мобильных платформах drag&drop не работает, поэтому
     * стоит либо скрывать этот блок, либо использовать file picker.
     */
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': [] },
        multiple: true,
        disabled: Platform.OS !== 'web', // отключаем dnd, если не web
        onDrop: (acceptedFiles) => {
            // acceptedFiles — это тип File[] (только на web)
            handleUploadImages(acceptedFiles);
        },
    });

    /**
     * -------------------------
     *  4. УДАЛЕНИЕ ИЗОБРАЖЕНИЯ
     * -------------------------
     */
    const handleDeleteImage = async (imageId: string) => {
        try {
            await deleteImage(imageId);
            setImages((prevImages) => prevImages.filter((img) => img.id !== imageId));
        } catch (error) {
            Alert.alert('Ошибка', 'Ошибка удаления изображения.');
        }
    };

    /**
     * -------------------------
     *  RENDER
     * -------------------------
     */
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Галерея</Text>
            <Text style={styles.galleryTitle}>
                Загружено {images.length} из {maxImages} изображений
            </Text>

            {/* Dropzone (только на web). На мобильных можно скрыть */}
            {Platform.OS === 'web' && (
                <View
                    {...getRootProps()}
                    style={[
                        styles.dropzone,
                        isDragActive && { borderColor: '#66cdaa' },
                    ]}
                >
                    <input {...getInputProps()} />
                    <Text style={styles.dropzoneText}>
                        {isDragActive
                            ? 'Отпустите файлы здесь...'
                            : 'Перетащите сюда изображения или нажмите для выбора'}
                    </Text>
                </View>
            )}

            {isInitialLoading ? (
                <ActivityIndicator size="large" color="#4b7c6f" style={styles.loader} />
            ) : images.length > 0 ? (
                <View style={styles.galleryWrapper}>
                    <ScrollView
                        contentContainerStyle={styles.imageContainer}
                        nestedScrollEnabled
                    >
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
                                        <TouchableOpacity
                                            onPress={() => handleDeleteImage(image.id)}
                                            style={styles.deleteButton}
                                        >
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

            {/* Общий лоадер, если идёт массовая загрузка */}
            {isUploading && (
                <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color="#4b7c6f" />
                    <Text style={styles.uploadingText}>Загружаются изображения...</Text>
                </View>
            )}
        </View>
    );
};

export default ImageGalleryComponent;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 20,
        position: 'relative',
    },
    label: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#4b7c6f',
    },
    galleryTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#4b7c6f',
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
        cursor: 'pointer', // web-стиль
    },
    dropzoneText: {
        color: '#4b7c6f',
        fontSize: 16,
        textAlign: 'center',
    },
    loader: {
        marginTop: 20,
    },
    galleryWrapper: {
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
        position: 'relative',
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    imageWrapper: {
        width: '48%',
        aspectRatio: 1,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#4b7c6f',
        borderRadius: 10,
        backgroundColor: '#fff',
        position: 'relative',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        resizeMode: 'cover',
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
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
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
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
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
