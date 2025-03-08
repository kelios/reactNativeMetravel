import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Platform,
    useColorScheme,
} from 'react-native';
import { useDropzone } from 'react-dropzone';
import ConfirmDialog from '@/components/ConfirmDialog';
import { uploadImage, deleteImage } from '@/src/api/travels';

// Тип данных изображения
interface GalleryItem {
    id: string;
    url: string;
}

// Пропсы для галереи
interface ImageGalleryComponentProps {
    collection: string;
    idTravel: string;
    initialImages: GalleryItem[];
    maxImages?: number;
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
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

    const theme = useColorScheme();
    const isDarkMode = theme === 'dark';

    // Загрузка начальных изображений
    useEffect(() => {
        if (initialImages && initialImages.length > 0) {
            setImages(initialImages);
            setLoading(initialImages.map(() => false));
        }
        setIsInitialLoading(false);
    }, [initialImages]);

    // Загрузка новых изображений
    const handleUploadImages = useCallback(
        async (files: File[]) => {
            if (images.length + files.length > maxImages) {
                console.warn(`Максимум можно загрузить ${maxImages} изображений.`);
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

                    if (response?.url) {
                        setImages((prev) => [...prev, { id: response.id, url: response.url }]);
                    } else {
                        console.warn('Ошибка загрузки изображения.');
                    }
                } catch {
                    console.warn('Ошибка при загрузке изображения.');
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

    // Настройка Drag & Drop (только Web)
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': [] },
        multiple: true,
        disabled: Platform.OS !== 'web',
        onDrop: (acceptedFiles) => handleUploadImages(acceptedFiles),
    });

    // Подготовка к удалению
    const handleDeleteImage = (imageId: string) => {
        setSelectedImageId(imageId);
        setDialogVisible(true);
    };

    // Удаление изображения после подтверждения
    const confirmDeleteImage = async () => {
        if (!selectedImageId) return;

        console.log(`Удаление изображения: ${selectedImageId}`);
        try {
            await deleteImage(selectedImageId);

            setImages((prev) => prev.filter((img) => img.id !== selectedImageId));

        } catch (error) {
            console.error('Ошибка удаления:', error);
        } finally {
            setDialogVisible(false);
            setSelectedImageId(null);
        }
    };

    return (
        <View style={[styles.container, isDarkMode && styles.darkContainer]}>
            <View style={styles.headerContainer}>
                <Text style={styles.galleryTitle}>📷 Галерея</Text>

                <Text style={styles.imageCount}>
                    Загружено <Text style={styles.highlight}>{images.length}</Text> из {maxImages} изображений
                </Text>
            </View>

            {Platform.OS === 'web' && (
                <View
                    {...getRootProps()}
                    style={[
                        styles.dropzone,
                        isDragActive && styles.activeDropzone,
                        isDarkMode && styles.darkDropzone,
                    ]}
                >
                    <input {...getInputProps()} />
                    <Text style={[styles.dropzoneText, isDarkMode && styles.darkText]}>
                        {isDragActive ? 'Отпустите файлы...' : 'Перетащите сюда изображения'}
                    </Text>
                </View>
            )}

            {isInitialLoading ? (
                <ActivityIndicator size="large" color="#4b7c6f" style={styles.loader} />
            ) : images.length > 0 ? (
                <View style={styles.galleryGrid}>
                    {images.map((image, index) => (
                        <View key={image.id} style={styles.imageWrapper}>
                            {loading[index] ? (
                                <ActivityIndicator size="large" color="#ffffff" />
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
                </View>
            ) : (
                <Text style={[styles.noImagesText, isDarkMode && styles.darkText]}>
                    Нет загруженных изображений
                </Text>
            )}

            {isUploading && (
                <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles.uploadingText}>Загружаются изображения...</Text>
                </View>
            )}

            <ConfirmDialog
                visible={dialogVisible}
                onClose={() => setDialogVisible(false)}
                onConfirm={confirmDeleteImage}
                title="Удаление изображения"
                message="Вы уверены, что хотите удалить это изображение?"
                confirmText="Удалить"
                cancelText="Отмена"
            />
        </View>
    );
};

export default ImageGalleryComponent;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        width: '100%',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    galleryTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    galleryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12, // Добавили отступ между изображениями
    },
    imageWrapper: {
        width: '30%', // Теперь 3 изображения в ряд
        aspectRatio: 1,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        borderRadius: 12,
        width: 20, // Уменьшили кнопку
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 12, // Уменьшили текст крестика
    },
    dropzone: {
        width: '100%',
        padding: 16,
        borderWidth: 2,
        borderRadius: 10,
        borderColor: '#4b7c6f',
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        marginBottom: 20, // Отделили от галереи
    },
    imageCount: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
});

