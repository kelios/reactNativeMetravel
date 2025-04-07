import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Dimensions,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { useDropzone } from 'react-dropzone';
import { uploadImage } from "@/src/api/travels";
import { FontAwesome } from '@expo/vector-icons';

interface ImageUploadComponentProps {
    collection: string;
    idTravel: string;
    oldImage?: string;
    onUpload?: (imageUrl: string) => void;
}

const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({ collection, idTravel, oldImage, onUpload }) => {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (oldImage && !imageUri) {
            setImageUri(oldImage);
        }
    }, [oldImage]);

    const handleUploadImage = async (file: File | { uri: string; name: string; type: string }) => {
        try {
            setLoading(true);
            setUploadMessage(null);

            const formData = new FormData();

            if (Platform.OS === 'web' && file instanceof File) {
                formData.append('file', file);
            } else {
                const rnFile = file as { uri: string; name: string; type: string };
                formData.append('file', {
                    uri: rnFile.uri,
                    name: rnFile.name,
                    type: rnFile.type,
                } as any);
            }

            formData.append('collection', collection);
            formData.append('id', idTravel);

            const response = await uploadImage(formData);

            if (response?.url) {
                setImageUri(response.url);
                setUploadMessage('Фотография успешно загружена');
                onUpload?.(response.url);
            } else {
                setUploadMessage('Ошибка при загрузке');
            }
        } catch (error) {
            console.error('Ошибка при загрузке:', error);
            setUploadMessage('Произошла ошибка при загрузке');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = () => {
        ImagePicker.launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (response) => {
            if (response.didCancel || response.errorCode) return;

            const asset = response.assets?.[0];
            if (!asset?.uri) return;

            await handleUploadImage({
                uri: asset.uri,
                name: asset.fileName || 'photo.jpg',
                type: asset.type || 'image/jpeg',
            });
        });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            await handleUploadImage(file);
        },
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.heic', '.heif'] },
    });

    return (
        <View style={styles.container}>
            {Platform.OS === 'web' ? (
                <div {...getRootProps()} style={isDragActive ? styles.dropzoneActive : styles.dropzone}>
                    <input {...getInputProps()} />
                    {loading ? (
                        <ActivityIndicator size="large" color="#D67F4A" />
                    ) : imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.image} />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <FontAwesome name="cloud-upload" size={50} color="#A45D37" />
                            <Text style={styles.placeholderText}>Перетащите сюда изображение</Text>
                            <Text style={styles.placeholderSubtext}>или нажмите для выбора файла</Text>
                        </View>
                    )}
                </div>
            ) : (
                <>
                    <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <FontAwesome name="cloud-upload" size={18} color="#fff" />
                                <Text style={styles.uploadButtonText}>{imageUri ? 'Заменить фото' : 'Загрузить фото'}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
                </>
            )}

            {uploadMessage && <Text style={styles.uploadMessage}>{uploadMessage}</Text>}
        </View>
    );
};

const { width } = Dimensions.get('window');
const colors = {
    primary: '#D67F4A',
    text: '#4B4B4B',
    border: '#DDDDDD',
    background: '#F9F9F9',
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    dropzone: {
        width: '100%',
        height: 180,
        borderWidth: 2,
        borderColor: '#D67F4A',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        backgroundColor: '#fdf8f5',
        outline: 'none', // убираем браузерный outline
        overflow: 'hidden',
    },
    dropzoneActive: {
        backgroundColor: '#fff0e6',
        borderColor: '#A45D37',
    },
    uploadButton: {
        backgroundColor: '#D67F4A',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    uploadButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    imageContainer: {
        width: '100%',
        position: 'relative',
        marginTop: 8,
        borderRadius: 12,
        overflow: 'hidden', // чтобы сообщение не выходило за края
        borderWidth: 1,
        borderColor: '#ddd',
    },
    image: {
        width: '100%',
        aspectRatio: 1,
        objectFit: 'cover', // обрезка при необходимости
    },
    placeholderContainer: {
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#4B4B4B',
    },
    placeholderSubtext: {
        fontSize: 14,
        color: '#888',
    },
    uploadMessage: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        fontSize: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
});


export default ImageUploadComponent;
