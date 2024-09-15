import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Platform, ScrollView, Dimensions } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { useDropzone } from 'react-dropzone';
import { uploadImage } from '@/src/api/travels';

interface GalleryUploadComponentProps {
    collection: string;
    idTravel: string;
    maxImages?: number;
}

const GalleryUploadComponent: React.FC<GalleryUploadComponentProps> = ({ collection,idTravel, maxImages = 10 }) => {
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean[]>(Array(maxImages).fill(false));
    const [uploadMessages, setUploadMessages] = useState<string[]>(Array(maxImages).fill(''));

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

            if (response?.data?.url) {
                setUploadMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[index] = 'Upload successful!';
                    return newMessages;
                });
                setImages((prev) => {
                    const newImages = [...prev];
                    newImages[index] = response.data.url;
                    return newImages;
                });
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

    // Drag-and-drop logic for web
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: async (acceptedFiles) => {
            const newImages = [...images];
            acceptedFiles.forEach((file, index) => {
                if (newImages.length < maxImages) {
                    const fileUri = URL.createObjectURL(file);
                    newImages.push(fileUri);
                    handleUploadImage(file, newImages.length - 1);
                }
            });
            setImages(newImages);
        },
        accept: 'image/*',
    });

    // Image picker logic for mobile
    const pickImages = () => {
        ImagePicker.launchImageLibrary({ mediaType: 'photo', selectionLimit: maxImages - images.length }, (response) => {
            if (response.assets && response.assets.length > 0) {
                const newImages = [...images];
                response.assets.forEach((asset, index) => {
                    if (newImages.length < maxImages) {
                        const file = {
                            uri: asset.uri,
                            name: asset.fileName,
                            type: asset.type,
                        };
                        newImages.push(asset.uri);
                        handleUploadImage(file, newImages.length - 1);
                    }
                });
                setImages(newImages);
            }
        });
    };

    const screenWidth = Dimensions.get('window').width;
    const isMobile = screenWidth <= 768;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Галерея</Text> {/* Добавленный заголовок */}
            <Text style={styles.galleryTitle}>Загружено {images.length} из {maxImages} изображений</Text>
            <View style={styles.galleryWrapper}>
                {Platform.OS === 'web' ? (
                    <div {...getRootProps({ className: 'dropzone' })} style={styles.dropzone}>
                        <input {...getInputProps()} />
                        <Text style={styles.placeholderText}>Перетащите сюда изображения или нажмите для выбора файлов</Text>
                    </div>
                ) : (
                    <TouchableOpacity style={styles.uploadButton} onPress={pickImages}>
                        <Text style={styles.buttonText}>Загрузить изображения</Text>
                    </TouchableOpacity>
                )}

                <ScrollView contentContainerStyle={styles.imageContainer}>
                    {images.map((uri, index) => (
                        <View key={index} style={styles.imageWrapper}>
                            {loading[index] ? (
                                <ActivityIndicator size="small" color="#0000ff" />
                            ) : (
                                <>
                                    <Image source={{ uri }} style={styles.image} />
                                    {uploadMessages[index] && <Text style={styles.uploadMessage}>{uploadMessages[index]}</Text>}
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
        marginBottom: 20, // Отступ снизу
    },
    dropzone: {
        width: '100%',
        minHeight: 150,
        borderWidth: 2,
        borderColor: '#4b7c6f',
        backgroundColor: '#dfe6e9',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',  // Обеспечивает перенос изображений на новую строку, если они не помещаются
        justifyContent: 'flex-start',
        marginTop: 20,
        marginBottom: 20,  // Отступ снизу для изображений
    },
    imageWrapper: {
        margin: 5,  // Обеспечивает отступы между изображениями
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
    placeholderText: {
        color: '#4b7c6f',
        fontSize: 16,
        textAlign: 'center',
    },
    uploadButton: {
        backgroundColor: '#4b7c6f',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    uploadMessage: {
        color: '#4b7c6f',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
});

export default GalleryUploadComponent;
